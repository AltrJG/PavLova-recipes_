import logging
from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from celery.exceptions import SoftTimeLimitExceeded
from apps.core.services.image_processing import run_image_job

logger = logging.getLogger(__name__)

def process_single_image_job(
    celery_task,
    job_model,
    job_id: str,
    finish_job_fn,
    trace_id: str | None = None,
    **run_kwargs
):

    logger.info(
        "Procesando %s id=%s trace_id=%s intento=%s",
        job_model.__name__, job_id, trace_id, celery_task.request.retries,
    )

    with transaction.atomic():
        job = (
            job_model.objects
            .select_for_update(skip_locked=True)
            .filter(id=job_id, status=job_model.Status.PENDING)
            .first()
        )
        if job is None:
            logger.warning(
                "%s id=%s no disponible (ya procesado, cancelado o bloqueado) — descartando.",
                job_model.__name__, job_id,
            )
            return

        job.mark_processing(
            task_id=celery_task.request.id or '', 
            worker=celery_task.request.hostname or ''
        )
        job.save_state()

    run_image_job(
        job=job,
        finish_job_fn=finish_job_fn,
        retry_count=celery_task.request.retries,
        **run_kwargs
    )

DEFAULT_RETENTION_DAYS = 30
DEFAULT_BATCH_SIZE = 500

def execute_job_cleanup(
    celery_task,
    job_model,
    batch_size: int = DEFAULT_BATCH_SIZE,
    days_old: int = DEFAULT_RETENTION_DAYS
) -> int:

    cutoff = timezone.now() - timedelta(days=days_old)
    total_deleted = 0
    last_pk = None

    logger.info("Iniciando limpieza de %s fallidos/cancelados.", job_model.__name__)

    try:
        while True:
            qs = (
                job_model.objects
                .filter(
                    status__in=[
                        job_model.Status.FAILED,
                        job_model.Status.CANCELLED,
                    ],
                    created_at__lt=cutoff,
                )
                .order_by('pk')
                .only('id', 'original')
            )

            if last_pk:
                qs = qs.filter(pk__gt=last_pk)

            batch = list(qs[:batch_size])
            if not batch:
                break

            for job in batch:
                last_pk = job.pk
                try:
                    if job.original:
                        job.original.delete(save=False)
                    job.delete()
                    total_deleted += 1
                except Exception:
                    logger.exception(
                        "Error eliminando %s id=%s", job_model.__name__, job.pk
                    )

            logger.info("Batch procesado. Total eliminados hasta ahora: %d", total_deleted)

    except SoftTimeLimitExceeded:
        logger.warning(
            "%s alcanzó soft_time_limit. Eliminados: %d. Continuará en la próxima.",
            celery_task.name, total_deleted,
        )
        return total_deleted

    except Exception as exc:
        logger.exception("Error inesperado en limpieza de %s.", job_model.__name__)
        raise celery_task.retry(exc=exc)

    logger.info("Limpieza finalizada para %s. Total eliminados: %d", job_model.__name__, total_deleted)
    return total_deleted