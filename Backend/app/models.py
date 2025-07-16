from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager, Group, Permission
from django.utils import timezone
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image
from io import BytesIO
import uuid
from django.utils.deconstruct import deconstructible
from django.core.validators import MinValueValidator, MaxValueValidator

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

        if isinstance(instance, User):
            return f"images/{filename}"
        
        elif isinstance(instance, Ingrediente):
            return f"ingredientes/{filename}"
        
        elif isinstance(instance, Categoria):
            return f"categorias/{filename}"
        
        elif isinstance(instance, Receta):
            return f"recetas/{filename}"
        
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
    escala_agua = models.FloatField(default=1.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])

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

#---------------------------RECETA-------------------------------#

class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    foto_categoria = models.ImageField(upload_to=UniqueImagePath(), default='categorias/categoria_placeholder.webp')

    def __str__(self):
        return self.nombre
    
    def save(self, *args, **kwargs):

        default_image = 'categorias/categoria_placeholder.webp'

        if self.pk:
            old_categoria = Categoria.objects.get(pk=self.pk)
            if old_categoria.foto_categoria and old_categoria.foto_categoria.name != default_image:
                if old_categoria.foto_categoria != self.foto_categoria:
                    old_categoria.foto_categoria.delete(save=False)

        if self.foto_categoria and not self.foto_categoria.name.endswith('.webp'):
            img = Image.open(self.foto_categoria)

            if img.mode in ('RGBA', 'P') and 'transparency' in img.info:
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

            output = BytesIO()
            img.save(output, format='WEBP', quality=80)
            output.seek(0)

            self.foto_categoria = InMemoryUploadedFile(
                output,
                'ImageField',
                f"{self.foto_categoria.name.split('.')[0]}.webp",
                'image/webp',
                output.getbuffer().nbytes,
                None
            )

        super().save(*args, **kwargs)
    
class Etiqueta(models.Model):
    nombre = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.nombre

class Receta(models.Model):
    nombre = models.CharField(max_length=100, unique=False)
    porciones = models.IntegerField()
    frase = models.TextField()
    foto_receta = models.ImageField(upload_to=UniqueImagePath(), default='recetas/receta_placeholder.webp')
    procedimiento = models.TextField()
    #rating = models.FloatField(default=0.0) #Se le debería poner un nombre más descriptivo, el nombre es muy similar a puntuación
    tiempo_preparacion = models.IntegerField(default=0)
    tiempo_coccion = models.IntegerField(default=0)
    visibilidad = models.BooleanField(default=True)
    verificado = models.BooleanField(default=False)
    puntuacion = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(500)]) # <-- IA
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True, related_name='recetas')
    ingredientes = models.ManyToManyField(Ingrediente, through='RecetaIngrediente', related_name='recetas')
    etiquetas = models.ManyToManyField(Etiqueta, related_name='recetas')
    creador = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='recetas'
    )

    @property
    def rating_promedio(self):
        promedio = self.comentarios.aggregate(promedio=models.Avg('puntuacion'))['promedio'] # Calcula el promedio de puntuación de los comentarios relacionados con la receta
        if promedio is None:
            return 0.0
        return round(promedio, 1)

    def __str__(self):
        return self.nombre
    
    def save(self, *args, **kwargs):

        default_image = 'recetas/receta_placeholder.webp'

        if self.pk:
            old_receta = Receta.objects.get(pk=self.pk)
            if old_receta.foto_receta and old_receta.foto_receta.name != default_image:
                if old_receta.foto_receta != self.foto_receta:
                    old_receta.foto_receta.delete(save=False)

        if self.foto_receta and not self.foto_receta.name.endswith('.webp'):
            img = Image.open(self.foto_receta)

            if img.mode in ('RGBA', 'P') and 'transparency' in img.info:
                img = img.convert('RGBA')
            else:
                img = img.convert('RGB')

            output = BytesIO()
            img.save(output, format='WEBP', quality=80)
            output.seek(0)

            self.foto_receta = InMemoryUploadedFile(
                output,
                'ImageField',
                f"{self.foto_receta.name.split('.')[0]}.webp",
                'image/webp',
                output.getbuffer().nbytes,
                None
            )

        super().save(*args, **kwargs)

class Comentario(models.Model):
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='comentarios')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comentarios')
    puntuacion = models.FloatField(default=0.0)
    contenido = models.TextField()
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('receta', 'usuario')

    def __str__(self):
        return f"{self.usuario.email} - {self.receta.nombre}"
    
    @property
    def creador(self): # Para la función de permisos, devuelve el usuario que creó el comentario
        return self.usuario

class RecetaIngrediente(models.Model):
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='receta_ingredientes')
    ingrediente = models.ForeignKey(Ingrediente, on_delete=models.CASCADE, related_name='receta_ingredientes')
    cantidad = models.FloatField()
    unidad = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.ingrediente.nombre} - {self.receta.nombre}"
    
class RecetaFavorito(models.Model):
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='receta_favoritas')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receta_favoritas')

    class Meta:
        unique_together = ('receta', 'usuario')

    def __str__(self):
        return f"{self.receta.nombre} - {self.usuario.email}"
    
#---------------------------PLAN ALIMENTICIO-------------------------------#

class PlanAlimenticio(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='planes_alimenticios')
    fecha_inicio = models.DateField(blank=True, null=True)
    fecha_finalizacion = models.DateField(blank=True, null=True)
    objetivo_calorias = models.IntegerField(default=2000)
    objetivo_proteinas = models.IntegerField(default=50)
    objetivo_carbohidratos = models.IntegerField(default=275)
    objetivo_grasas_saturadas = models.IntegerField(default=20)
    objetivo_grasas_insaturadas = models.IntegerField(default=44)
    objetivo_grasas_trans = models.IntegerField(default=2)
    objetivo_sodio = models.IntegerField(default=2300)
    personas = models.IntegerField(default=1)

    def __str__(self):
        return f"Plan Alimenticio de {self.usuario.name} - Desde {self.fecha_inicio} hasta {self.fecha_finalizacion}"
    
    #Constraint para asegurar que un usuario solo tenga un plan alimenticio activo
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['usuario'], name='unique_plan_alimenticio_usuario',)
        ]

class PlanAlimenticioDia(models.Model):
    plan_alimenticio = models.ForeignKey(PlanAlimenticio, on_delete=models.CASCADE, related_name='dias')
    fecha_objetivo = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Día del Plan Alimenticio de {self.plan_alimenticio.usuario.name} - {self.fecha}"

class PlanAlimenticioDiaReceta(models.Model):
    plan_alimenticio_dia = models.ForeignKey(PlanAlimenticioDia, on_delete=models.CASCADE, related_name='recetas')
    receta = models.ForeignKey(Receta, on_delete=models.CASCADE, related_name='plan_alimenticio_recetas')
    porcion = models.FloatField(default=1.0)

    def __str__(self):
        return f"{self.porcion} porciones de {self.receta.nombre} - {self.plan_alimenticio_dia.fecha_objetivo}"
    
#---------------------------AI-------------------------------#

class ObjetivosAI(models.Model):
    objetivo_proteina = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(200)])
    objetivo_carbohidrato = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(200)])
    objetivo_grasa_saturada = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(200)])
    objetivo_grasa_insaturada = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(200)])
    objetivo_grasa_trans = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(200)])
    objetivo_sodio = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(200)])
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, default='')

    def __str__(self):
        return self.nombre
    
class PromedioCalorias(models.Model):
    calorias_promedio = models.FloatField(default=0.0)

    def __str__(self):
        return f"Calorías promedio: {self.calorias_promedio}"    