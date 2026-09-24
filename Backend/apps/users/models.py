from django.db import models
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager, Group, Permission
from django.utils import timezone
import uuid
import secrets
from django.contrib.postgres.indexes import GinIndex, OpClass
from apps.core.filters import Unaccent
from apps.core.models.jobs import AbstractProcessingJob
from apps.core.models.images import AbstractImageResource

# Create your models here.

class CustomUserManager(BaseUserManager):
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
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self._create_user(email, password, **extra_fields)
    

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    email = models.EmailField(blank=False, unique=True)
    username = models.CharField(max_length=255, blank=False)
    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    country = models.CharField(max_length=100, blank=True, default='')
    about = models.TextField(blank=True, default='')
    date_joined = models.DateTimeField(default=timezone.now, db_index=True)
    last_login = models.DateTimeField(blank=True, null=True)

    groups = models.ManyToManyField(
        Group,
        related_name="custom_user_set",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        Permission,
        related_name="custom_user_permissions_set",
        blank=True
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

        ordering = ['-id']

        indexes = [
            GinIndex(
                OpClass(Unaccent('username'), name='gin_trgm_ops'),
                name='user_unaccent_trgm_idx',
            )
        ]

        permissions = [
            ("view_admin_fields", "Can view admin-only user fields"),
            ("manage_user_groups", "Can assign, remove, and manage user group memberships"),
            ("manage_staff_status", "Can grant or revoke staff status for users"),
        ]

    def __str__(self):
        return self.email

class UserSocialLink(models.Model):

    class SocialPlatform(models.TextChoices):
        YOUTUBE = "youtube", "YouTube"
        FACEBOOK = "facebook", "Facebook"
        X = "x", "X"
        INSTAGRAM = "instagram", "Instagram"
        TIKTOK = "tiktok", "TikTok"

    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="social_links"
    )

    platform = models.CharField(
        max_length=20,
        choices=SocialPlatform.choices
    )

    url = models.URLField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "platform"],
                name="unique_user_platform"
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.get_platform_display()}"

class EmailChangeRequest(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_change_requests",
    )
    new_email = models.EmailField()
    token_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    requested_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        ordering = ["-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(used_at__isnull=True),
                name="unique_active_email_change_request",
            )
        ]

    def __str__(self):
        return f"EmailChangeRequest({self.user_id} -> {self.new_email})"

    @property
    def is_valid(self) -> bool:
        return self.used_at is None and self.expires_at > timezone.now()
    
    @classmethod
    def generate_token(cls) -> str:
        return secrets.token_urlsafe(32)
    

class ProfilePicture(AbstractImageResource):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile_picture",
    )

    image = models.ImageField(upload_to='profile_pictures/')

    class Meta:
        verbose_name = 'Profile Picture'
        verbose_name_plural = 'Profile Pictures'

    def __str__(self):
        return f"ProfilePicture({self.user_id})"
    
    
class ProfilePictureJob(AbstractProcessingJob):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile_picture_jobs',
    )

    original = models.ImageField(upload_to='profile_pictures/originals/')

    class Meta:
        verbose_name = 'Profile Picture Job'
        verbose_name_plural = 'Profile Picture Jobs'
        indexes = [
            models.Index(
                fields=['user', 'status'],
                name='profile_pictur_user_status_idx',
            ),
            models.Index(
                fields=['user'],
                condition=models.Q(status__in=['pending', 'processing']),
                name='profile_picture_job_active_idx',
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=models.Q(status__in=['pending', 'processing']),
                name='unique_active_profile_picture_job',
            )
        ]

    def __str__(self):
        return f"ProfilePictureJob({self.user_id}, {self.status})"