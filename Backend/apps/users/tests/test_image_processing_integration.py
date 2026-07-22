import io
import uuid
from unittest.mock import MagicMock, patch, PropertyMock

import pytest
from django.core.files.base import ContentFile
from django.db import transaction
from PIL import Image

pytestmark = pytest.mark.django_db

def make_webp_content_file() -> ContentFile:
    img = Image.new('RGB', (100, 100), color=(0, 255, 0))
    buf = io.BytesIO()
    img.save(buf, format='WEBP')
    buf.seek(0)
    return ContentFile(buf.read(), name=f'{uuid.uuid4().hex}.webp')


def make_jpeg_content_file() -> ContentFile:
    img = Image.new('RGB', (200, 200), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)
    return ContentFile(buf.read(), name='original.jpg')


@pytest.fixture
def user(db):
    from apps.users.models import User
    return User.objects.create_user(
        email='integration@example.com',
        username='integrationuser',
        password='TestPassword123!',
    )


@pytest.fixture
def pending_job(user, tmp_path):
    from django.core.files.base import ContentFile
    from apps.users.models import ProfilePictureJob

    job = ProfilePictureJob(user=user, status='pending')

    img_content = make_jpeg_content_file()
    job.original.save('originals/test.jpg', img_content, save=False)
    job.save()
    return job


@pytest.fixture
def processing_job(pending_job):
    pending_job.mark_processing(task_id='task-abc', worker='worker-1')
    pending_job.save_state()
    return pending_job


@pytest.fixture
def existing_profile_picture(user):
    from apps.users.models import ProfilePicture
    picture = ProfilePicture(user=user)
    picture.image.save('profile_pictures/old.webp', make_webp_content_file(), save=False)
    picture.save()
    return picture

class TestRunImageJob:

    def test_happy_path_completo(self, processing_job):
        from apps.core.services.image_processing import run_image_job
        from apps.users.models import ProfilePicture, ProfilePictureJob

        processed_file = make_webp_content_file()
        finish_called_with = {}

        def mock_finish_job(job, processed):
            finish_called_with['job'] = job
            finish_called_with['processed'] = processed
            job.mark_processed()
            job.save_state()

        with patch(
            'apps.core.services.image_processing.process_image',
            return_value=processed_file,
        ):
            run_image_job(job=processing_job, finish_job_fn=mock_finish_job)

        assert finish_called_with['job'] == processing_job
        assert finish_called_with['processed'] == processed_file

        from apps.users.models import ProfilePictureJob
        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.status == 'processed'
        assert db_job.finished_at is not None
        assert db_job.processing_time_ms is not None

    def test_descarta_job_en_estado_terminal(self, processing_job):
        from apps.core.services.image_processing import run_image_job

        processing_job.mark_processed()
        processing_job.save_state()

        finish_fn = MagicMock()
        run_image_job(job=processing_job, finish_job_fn=finish_fn)

        finish_fn.assert_not_called()

    def test_descarta_job_cancelado(self, pending_job):
        from apps.core.services.image_processing import run_image_job

        pending_job.status = 'cancelled'

        finish_fn = MagicMock()
        run_image_job(job=pending_job, finish_job_fn=finish_fn)

        finish_fn.assert_not_called()

    def test_error_en_process_image_marca_failed(self, processing_job):
        from apps.core.services.image_processing import run_image_job
        from apps.users.models import ProfilePictureJob

        finish_fn = MagicMock()

        with patch(
            'apps.core.services.image_processing.process_image',
            side_effect=ValueError('Imagen corrupta'),
        ):
            with pytest.raises(ValueError):
                run_image_job(job=processing_job, finish_job_fn=finish_fn)

        finish_fn.assert_not_called()

        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.status == 'failed'
        assert 'Imagen corrupta' in db_job.error_msg

    def test_error_en_process_image_incrementa_retry(self, processing_job):
        from apps.core.services.image_processing import run_image_job
        from apps.users.models import ProfilePictureJob

        with patch(
            'apps.core.services.image_processing.process_image',
            side_effect=IOError('Storage error'),
        ):
            with pytest.raises(IOError):
                run_image_job(job=processing_job, finish_job_fn=MagicMock())

        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.retry_count == 1

    def test_error_en_finish_job_marca_failed(self, processing_job):
        from apps.core.services.image_processing import run_image_job
        from apps.users.models import ProfilePictureJob

        def failing_finish(job, processed):
            raise RuntimeError('Error en service')

        with patch(
            'apps.core.services.image_processing.process_image',
            return_value=make_webp_content_file(),
        ):
            with pytest.raises(RuntimeError):
                run_image_job(job=processing_job, finish_job_fn=failing_finish)

        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.status == 'failed'
        assert 'finish_job falló' in db_job.error_msg

    def test_elimina_original_tras_exito(self, processing_job):
        from apps.core.services.image_processing import run_image_job

        original_name = processing_job.original.name

        def mock_finish(job, processed):
            job.mark_processed()
            job.save_state()

        with patch('apps.core.services.image_processing.process_image',
                   return_value=make_webp_content_file()), \
             patch.object(
                 processing_job.original.storage, 'delete'
             ) as mock_delete:

            run_image_job(job=processing_job, finish_job_fn=mock_finish)
            mock_delete.assert_called_once_with(original_name)

    def test_no_falla_si_delete_original_lanza_excepcion(self, processing_job):
        from apps.core.services.image_processing import run_image_job

        def mock_finish(job, processed):
            job.mark_processed()
            job.save_state()

        with patch('apps.core.services.image_processing.process_image',
                   return_value=make_webp_content_file()), \
             patch.object(
                 processing_job.original.storage, 'delete',
                 side_effect=OSError('Storage no disponible'),
             ):
            run_image_job(job=processing_job, finish_job_fn=mock_finish)

        from apps.users.models import ProfilePictureJob
        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.status == 'processed'

