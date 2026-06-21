import pytest
from unittest.mock import patch
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.users.models import User, ProfilePicture
from apps.users.tasks import process_profile_picture_task

pytestmark = pytest.mark.django_db

class TestCeleryTasks:

    def test_process_profile_picture_success(self):
        user = User.objects.create_user(email='task@test.com', username='task')
        
        fake_image = SimpleUploadedFile(
            name='original.webp',
            content=b'fake_data',
            content_type='image/webp'
        )
        
        pic = ProfilePicture.objects.create(
            user=user, 
            image=fake_image, 
            status=ProfilePicture.Status.PENDING
        )

        with patch('apps.users.tasks.process_image') as mock_process:
            mock_process.return_value = fake_image
            
            process_profile_picture_task(str(pic.pk))
            
            mock_process.assert_called_once()

        pic.refresh_from_db()
        
        assert pic.status == ProfilePicture.Status.PROCESSED
        assert pic.processed_at is not None

    def test_process_profile_picture_fails_gracefully(self):
        user = User.objects.create_user(email='fail@test.com', username='fail')
        
        fake_image = SimpleUploadedFile(
            name='corrupt.webp',
            content=b'bad_data',
            content_type='image/webp'
        )
        
        pic = ProfilePicture.objects.create(
            user=user, 
            image=fake_image, 
            status=ProfilePicture.Status.PENDING
        )

        with patch('apps.users.tasks.process_image') as mock_process:
            mock_process.side_effect = Exception("Disco duro lleno o imagen corrupta")
            
            with pytest.raises(Exception):
                process_profile_picture_task(str(pic.pk))

        pic.refresh_from_db()
        assert pic.status == ProfilePicture.Status.FAILED