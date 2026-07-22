import uuid
from django.db import models
from django.utils import timezone
from django.db.models import F
from typing import ClassVar

class AbstractProcessingJob(models.Model):

    class Status(models.TextChoices):
        PENDING    = 'pending',    'Pendiente'
        PROCESSING = 'processing', 'Procesando'
        PROCESSED  = 'processed',  'Procesado'
        FAILED     = 'failed',     'Fallido'
        CANCELLED  = 'cancelled',  'Cancelado'

    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    trace_id = models.CharField(max_length=64, blank=True, default='')
    celery_task_id = models.CharField(
        max_length=155,
        blank=True,
        default='',
        db_index=True,
    )
    worker = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Hostname del worker que procesó el job.',
    )

    started_at = models.DateTimeField(
        null=True, blank=True,
        help_text='Momento en que el worker tomó el job (status → processing).',
    )
    finished_at = models.DateTimeField(
        null=True, blank=True,
        help_text='Momento en que el job terminó, sea éxito o fallo.',
    )
    processing_time_ms = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='Duración del procesamiento en milisegundos. ',
    )

    retry_count = models.PositiveSmallIntegerField(
        default=0,
        help_text='Número de reintentos realizados por Celery.',
    )

    error_msg = models.TextField(
        blank=True,
        default='',
        help_text='Detalle del error si status=FAILED.',
    )

    cancellation_reason = models.CharField(max_length=255, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    @property
    def is_pending(self) -> bool:
        return self.status == self.Status.PENDING

    @property
    def is_processing(self) -> bool:
        return self.status == self.Status.PROCESSING

    @property
    def is_failed(self) -> bool:
        return self.status == self.Status.FAILED
    
    @property
    def is_cancelled(self) -> bool:
        return self.status == self.Status.CANCELLED

    @property
    def is_done(self) -> bool:
        return self.status in (
            self.Status.PROCESSED,
            self.Status.FAILED,
            self.Status.CANCELLED,
        )

    VALID_TRANSITIONS: ClassVar[dict[str, set[str]]] = {
    Status.PENDING:    {Status.PROCESSING, Status.CANCELLED},
    Status.PROCESSING: {Status.PROCESSED, Status.FAILED},
    Status.PROCESSED:  set(),
    Status.FAILED:     set(),
    Status.CANCELLED:  set(),
    }

    def _validate_transition(self, target: str) -> None:
        allowed = self.VALID_TRANSITIONS[self.status]
        if target not in allowed:
            allowed_str = ', '.join(allowed) if allowed else 'ninguno (estado terminal)'
            raise ValueError(
                f"Transición de estado inválida: '{self.status}' → '{target}'. "
                f"Desde '{self.status}' solo se permite: {allowed_str}."
            )
    
    @property
    def is_cancellable(self) -> bool:
        return self.Status.CANCELLED in self.VALID_TRANSITIONS.get(self.status, set())

    def _compute_processing_time(self, now) -> int | None:
        if self.started_at:
            return int((now - self.started_at).total_seconds() * 1000)
        return None

    def mark_processing(self, task_id: str = '', worker: str = '') -> None:
        self._validate_transition(self.Status.PROCESSING)
        self.status = self.Status.PROCESSING
        self.started_at = self.started_at or timezone.now()
        self.celery_task_id = task_id
        self.worker = worker

    def mark_processed(self) -> None:
        self._validate_transition(self.Status.PROCESSED)
        now = timezone.now()
        self.status = self.Status.PROCESSED
        self.finished_at = now
        self.processing_time_ms = self._compute_processing_time(now)

    def mark_failed(self, error: str = '') -> None:
        self._validate_transition(self.Status.FAILED)
        now = timezone.now()
        self.status = self.Status.FAILED
        self.finished_at = now
        self.error_msg = error[:2000]
        self.processing_time_ms = self._compute_processing_time(now)

    def mark_cancelled(self, reason: str = '') -> None:
        self._validate_transition(self.Status.CANCELLED)
        now = timezone.now()
        self.status = self.Status.CANCELLED
        self.finished_at = now
        self.cancellation_reason = reason[:255]

    def save_state(self) -> None:
        self.save(update_fields=[
            'status', 'started_at', 'finished_at',
            'celery_task_id', 'worker', 'error_msg',
            'processing_time_ms', 'cancellation_reason', 'updated_at',
        ])

    def increment_retry(self) -> None:
        type(self).objects.filter(pk=self.pk).update(
            retry_count=F('retry_count') + 1,
            updated_at=timezone.now(),
        )
        self.refresh_from_db(fields=['retry_count'])