class TestProfilePictureService:

    def test_crea_profile_picture_si_no_existe(self, processing_job, user):
        from apps.users.models import ProfilePicture
        from apps.users.services.profile_picture import ProfilePictureService

        assert not ProfilePicture.objects.filter(user=user).exists()

        processed = make_webp_content_file()
        ProfilePictureService.finish_job(processing_job, processed)

        assert ProfilePicture.objects.filter(user=user).exists()

        from apps.users.models import ProfilePictureJob
        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.status == 'processed'

    def test_reemplaza_profile_picture_existente(
        self, processing_job, user, existing_profile_picture
    ):

        from apps.users.models import ProfilePicture
        from apps.users.services.profile_picture import ProfilePictureService

        old_pk = existing_profile_picture.pk
        processed = make_webp_content_file()
        ProfilePictureService.finish_job(processing_job, processed)

        pictures = ProfilePicture.objects.filter(user=user)
        assert pictures.count() == 1

        assert not ProfilePicture.objects.filter(pk=old_pk).exists()

    def test_atomicidad_rollback_si_falla_creacion(self, processing_job, user):
        from apps.users.models import ProfilePicture, ProfilePictureJob
        from apps.users.services.profile_picture import ProfilePictureService

        with patch.object(
            ProfilePicture.objects, 'create',
            side_effect=Exception('DB error'),
        ):
            with pytest.raises(Exception, match='DB error'):
                ProfilePictureService.finish_job(
                    processing_job, make_webp_content_file()
                )

        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.status != 'processed'
        assert not ProfilePicture.objects.filter(user=user).exists()

    def test_job_queda_processed_tras_finish(self, processing_job, user):
        from apps.users.services.profile_picture import ProfilePictureService
        from apps.users.models import ProfilePictureJob

        ProfilePictureService.finish_job(processing_job, make_webp_content_file())

        db_job = ProfilePictureJob.objects.get(pk=processing_job.pk)
        assert db_job.status == 'processed'
        assert db_job.finished_at is not None
        assert db_job.processing_time_ms is not None

