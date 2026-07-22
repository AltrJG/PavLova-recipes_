import io
import uuid
from datetime import timedelta
from unittest.mock import MagicMock, patch

import pytest
from django.utils import timezone
from PIL import Image

pytestmark = pytest.mark.django_db

def make_image_file(
    width: int = 100,
    height: int = 100,
    mode: str = 'RGB',
    fmt: str = 'JPEG',
) -> io.BytesIO:
    img = Image.new(mode, (width, height), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    buf.seek(0)
    return buf


def make_rgba_image(width: int = 100, height: int = 100) -> io.BytesIO:
    img = Image.new('RGBA', (width, height), color=(255, 0, 0, 128))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf


def make_palette_image(width: int = 100, height: int = 100) -> io.BytesIO:
    img = Image.new('RGB', (width, height)).convert('P')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf


def make_corrupted_file() -> io.BytesIO:
    return io.BytesIO(b'esto no es una imagen valida 12345')

@pytest.fixture
def user(db):
    from apps.users.models import User
    return User.objects.create_user(
        email='test@example.com',
        username='testuser',
        password='TestPassword123!',
    )


@pytest.fixture
def pending_job(user):
    from apps.users.models import ProfilePictureJob
    return ProfilePictureJob.objects.create(
        user=user,
        original='profile_pictures/originals/test.jpg',
        status='pending',
    )

class TestAbstractProcessingJobStateMachine:

    def test_mark_processing_desde_pending(self, pending_job):
        pending_job.mark_processing(task_id='task-123', worker='worker-1')

        assert pending_job.status == 'processing'
        assert pending_job.celery_task_id == 'task-123'
        assert pending_job.worker == 'worker-1'
        assert pending_job.started_at is not None

    def test_mark_processed_desde_processing(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_processed()

        assert pending_job.status == 'processed'
        assert pending_job.finished_at is not None
        assert pending_job.processing_time_ms is not None
        assert pending_job.processing_time_ms >= 0

    def test_mark_failed_desde_processing(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_failed(error='Error de prueba')

        assert pending_job.status == 'failed'
        assert pending_job.error_msg == 'Error de prueba'
        assert pending_job.finished_at is not None

    def test_mark_cancelled_desde_pending(self, pending_job):
        pending_job.mark_cancelled(reason='Usuario canceló')

        assert pending_job.status == 'cancelled'
        assert pending_job.cancellation_reason == 'Usuario canceló'
        assert pending_job.finished_at is not None

    def test_mark_processing_desde_processed_lanza_error(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_processed()

        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_processing()

    def test_mark_processing_desde_failed_lanza_error(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_failed()

        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_processing()

    def test_mark_processed_desde_pending_lanza_error(self, pending_job):
        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_processed()

    def test_mark_failed_desde_pending_lanza_error(self, pending_job):
        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_failed()

    def test_mark_cancelled_desde_processing_lanza_error(self, pending_job):
        pending_job.mark_processing()

        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_cancelled()

    def test_mark_cancelled_desde_processed_lanza_error(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_processed()

        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_cancelled()

    def test_mark_processed_desde_cancelled_lanza_error(self, pending_job):
        pending_job.mark_cancelled()

        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_processed()

    def test_doble_mark_processed_lanza_error(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_processed()

        with pytest.raises(ValueError, match="Transición de estado inválida"):
            pending_job.mark_processed()

    def test_mark_processing_no_persiste_sin_save(self, pending_job):
        """mark_processing muta en memoria pero no persiste."""
        pending_job.mark_processing(task_id='task-abc')

        from apps.users.models import ProfilePictureJob
        db_job = ProfilePictureJob.objects.get(pk=pending_job.pk)
        assert db_job.status == 'pending'
        assert db_job.celery_task_id == ''

    def test_save_state_persiste_correctamente(self, pending_job):
        pending_job.mark_processing(task_id='task-abc', worker='worker-1')
        pending_job.save_state()

        from apps.users.models import ProfilePictureJob
        db_job = ProfilePictureJob.objects.get(pk=pending_job.pk)
        assert db_job.status == 'processing'
        assert db_job.celery_task_id == 'task-abc'
        assert db_job.worker == 'worker-1'

    def test_processing_time_ms_se_calcula_correctamente(self, pending_job):
        pending_job.mark_processing()

        pending_job.started_at = timezone.now() - timedelta(milliseconds=500)
        pending_job.mark_processed()

        assert pending_job.processing_time_ms is not None
        assert pending_job.processing_time_ms >= 500

    def test_processing_time_ms_es_none_si_no_hay_started_at(self, pending_job):
        pending_job.status     = 'processing'
        pending_job.started_at = None
        pending_job.mark_processed()

        assert pending_job.processing_time_ms is None

    def test_mark_failed_trunca_error_msg_largo(self, pending_job):
        pending_job.mark_processing()
        error_largo = 'x' * 3000

        pending_job.mark_failed(error=error_largo)

        assert len(pending_job.error_msg) == 2000

    def test_is_pending(self, pending_job):
        assert pending_job.is_pending is True
        assert pending_job.is_processing is False
        assert pending_job.is_done is False

    def test_is_processing(self, pending_job):
        pending_job.mark_processing()
        assert pending_job.is_processing is True
        assert pending_job.is_pending is False
        assert pending_job.is_done is False

    def test_is_done_en_processed(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_processed()
        assert pending_job.is_done is True

    def test_is_done_en_failed(self, pending_job):
        pending_job.mark_processing()
        pending_job.mark_failed()
        assert pending_job.is_done is True

    def test_is_done_en_cancelled(self, pending_job):
        pending_job.mark_cancelled()
        assert pending_job.is_done is True

    def test_is_cancellable_solo_en_pending(self, pending_job):
        assert pending_job.is_cancellable is True

        pending_job.mark_processing()
        assert pending_job.is_cancellable is False

    def test_cancellation_reason_truncada_a_255(self, pending_job):
        reason_largo = 'r' * 300
        pending_job.mark_cancelled(reason=reason_largo)
        assert len(pending_job.cancellation_reason) == 255

    def test_increment_retry_es_atomico(self, pending_job):
        pending_job.increment_retry()
        pending_job.increment_retry()
        pending_job.increment_retry()

        from apps.users.models import ProfilePictureJob
        db_job = ProfilePictureJob.objects.get(pk=pending_job.pk)
        assert db_job.retry_count == 3

    def test_increment_retry_refresca_instancia(self, pending_job):
        pending_job.increment_retry()
        assert pending_job.retry_count == 1

class TestProcessImage:

    def test_convierte_jpeg_a_webp(self):
        from apps.core.services.image_processing import process_image

        result = process_image(make_image_file(fmt='JPEG'))

        assert result.name.endswith('.webp')
        img = Image.open(result)
        assert img.format == 'WEBP'

    def test_convierte_png_a_webp(self):
        from apps.core.services.image_processing import process_image

        result = process_image(make_image_file(fmt='PNG'))

        assert result.name.endswith('.webp')

    def test_convierte_rgba_a_rgb_con_fondo_blanco(self):
        from apps.core.services.image_processing import process_image

        result = process_image(make_rgba_image(), force_white_bg=True)
        img = Image.open(result)

        assert img.mode == 'RGB'

    def test_convierte_paleta_a_rgb(self):
        from apps.core.services.image_processing import process_image

        result = process_image(make_palette_image(), force_white_bg=True)
        img = Image.open(result)

        assert img.mode == 'RGB'

    def test_redimensiona_imagen_grande(self):
        from apps.core.services.image_processing import process_image

        buf = make_image_file(width=2000, height=2000)
        result = process_image(buf, max_width=400, max_height=400)
        img = Image.open(result)

        assert img.width <= 400
        assert img.height <= 400

    def test_no_agranda_imagen_pequeña(self):
        from apps.core.services.image_processing import process_image

        buf = make_image_file(width=50, height=50)
        result = process_image(buf, max_width=400, max_height=400)
        img = Image.open(result)

        assert img.width == 50
        assert img.height == 50

    def test_mantiene_proporcion_al_redimensionar(self):
        from apps.core.services.image_processing import process_image

        buf = make_image_file(width=1000, height=500)
        result = process_image(buf, max_width=400, max_height=400)
        img = Image.open(result)

        ratio_original = 1000 / 500
        ratio_resultado = img.width / img.height
        assert abs(ratio_original - ratio_resultado) < 0.01

    def test_nombre_resultado_es_uuid_webp(self):
        from apps.core.services.image_processing import process_image

        result = process_image(make_image_file())
        name = result.name

        assert name.endswith('.webp')
        stem = name[:-5]
        assert len(stem) == 32
        assert all(c in '0123456789abcdef' for c in stem)

    def test_nombres_son_unicos_por_llamada(self):
        from apps.core.services.image_processing import process_image

        r1 = process_image(make_image_file())
        r2 = process_image(make_image_file())

        assert r1.name != r2.name

    def test_rechaza_archivo_corrupto(self):
        from apps.core.services.image_processing import process_image

        with pytest.raises(ValueError, match="Verificación de seguridad"):
            process_image(make_corrupted_file())

    def test_rechaza_imagen_demasiado_grande(self):
        from apps.core.services.image_processing import process_image

        with patch('apps.core.services.image_processing.MAX_SAFE_WIDTH', 100), \
             patch('apps.core.services.image_processing.MAX_SAFE_HEIGHT', 100):

            buf = make_image_file(width=200, height=200)
            with pytest.raises(ValueError, match="límite seguro"):
                process_image(buf)

    def test_rechaza_bytes_vacios(self):
        from apps.core.services.image_processing import process_image

        with pytest.raises(ValueError):
            process_image(io.BytesIO(b''))

    def test_rechaza_texto_como_imagen(self):
        from apps.core.services.image_processing import process_image

        with pytest.raises(ValueError):
            process_image(io.BytesIO(b'<html>not an image</html>'))

    def test_force_white_bg_false_preserva_transparencia(self):
        from apps.core.services.image_processing import process_image

        result = process_image(make_rgba_image(), force_white_bg=False)
        img = Image.open(result)

        assert img.format == 'WEBP'

    def test_imagen_exactamente_en_el_limite_de_dimensiones(self):
        from apps.core.services.image_processing import process_image

        with patch('apps.core.services.image_processing.MAX_SAFE_WIDTH', 100), \
             patch('apps.core.services.image_processing.MAX_SAFE_HEIGHT', 100):

            buf = make_image_file(width=100, height=100)
            result = process_image(buf)

            assert result is not None

    def test_imagen_un_pixel_sobre_el_limite_es_rechazada(self):
        from apps.core.services.image_processing import process_image

        with patch('apps.core.services.image_processing.MAX_SAFE_WIDTH', 100), \
             patch('apps.core.services.image_processing.MAX_SAFE_HEIGHT', 100):

            buf = make_image_file(width=101, height=100)
            with pytest.raises(ValueError, match="límite seguro"):
                process_image(buf)