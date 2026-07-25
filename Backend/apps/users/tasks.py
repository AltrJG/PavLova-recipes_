from celery import shared_task
from django.db import transaction
from django.utils import timezone
from apps.users.models import ProfilePictureJob
from apps.core.services.image_processing import run_image_job
from django.utils import timezone
from datetime import timedelta
from apps.users.services.profile_picture import ProfilePictureService
from celery.exceptions import SoftTimeLimitExceeded
import logging

logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    autoretry_for=(IOError, ConnectionError, OSError),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    retry_kwargs={'max_retries': 3},
    queue='images',
    soft_time_limit=300,
    time_limit=360,
)
def process_profile_picture_job(self, job_id: str, trace_id: str | None = None):

    logger.info(
        "Procesando ProfilePictureJob id=%s trace_id=%s intento=%s",
        job_id, trace_id, self.request.retries,
    )

    with transaction.atomic():
        job = (
            ProfilePictureJob.objects
            .select_for_update(skip_locked=True)
            .filter(id=job_id, status=ProfilePictureJob.Status.PENDING)
            .first()
        )
        if job is None:
            logger.warning(
                "ProfilePictureJob id=%s no disponible (ya procesado, "
                "cancelado o bloqueado) — descartando.",
                job_id,
            )
            return

        job.mark_processing(task_id=self.request.id or '', worker=self.request.hostname or '')
        job.save_state()

    run_image_job(
    job=job,
    finish_job_fn=ProfilePictureService.finish_job,
    retry_count=self.request.retries,
    max_width=400,
    max_height=400,
    )


@shared_task(
    bind=True,
    queue='maintenance',
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    soft_time_limit=300,
    time_limit=360,
)
def cleanup_old_profile_picture_jobs(self, batch_size: int = 500):

    cutoff        = timezone.now() - timedelta(days=30)
    total_deleted = 0
    last_pk       = None

    logger.info("Iniciando limpieza de ProfilePictureJobs fallidos/cancelados.")

    try:
        while True:
            qs = (
                ProfilePictureJob.objects
                .filter(
                    status__in=[
                        ProfilePictureJob.Status.FAILED,
                        ProfilePictureJob.Status.CANCELLED,
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
                        "Error eliminando ProfilePictureJob id=%s", job.pk
                    )

            logger.info(
                "Batch procesado. Total eliminados hasta ahora: %d", total_deleted
            )

    except SoftTimeLimitExceeded:
        logger.warning(
            "cleanup_old_profile_picture_jobs alcanzó soft_time_limit. "
            "Eliminados: %d. Continuará en la próxima ejecución.",
            total_deleted,
        )
        return total_deleted

    except Exception as exc:
        logger.exception("Error inesperado en limpieza de jobs. Eliminados: %d", total_deleted)
        raise self.retry(exc=exc)

    logger.info("Limpieza finalizada. Total eliminados: %d", total_deleted)
    return total_deleted

def send_email_change_confirmation(user_id: str, new_email: str, token: str) -> bool:

    #TODO servicio SMTP conectado
    logger.info(
        "Enviando correo de confirmación de email. Usuario: %s, Nuevo Email: %s", 
        user_id, new_email
    )

    return True