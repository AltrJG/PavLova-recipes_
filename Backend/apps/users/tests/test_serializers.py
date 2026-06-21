import pytest
import io
from PIL import Image
from unittest.mock import PropertyMock, patch
from django.core.files.uploadedfile import SimpleUploadedFile
from apps.users.serializers.profile import ProfilePictureUploadSerializer
from apps.users.serializers.password import ChangePasswordSerializer

def generate_valid_image(format_name='WEBP'):
    file = io.BytesIO()
    image = Image.new('RGB', (1, 1), 'white')
    image.save(file, format_name)
    file.seek(0)
    return file.read()

class TestProfilePictureUploadSerializer:

    def test_valid_image_accepted(self):
        valid_image = SimpleUploadedFile(
            name='avatar.webp',
            content=generate_valid_image('WEBP'),
            content_type='image/webp'
        )
        serializer = ProfilePictureUploadSerializer(data={'image': valid_image})
        assert serializer.is_valid() is True

    def test_invalid_content_type_rejected(self):
        invalid_format_image = SimpleUploadedFile(
            name='avatar.gif',
            content=generate_valid_image('GIF'),
            content_type='image/gif'
        )
        serializer = ProfilePictureUploadSerializer(data={'image': invalid_format_image})
        
        assert serializer.is_valid() is False
        assert 'Formato no permitido' in str(serializer.errors['image'])

    def test_file_size_exceeds_10mb(self):
        massive_file = SimpleUploadedFile(
            name='huge.jpeg',
            content=generate_valid_image('JPEG'),
            content_type='image/jpeg'
        )
        
        with patch('django.core.files.uploadedfile.UploadedFile.size', new_callable=PropertyMock) as mock_size:
            mock_size.return_value = 11 * 1024 * 1024
            serializer = ProfilePictureUploadSerializer(data={'image': massive_file})
            
            assert serializer.is_valid() is False
            assert 'El archivo no puede superar 10MB' in str(serializer.errors['image'])


class TestChangePasswordSerializer:

    def test_rejects_identical_passwords(self):
        data = {
            'current_password': 'SuperSecretPassword123!',
            'new_password': 'SuperSecretPassword123!'
        }
        serializer = ChangePasswordSerializer(data=data)
        
        assert serializer.is_valid() is False
        assert 'La nueva contraseña debe ser diferente a la actual' in str(serializer.errors['new_password'])

    def test_accepts_different_passwords(self):
        data = {
            'current_password': 'OldPassword123!',
            'new_password': 'NewPassword456!'
        }
        serializer = ChangePasswordSerializer(data=data)
        
        assert serializer.is_valid() is True