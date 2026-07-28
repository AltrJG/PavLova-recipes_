from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from decimal import Decimal
import uuid
from apps.core.models.jobs import AbstractProcessingJob
from apps.core.models.images import AbstractImageResource

# Create your models here.

class TipoIngrediente(models.TextChoices):
        PERSONAL = "personal", "Personal"
        GLOBAL = "global", "Global"

class Consistencia(models.TextChoices):
        LIQUIDO = "liquido", "Líquido"
        SOLIDO = "solido", "Sólido"

class Ingrediente(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    nombre = models.CharField(max_length=100)
    calorias = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    carbohidratos = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    proteinas = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    grasas_saturadas = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    grasas_trans = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    grasas_insaturadas = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    sodio = models.DecimalField(max_digits=6, decimal_places=2, validators=[MinValueValidator(Decimal("0.00"))])
    consistencia = models.CharField(max_length=10, choices=Consistencia.choices, default=Consistencia.LIQUIDO)
    tipo = models.CharField(max_length=10, choices=TipoIngrediente.choices, default=TipoIngrediente.PERSONAL)
    creador = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='ingredientes'
    )
    escala_agua = models.DecimalField(max_digits=2, decimal_places=1, default=Decimal("1.0"), validators=[MinValueValidator(Decimal("0.0")), MaxValueValidator(Decimal("5.0"))])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

        permissions = [
                    ("manage_global_ingredients", "Can create, update and delete global ingredients"),
                ]

        constraints = [
            models.UniqueConstraint(
                fields=['nombre'],
                condition=models.Q(tipo=TipoIngrediente.GLOBAL),
                name='unique_ingrediente_global'
            ),
            models.UniqueConstraint(
                fields=['nombre', 'creador'],
                condition=models.Q(tipo=TipoIngrediente.PERSONAL),
                name='unique_ingrediente_personal_usuario'
            ),
            models.CheckConstraint(
                check=(
                    models.Q(tipo=TipoIngrediente.GLOBAL, creador__isnull=True) |
                    models.Q(tipo=TipoIngrediente.PERSONAL, creador__isnull=False)
                ),
                name="ingrediente_tipo_creador_consistente",
            ),
            models.CheckConstraint(
                check=models.Q(escala_agua__gte=Decimal("0.0"), escala_agua__lte=Decimal("5.0")),
                name='escala_agua_rango_valido'
            ),
            models.CheckConstraint(
                check=models.Q(
                    calorias__gte=Decimal("0.00"),
                    carbohidratos__gte=Decimal("0.00"),
                    proteinas__gte=Decimal("0.00"),
                    grasas_saturadas__gte=Decimal("0.00"),
                    grasas_trans__gte=Decimal("0.00"),
                    grasas_insaturadas__gte=Decimal("0.00"),
                    sodio__gte=Decimal("0.00"),
                ),
                name='nutrientes_no_negativos'
            ),
        ]

    def __str__(self):
        return self.nombre

class PorcionIngrediente(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    nombre = models.CharField(max_length=100)
    cantidad = models.DecimalField(max_digits=7, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))])
    ingrediente = models.ForeignKey(
        Ingrediente,
        on_delete=models.CASCADE,
        related_name='porciones'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

        constraints = [
            models.UniqueConstraint(
                fields=["ingrediente", "nombre"],
                name="unique_nombre_porcion_ingrediente",
            ),

            models.CheckConstraint(
                check=models.Q(cantidad__gt=Decimal("0.00")),
                name="porcion_cantidad_positiva",
            )
        ]

    def __str__(self):
        return self.nombre


class IngredientImage(AbstractImageResource):

    ingrediente = models.OneToOneField(
        Ingrediente,
        on_delete=models.CASCADE,
        related_name="ingredient_image",
    )

    image = models.ImageField(upload_to='ingredient_images/')

    class Meta:
        verbose_name = 'Ingredient Image'
        verbose_name_plural = 'Ingredient Images'

    def __str__(self):
        return f"IngredientImage({self.ingrediente_id})"
    
    
class IngredientImageJob(AbstractProcessingJob):

    ingrediente = models.ForeignKey(
        Ingrediente,
        on_delete=models.CASCADE,
        related_name='ingredient_image_jobs',
    )

    original = models.ImageField(upload_to='ingredient_images/originals/')

    class Meta:
        verbose_name = 'Ingredient Image Job'
        verbose_name_plural = 'Ingredient Image Jobs'
        indexes = [
            models.Index(
                fields=['ingrediente', 'status'],
                name='ingredient_image_status_idx',
            ),
            models.Index(
                fields=['ingrediente'],
                condition=models.Q(status__in=['pending', 'processing']),
                name='ingredient_img_job_active_idx',
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['ingrediente'],
                condition=models.Q(status__in=['pending', 'processing']),
                name='unique_active_ingredient_image_job',
            )
        ]

    def __str__(self):
        return f"IngredientImageJob({self.ingrediente_id}, {self.status})"