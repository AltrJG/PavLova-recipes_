import uuid
from io import BytesIO
from django.core.files.base import ContentFile
from PIL import Image, ImageOps
import logging

logger = logging.getLogger(__name__)

MAX_SAFE_WIDTH  = 4000
MAX_SAFE_HEIGHT = 4000
Image.MAX_IMAGE_PIXELS = 50_000_000

def process_image(
    image_file,
    max_width: int = 800,
    max_height: int = 800,
    quality: int = 85,
    force_white_bg: bool = True,
) -> ContentFile:
    try:
        img_verify = Image.open(image_file)
        img_verify.verify()

        if img_verify.width > MAX_SAFE_WIDTH or img_verify.height > MAX_SAFE_HEIGHT:
            raise ValueError(
                f"Las dimensiones exceden el límite seguro de "
                f"{MAX_SAFE_WIDTH}x{MAX_SAFE_HEIGHT}px."
            )
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"Verificación de seguridad fallida: {exc}")

    image_file.seek(0)

    try:
        img = Image.open(image_file)
        img = ImageOps.exif_transpose(img)

        if force_white_bg and img.mode in ('RGBA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            mask = img.split()[3] if len(img.split()) == 4 else None
            background.paste(img, mask=mask)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

        output = BytesIO()
        img.save(output, format='WEBP', quality=quality, optimize=True, method=6)
        output.seek(0)

        return ContentFile(output.read(), name=f"{uuid.uuid4().hex}.webp")

    except ValueError:
        raise
    except Exception:
        raise ValueError("El archivo no es una imagen válida o está corrupto.")


def run_image_job(
    job,
    finish_job_fn,
    retry_count: int = 0,
    max_width: int = 800,
    max_height: int = 800,
    quality: int = 85,
    force_white_bg: bool = True,
) -> None:

    if job.is_cancelled:
        logger.info(
            "Job %s cancelado (trace_id=%s) — descartando.",
            job.pk, job.trace_id,
        )
        return

    if job.is_done:
        logger.warning(
            "Job %s ya está en estado terminal '%s' — descartando.",
            job.pk, job.status,
        )
        return

    logger.info(
        "Job %s procesando (trace_id=%s, intento=%s)",
        job.pk, job.trace_id, retry_count,
    )


    original_name = job.original.name

    try:
        with job.original.open('rb') as f:
            processed = process_image(
                f,
                max_width=max_width,
                max_height=max_height,
                quality=quality,
                force_white_bg=force_white_bg,
            )
    except Exception as exc:
        logger.exception(
            "Error procesando imagen del job %s (trace_id=%s)",
            job.pk, job.trace_id,
        )
        job.mark_failed(error=str(exc))
        job.save_state()
        job.increment_retry()
        raise

    try:
        finish_job_fn(job, processed)
    except Exception as exc:
        logger.exception(
            "Error en finish_job del dominio para job %s (trace_id=%s)",
            job.pk, job.trace_id,
        )
        job.mark_failed(error=f"finish_job falló: {exc}")
        job.save_state()
        raise

    if original_name:
        try:
            job.original.storage.delete(original_name)
            logger.debug(
                "Original eliminado: %s (job=%s)", original_name, job.pk
            )
        except Exception:
            logger.exception(
                "No se pudo eliminar original %s (job=%s) — requiere limpieza manual.",
                original_name, job.pk,
            )

    logger.info(
        "Job %s completado en %sms (trace_id=%s)",
        job.pk, job.processing_time_ms, job.trace_id,
    )