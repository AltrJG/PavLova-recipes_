import pytest
from django.db import IntegrityError
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, UserSocialLink, EmailChangeRequest, ProfilePicture

pytestmark = pytest.mark.django_db


class TestUserManagerAndUser:
    #Verifica que el dominio del correo se guarde en minúsculas
    def test_create_user_normalizes_email(self):
        user = User.objects.create_user(
            email='TEST@EXAMPLE.COM', 
            username='testuser', 
            password='password123'
        )
        assert user.email == 'TEST@example.com'
        assert user.check_password('password123') is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_user_missing_email_raises_error(self):
        """Verifica que no se pueda crear un usuario sin correo."""
        with pytest.raises(ValueError, match='El correo electrónico es obligatorio'):
            User.objects.create_user(email='', username='testuser', password='password123')

    def test_create_superuser_valid(self):
        """Verifica la correcta asignación de permisos para el superusuario."""
        admin = User.objects.create_superuser(
            email='admin@example.com', 
            username='admin', 
            password='password123'
        )
        assert admin.is_staff is True
        assert admin.is_superuser is True
        assert admin.is_active is True

    #Un superusuario no puede ser creado si se le fuerza is_staff=False
    def test_create_superuser_invalid_flags(self):
        with pytest.raises(ValueError, match='El superusuario debe tener is_staff=True.'):
            User.objects.create_superuser(
                email='admin@example.com', 
                username='admin', 
                password='password123', 
                is_staff=False
            )

    #El motor de base de datos debe rechazar correos duplicados
    def test_user_email_must_be_unique(self):
        User.objects.create_user(email='unique@example.com', username='user1', password='pw')
        
        with pytest.raises(IntegrityError):
            User.objects.create_user(email='unique@example.com', username='user2', password='pw')


class TestUserSocialLink:
    
    #Prueba la UniqueConstraint: un usuario solo puede tener un link por plataforma
    def test_user_cannot_have_duplicate_platforms(self):
        user = User.objects.create_user(email='social@example.com', username='social')
        
        UserSocialLink.objects.create(user=user, platform=UserSocialLink.SocialPlatform.YOUTUBE, url='https://youtube.com/a')
        
        with pytest.raises(IntegrityError):
            UserSocialLink.objects.create(user=user, platform=UserSocialLink.SocialPlatform.YOUTUBE, url='https://youtube.com/b')

    #El usuario debe poder tener enlaces de distintas plataformas sin conflicto
    def test_user_can_have_multiple_different_platforms(self):
        user = User.objects.create_user(email='multi@example.com', username='multi')
        UserSocialLink.objects.create(user=user, platform=UserSocialLink.SocialPlatform.YOUTUBE, url='https://youtube.com/a')
        UserSocialLink.objects.create(user=user, platform=UserSocialLink.SocialPlatform.X, url='https://x.com/a')
        
        assert UserSocialLink.objects.filter(user=user).count() == 2


class TestEmailChangeRequest:
    
    #Prueba la UniqueConstraint parcial: Solo un request activo a la vez.
    def test_unique_active_email_change_request(self):
        user = User.objects.create_user(email='email@example.com', username='email')
        
        EmailChangeRequest.objects.create(
            user=user, 
            new_email='new1@example.com', 
            token_hash='hash1',
            expires_at=timezone.now() + timedelta(hours=1)
        )
        
        with pytest.raises(IntegrityError):
            EmailChangeRequest.objects.create(
                user=user, 
                new_email='new2@example.com', 
                token_hash='hash2',
                expires_at=timezone.now() + timedelta(hours=1)
            )

    #Si el request anterior ya fue usado, Postgres debe permitir uno nuevo
    def test_allows_new_request_if_previous_is_used(self):
        user = User.objects.create_user(email='used@example.com', username='used')
        
        EmailChangeRequest.objects.create(
            user=user, 
            new_email='new1@example.com', 
            token_hash='hash1',
            expires_at=timezone.now() + timedelta(hours=1),
            used_at=timezone.now()
        )
        
        new_req = EmailChangeRequest.objects.create(
            user=user, 
            new_email='new2@example.com', 
            token_hash='hash2',
            expires_at=timezone.now() + timedelta(hours=1)
        )
        assert new_req.id is not None

    #La propiedad is_valid debe respetar el tiempo de expiración y el uso
    def test_is_valid_property(self):
        user = User.objects.create_user(email='valid@example.com', username='valid')
        req = EmailChangeRequest(
            user=user, 
            new_email='new@example.com', 
            expires_at=timezone.now() + timedelta(hours=1)
        )
        
        assert req.is_valid is True
        
        req.expires_at = timezone.now() - timedelta(hours=1)
        assert req.is_valid is False


class TestProfilePicture:
    
    #Prueba la UniqueConstraint parcial para fotos PROCESSED
    def test_unique_active_profile_picture(self):
        user = User.objects.create_user(email='pic@example.com', username='pic')
        
        ProfilePicture.objects.create(
            user=user, 
            status=ProfilePicture.Status.PROCESSED,
            image='path/to/img1.webp'
        )
        
        with pytest.raises(IntegrityError):
            ProfilePicture.objects.create(
                user=user, 
                status=ProfilePicture.Status.PROCESSED,
                image='path/to/img2.webp'
            )

    #El usuario puede subir 5 fotos a la vez, siempre que estén en PENDING
    def test_allows_multiple_pending_pictures(self):
        user = User.objects.create_user(email='pending@example.com', username='pending')
        
        ProfilePicture.objects.create(user=user, status=ProfilePicture.Status.PENDING)
        ProfilePicture.objects.create(user=user, status=ProfilePicture.Status.PENDING)
        ProfilePicture.objects.create(user=user, status=ProfilePicture.Status.FAILED)
        
        assert ProfilePicture.objects.filter(user=user).count() == 3

    def test_is_active_property(self):
        pic = ProfilePicture(status=ProfilePicture.Status.PROCESSED)
        assert pic.is_active is True
        
        pic.status = ProfilePicture.Status.PROCESSING
        assert pic.is_active is False