class TestProcessProfilePictureJobTask:

    def test_tarea_procesa_job_exitosamente(self, pending_job, user):
        from apps.users.tasks import process_profile_picture_job
        from apps.users.models import ProfilePicture, ProfilePictureJob

        with patch('apps.core.services.image_processing.process_image',
                   return_value=make_webp_content_file()), \
             patch.object(
                 pending_job.original.storage, 'delete'
             ):
            process_profile_picture_job.apply(
                args=[str(pending_job.pk)],
                kwargs={'trace_id': 'test-trace-123'},
            )

        db_job = ProfilePictureJob.objects.get(pk=pending_job.pk)
        assert db_job.status == 'processed'
        assert ProfilePicture.objects.filter(user=user).exists()

    def test_tarea_descarta_job_no_existente(self):
        from apps.users.tasks import process_profile_picture_job

        result = process_profile_picture_job.apply(
            args=[str(uuid.uuid4())],
        )
        assert result.successful()

    def test_tarea_descarta_job_ya_procesado(self, pending_job, user):
        from apps.users.tasks import process_profile_picture_job
        from apps.users.models import ProfilePictureJob

        pending_job.mark_processing(task_id='otro-task', worker='otro-worker')
        pending_job.save_state()
        pending_job.mark_processed()
        pending_job.save_state()

        finish_fn = MagicMock()
        with patch(
            'apps.users.services.profile_picture.ProfilePictureService.finish_job',
            finish_fn,
        ):
            process_profile_picture_job.apply(args=[str(pending_job.pk)])

        finish_fn.assert_not_called()

    def test_tarea_descarta_job_cancelado(self, pending_job):
        from apps.users.tasks import process_profile_picture_job
        from apps.users.models import ProfilePictureJob

        pending_job.mark_cancelled(reason='Test')
        pending_job.save_state()

        finish_fn = MagicMock()
        with patch(
            'apps.users.services.profile_picture.ProfilePictureService.finish_job',
            finish_fn,
        ):
            process_profile_picture_job.apply(args=[str(pending_job.pk)])

        finish_fn.assert_not_called()

    def test_tarea_marca_processing_antes_de_procesar(self, pending_job):
        from apps.users.tasks import process_profile_picture_job
        from apps.users.models import ProfilePictureJob

        estados_capturados = []

        original_finish = __import__(
            'apps.users.services.profile_picture',
            fromlist=['ProfilePictureService'],
        ).ProfilePictureService.finish_job

        def finish_que_captura_estado(job, processed):
            db_job = ProfilePictureJob.objects.get(pk=job.pk)
            estados_capturados.append(db_job.status)
            return original_finish(job, processed)

        with patch('apps.core.services.image_processing.process_image',
                   return_value=make_webp_content_file()), \
             patch(
                 'apps.users.services.profile_picture.'
                 'ProfilePictureService.finish_job',
                 finish_que_captura_estado,
             ), \
             patch.object(pending_job.original.storage, 'delete'):

            process_profile_picture_job.apply(args=[str(pending_job.pk)])

        assert estados_capturados == ['processing']

    def test_select_for_update_previene_procesamiento_doble(self, pending_job, user):
        from apps.users.tasks import process_profile_picture_job
        from apps.users.models import ProfilePicture

        call_count = [0]
        original_process = __import__(
            'apps.core.services.image_processing',
            fromlist=['process_image'],
        ).process_image

        def counting_process(*args, **kwargs):
            call_count[0] += 1
            return make_webp_content_file()

        with patch('apps.core.services.image_processing.process_image',
                   counting_process), \
             patch.object(pending_job.original.storage, 'delete'):

            process_profile_picture_job.apply(args=[str(pending_job.pk)])

            process_profile_picture_job.apply(args=[str(pending_job.pk)])

        assert call_count[0] == 1
        assert ProfilePicture.objects.filter(user=user).count() == 1

class TestCleanupOldProfilePictureJobs:

    def test_elimina_jobs_fallidos_antiguos(self, user):
        from django.utils import timezone
        from datetime import timedelta
        from apps.users.models import ProfilePictureJob
        from apps.users.tasks import cleanup_old_profile_picture_jobs

        old_job = ProfilePictureJob.objects.create(
            user=user,
            status='failed',
        )
        ProfilePictureJob.objects.filter(pk=old_job.pk).update(
            created_at=timezone.now() - timedelta(days=31)
        )

        with patch.object(old_job.original, 'delete'):
            result = cleanup_old_profile_picture_jobs.apply().get()

        assert result == 1
        assert not ProfilePictureJob.objects.filter(pk=old_job.pk).exists()

    def test_elimina_jobs_cancelados_antiguos(self, user):
        from django.utils import timezone
        from datetime import timedelta
        from apps.users.models import ProfilePictureJob
        from apps.users.tasks import cleanup_old_profile_picture_jobs

        old_job = ProfilePictureJob.objects.create(user=user, status='cancelled')
        ProfilePictureJob.objects.filter(pk=old_job.pk).update(
            created_at=timezone.now() - timedelta(days=31)
        )

        result = cleanup_old_profile_picture_jobs.apply().get()
        assert result == 1

    def test_no_elimina_jobs_recientes(self, user):
        from apps.users.models import ProfilePictureJob
        from apps.users.tasks import cleanup_old_profile_picture_jobs

        recent_job = ProfilePictureJob.objects.create(user=user, status='failed')

        result = cleanup_old_profile_picture_jobs.apply().get()

        assert result == 0
        assert ProfilePictureJob.objects.filter(pk=recent_job.pk).exists()

    def test_no_elimina_jobs_procesados(self, user):
        from django.utils import timezone
        from datetime import timedelta
        from apps.users.models import ProfilePictureJob
        from apps.users.tasks import cleanup_old_profile_picture_jobs

        processed_job = ProfilePictureJob.objects.create(
            user=user, status='processed'
        )
        ProfilePictureJob.objects.filter(pk=processed_job.pk).update(
            created_at=timezone.now() - timedelta(days=31)
        )

        result = cleanup_old_profile_picture_jobs.apply().get()

        assert result == 0
        assert ProfilePictureJob.objects.filter(pk=processed_job.pk).exists()