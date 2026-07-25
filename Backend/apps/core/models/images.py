import uuid
from django.db import models

class AbstractImageResource(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    @property
    def url(self) -> str | None:
        image = getattr(self, 'image', None)
        return image.url if image else None