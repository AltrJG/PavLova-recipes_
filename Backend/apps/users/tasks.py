from celery import shared_task
from django.db import transaction
from django.utils import timezone
from apps.users.models import ProfilePicture
from apps.core.services.image_processing import process_image
from apps.users.models import ProfilePicture
from django.utils import timezone
from datetime import timedelta
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
)
def process_profile_picture_task(self, picture_id: str | None = None):

    logger.info("Iniciando procesamiento de imagen para ProfilePicture ID: %s", picture_id)

    with transaction.atomic():
        picture = (
            ProfilePicture.objects
            .select_for_update(skip_locked=True)
            .filter(id=picture_id, status=ProfilePicture.Status.PENDING)
            .first()
        )

        if picture is None:
            logger.warning("No se encontró ProfilePicture PENDIENTE con ID: %s. Posible tarea duplicada.", picture_id)
            return

        picture.status = ProfilePicture.Status.PROCESSING
        picture.save(update_fields=['status'])

    original_name = picture.image.name

    try:
        with picture.image.open('rb') as f:
            processed = process_image(f)

        with transaction.atomic():
            (
                ProfilePicture.objects
                .filter(
                    user_id=picture.user_id,
                    status=ProfilePicture.Status.PROCESSED,
                )
                .exclude(pk=picture.pk)
                .update(status=ProfilePicture.Status.FAILED)
            )

            picture.image      = processed
            picture.status     = ProfilePicture.Status.PROCESSED
            picture.processed_at = timezone.now()
            picture.save(update_fields=['image', 'status', 'processed_at'])

        if original_name and original_name != picture.image.name:
            try:
                picture.image.storage.delete(original_name)
            except Exception as e:
                logger.warning("No se pudo borrar el archivo antiguo %s: %s", original_name, e)

        logger.info("Imagen procesada exitosamente para ProfilePicture ID: %s", picture_id)

    except Exception:
        logger.error("Error crítico procesando imagen %s: %s", picture_id, str(e), exc_info=True)
        picture.status = ProfilePicture.Status.FAILED
        picture.save(update_fields=['status'])
        raise

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
def cleanup_old_profile_pictures(self, batch_size=500):

    logger.info("Iniciando tarea de mantenimiento: Limpieza de imágenes fallidas.")
    
    cutoff = timezone.now() - timedelta(days=30)
    
    queryset = ProfilePicture.objects.filter(
        status=ProfilePicture.Status.FAILED,
        created_at__lt=cutoff
    ).only('id', 'image')

    total_deleted = 0

    while True:
        batch = list(queryset[:batch_size])
        if not batch:
            break
            
        for pic in batch:
            try:
                if pic.image:
                    pic.image.delete(save=False)
                pic.delete()
                total_deleted += 1
            except Exception as e:
                logger.error("Error al borrar registro ID %s: %s", pic.id, e)
                continue 
        
        logger.info("Batch de limpieza procesado. Total borrados hasta ahora: %d", total_deleted)

    logger.info("Tarea de limpieza finalizada. Total registros borrados: %d", total_deleted)
    return total_deleted

def send_email_change_confirmation(user_id: str, new_email: str, token: str) -> bool:

    #TODO servicio SMTP conectado
    logger.info(
        "Enviando correo de confirmación de email. Usuario: %s, Nuevo Email: %s", 
        user_id, new_email
    )

    return True