import logging
import uuid
from django.db import IntegrityError, transaction, models
from rest_framework.exceptions import ValidationError
from typing import TypeVar, Any

T = TypeVar("T", bound=models.Model)

logger = logging.getLogger(__name__)


def create_single_image_job(
    *,
    job_model,
    owner_field: str,
    owner_instance,
    original_file,
    task,
    cancellation_msg: str = "Reemplazado por una nueva imagen.",
    duplicate_msg: str = "Ya existe una imagen en proceso.",
    conflict_msg: str = "Ya existe una imagen procesándose. Espera unos segundos.",
    extra_job_fields: dict[str, Any] | None = None,
) -> object:

    extra_job_fields = extra_job_fields or {}

    with transaction.atomic():

        active_job = (
            job_model.objects
            .select_for_update()
            .filter(**{
                owner_field: owner_instance,
                'status__in': [
                    job_model.Status.PENDING,
                    job_model.Status.PROCESSING,
                ],
            })
            .first()
        )

        if active_job:
            old_file_name = active_job.original.name

            try:
                active_job.mark_cancelled(cancellation_msg)
            except ValueError:
                raise ValidationError(conflict_msg)

            active_job.save_state()

            transaction.on_commit(
                lambda name=old_file_name: (
                    active_job.original.storage.delete(name)
                    if name else None
                )
            )

        try:
            job = job_model.objects.create(
                **{owner_field: owner_instance},
                original=original_file,
                trace_id=uuid.uuid4().hex,
                **extra_job_fields,
            )
        except IntegrityError:
            raise ValidationError(duplicate_msg)

        transaction.on_commit(
            lambda: task.delay(
                job_id=str(job.pk),
                trace_id=job.trace_id,
            )
        )

    logger.info(
        "ImageJob creado: model=%s owner=%s=%s job_id=%s trace_id=%s",
        job_model.__name__, owner_field, owner_instance.pk,
        job.pk, job.trace_id,
    )

    return job


def finish_single_image_job(
    *,
    job,
    resource_model,
    owner_field: str,
    processed_file,
    extra_resource_fields: dict[str, Any] | None = None,
) -> tuple[T, bool]:

    extra_resource_fields = extra_resource_fields or {}

    owner_instance = getattr(job, owner_field)

    with transaction.atomic():

        old_file_name = None
        try:
            old_file_name = (
                resource_model.objects
                .only('image')
                .get(**{owner_field: owner_instance})
                .image.name
            )
        except resource_model.DoesNotExist:
            pass

        resource, created = resource_model.objects.update_or_create(
            **{owner_field: owner_instance},
            defaults={
                'image': processed_file,
                **extra_resource_fields,
            },
        )

        new_file_name = resource.image.name
        transaction.on_commit(
            lambda old=old_file_name, new=new_file_name: (
                resource.image.storage.delete(old)
                if old and old != new else None
            )
        )

        job.mark_processed()
        job.save_state()

    logger.info(
        "%s %s para %s=%s (job=%s, %sms)",
        resource_model.__name__,
        'creado' if created else 'actualizado',
        owner_field, owner_instance.pk,
        job.pk, job.processing_time_ms,
    )

    return resource, created