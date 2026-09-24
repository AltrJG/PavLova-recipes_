from django.db import models
from django.conf import settings
import uuid
from django.contrib.auth.models import Group
from apps.core.models.jobs import AbstractProcessingJob
from apps.core.models.images import AbstractImageResource

# Create your models here.

class GroupMetadata(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    group = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name="metadata",
    )
    is_protected = models.BooleanField(default=False, help_text="Impide que usuarios sin privilegios asignen este grupo.")
    description = models.TextField(blank=True, help_text="Descripción visible del grupo.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_group_metadata'
    )

    def __str__(self):
        return self.group.name

class GroupImage(AbstractImageResource):

    group = models.OneToOneField(
        Group,
        on_delete=models.CASCADE,
        related_name="group_image",
    )

    image = models.ImageField(upload_to='group_images/')

    class Meta:
        verbose_name = 'Group Image'
        verbose_name_plural = 'Group Images'

    def __str__(self):
        return f"GroupImage({self.group_id})"
    
    
class GroupImageJob(AbstractProcessingJob):

    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='group_image_jobs',
    )

    original = models.ImageField(upload_to='group_images/originals/')

    class Meta:
        verbose_name = 'Group Image Job'
        verbose_name_plural = 'Group Image Jobs'
        indexes = [
            models.Index(
                fields=['group', 'status'],
                name='group_image_status_idx',
            ),
            models.Index(
                fields=['group'],
                condition=models.Q(status__in=['pending', 'processing']),
                name='group_image_job_active_idx',
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['group'],
                condition=models.Q(status__in=['pending', 'processing']),
                name='unique_active_group_image_job',
            )
        ]

    def __str__(self):
        return f"GroupImageJob({self.group_id}, {self.status})"


class AuthorizationAuditLog(models.Model):
 
    class ChangeType(models.TextChoices):
        GROUPS_SET    = 'groups_set',    'Grupos reemplazados'
        GROUP_ADDED   = 'group_added',   'Grupo añadido'
        GROUP_REMOVED = 'group_removed', 'Grupo eliminado'
        STAFF_CHANGED = 'staff_changed', 'is_staff modificado'
        SUPER_CHANGED = 'super_changed', 'is_superuser modificado'

        GROUP_CREATED   = 'group_created',   'Grupo creado'
        GROUP_UPDATED   = 'group_updated',   'Grupo modificado'
        GROUP_PROTECTED = 'group_protected', 'Protección de grupo alterada'
        GROUP_DELETED   = 'group_deleted',   'Grupo eliminado'
        IMAGE_CHANGED   = 'image_changed',   'Imagen del grupo modificada'

        PERMS_SET     = 'perms_set',     'Permisos del grupo reemplazados'
        PERM_ADDED    = 'perm_added',    'Permiso añadido al grupo'
        PERM_REMOVED  = 'perm_removed',  'Permiso eliminado del grupo'
 
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
 
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='authorization_actions',
        help_text='Usuario que realizó el cambio.',
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='authorization_user_changes',
        help_text='Usuario sobre el que se realizó el cambio.',
    )
    target_group = models.ForeignKey(
        Group,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='authorization_group_changes',
        help_text='Grupo sobre el que se realizó el cambio.',
    )
    target_object_id = models.CharField(max_length=255, blank=True, default='')
    target_name = models.CharField(max_length=255, blank=True, default='')
    target_type = models.CharField(max_length=50, blank=True, default='')
    change_type = models.CharField(max_length=30, choices=ChangeType.choices)
    reason = models.TextField(blank=True)
    before = models.JSONField(help_text='Estado antes del cambio.')
    after = models.JSONField(help_text='Estado después del cambio.')
    metadata = models.JSONField(
        default=dict, blank=True,
        help_text='Contexto adicional: ip, user_agent, etc.',
    )
 
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
 
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Authorization Audit Log'
        verbose_name_plural = 'Authorization Audit Logs'
        indexes = [
            models.Index(fields=['target_user', '-created_at'], name='authlog_tgt_usr_idx'),
            models.Index(fields=['target_group', '-created_at'], name='authlog_tgt_grp_idx'),
            models.Index(fields=['actor',  '-created_at'], name='authlog_actor_idx'),
        ]
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(target_user__isnull=True) | 
                    models.Q(target_group__isnull=True)
                ),
                name='audit_target_not_both'
            )
        ]
 
    def __str__(self):
        actor_name = self.actor.username if self.actor_id else "[Eliminado]"
        
        t_name = self.target_name or "[Desconocido]"
        t_type = self.target_type or "Unknown"
            
        return f"{actor_name} -> {t_type}({t_name}) ({self.get_change_type_display()})"