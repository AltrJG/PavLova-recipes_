from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager, Group, Permission
from django.utils import timezone
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image
from io import BytesIO
import uuid
from django.utils.deconstruct import deconstructible

# Create your models here.

class CustomUserManager(UserManager):
    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
    
    def create_staffuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)
    
    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self._create_user(email, password, **extra_fields)
    
@deconstructible
class UniqueImagePath:
    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        return f"images/{filename}"
    
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(blank=False, default='', unique=True)
    name = models.CharField(max_length=255, blank=False, default='')
    is_active = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, default='')
    about = models.TextField(blank=True, default='')
    profile_picture = models.ImageField(upload_to=UniqueImagePath(), default='images/user-icon.webp')
    social_youtube = models.URLField(blank=True, default='')
    social_facebook = models.URLField(blank=True, default='')
    social_twitter = models.URLField(blank=True, default='')

    groups = models.ManyToManyField(
        Group,
        related_name="app_user_set",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="app_user_permissions_set",
        blank=True
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def get_full_name(self):
        return self.name
    
    def get_short_name(self):
        return self.name or self.email.split('@')[0]
    
    def save(self, *args, **kwargs):
        default_image = 'images/user-icon.webp'

        if self.pk:
            old_user = User.objects.get(pk=self.pk)
            if old_user.profile_picture and old_user.profile_picture.name != default_image:
                if old_user.profile_picture != self.profile_picture:
                    old_user.profile_picture.delete(save=False)


        if self.profile_picture and not self.profile_picture.name.endswith('.webp'):
            img = Image.open(self.profile_picture)

            if img.mode in ('RGBA', 'P') and 'transparency' in img.info:
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

            output = BytesIO()
            
            img.save(output, format='WEBP', quality=80)
            output.seek(0)
            
            self.profile_picture = InMemoryUploadedFile(
                output,
                'ImageField',
                f"{self.profile_picture.name.split('.')[0]}.webp",
                'image/webp',
                output.getbuffer().nbytes,
                None
            )

        super().save(*args, **kwargs)