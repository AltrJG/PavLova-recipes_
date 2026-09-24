from celery import shared_task
from apps.ingredients.models import IngredientImageJob
from apps.ingredients.services.ingredient_image import IngredientImageService
from apps.core.tasks.images import process_single_image_job, execute_job_cleanup
import logging

logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    autoretry_for=(IOError, ConnectionError, OSError),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    retry_kwargs={'max_retries': 3},
    queue='images',
    soft_time_limit=300,
    time_limit=360,
)
def process_ingredient_image_job(self, job_id: str, trace_id: str | None = None):

    process_single_image_job(
        celery_task=self,
        job_model=IngredientImageJob,
        job_id=job_id,
        trace_id=trace_id,
        finish_job_fn=IngredientImageService.finish_job,
        max_width=400,
        max_height=400,
    )


@shared_task(
    bind=True,
    queue='maintenance',
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True,
    soft_time_limit=300,
    time_limit=360,
)
def cleanup_old_ingredient_image_jobs(self, batch_size: int = 500):

    return execute_job_cleanup(
        celery_task=self,
        job_model=IngredientImageJob,
        batch_size=batch_size,
        days_old=30
    )