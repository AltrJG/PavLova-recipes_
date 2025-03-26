from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager, Group, Permission
from django.utils import timezone
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image
from io import BytesIO
import uuid
from django.utils.deconstruct import deconstructible

# Create your models here.

#---------------------------USUARIO-------------------------------#

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
        #return f"images/{filename}"
        if isinstance(instance, User):
            return f"images/{filename}"
        elif isinstance(instance, Ingrediente):
            return f"ingredientes/{filename}"
        else:
            return f"uploads/{filename}"
    
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

#---------------------------UTILIDADES-------------------------------#

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=30)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f"Token de {self.user.email} - {'Válido' if self.is_valid() else 'Expirado'}"
    
class EmailVerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_verification_codes')
    code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        return f"Código de {self.user.email} - {'Válido' if self.is_valid() else 'Expirado'}"
    
#---------------------------INGREDIENTE-------------------------------#

class Ingrediente(models.Model):
    TIPO_INGREDIENTE = [
        ('personal', 'Personal'),
        ('global', 'Global'),
    ]

    nombre = models.CharField(max_length=100, unique=False) # Poner unique=True en producción con los constraints aplicados
    calorias = models.FloatField()
    carbohidratos = models.FloatField()
    proteinas = models.FloatField()
    grasas_saturadas = models.FloatField()
    grasas_trans = models.FloatField()
    grasas_insaturadas = models.FloatField()
    sodio = models.FloatField()
    foto_ingrediente = models.ImageField(upload_to=UniqueImagePath(), default='ingredientes/ingrediente_placeholder.webp')
    consistencia = models.CharField(max_length=10, choices=[('liquido', 'Liquido'), ('solido', 'Solido')], default='liquido')
    tipo = models.CharField(max_length=10, choices=TIPO_INGREDIENTE, default='personal')
    creador = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='ingredientes'
    )

    def __str__(self):
        return f"{self.nombre} ({self.get_tipo_display()})"

    def save(self, *args, **kwargs):

        default_image = 'ingredientes/ingrediente_placeholder.webp'

        if self.pk:
            old_ingrediente = Ingrediente.objects.get(pk=self.pk)
            if old_ingrediente.foto_ingrediente and old_ingrediente.foto_ingrediente.name != default_image:
                if old_ingrediente.foto_ingrediente != self.foto_ingrediente:
                    old_ingrediente.foto_ingrediente.delete(save=False)

        if self.foto_ingrediente and not self.foto_ingrediente.name.endswith('.webp'):
            img = Image.open(self.foto_ingrediente)

            if img.mode in ('RGBA', 'P') and 'transparency' in img.info:
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

            output = BytesIO()
            img.save(output, format='WEBP', quality=80)
            output.seek(0)

            self.foto_ingrediente = InMemoryUploadedFile(
                output,
                'ImageField',
                f"{self.foto_ingrediente.name.split('.')[0]}.webp",
                'image/webp',
                output.getbuffer().nbytes,
                None
            )

        super().save(*args, **kwargs)

"""

    Constraints:
        - Global ingredients must have unique names
        - Personal ingredients must have unique names per user

    Descomentar en producción (MySQL/PostgreSQL/etc) y comentar en desarrollo (SQLite)
    - En desarrollo, SQLite no soporta constraints, por lo que se debe usar otro método para validar los campos
    - En producción, se pueden usar constraints para que la base de datos valide los campos
    - Se recomienda usar constraints en producción, ya que es más eficiente y seguro
    - Requiere hacer migraciones para crear las constraints

    class Meta:
        ordering = ['nombre']
        constraints = [
            models.UniqueConstraint(
                fields=['nombre'],
                condition=models.Q(tipo='global'),
                name='unique_ingrediente_global'
            ),
            models.UniqueConstraint(
                fields=['nombre', 'creador'],
                condition=models.Q(tipo='personal'),
                name='unique_ingrediente_personal_usuario'
            ),
        ]"
"""