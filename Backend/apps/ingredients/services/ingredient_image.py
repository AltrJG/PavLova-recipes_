from apps.ingredients.models import IngredientImage, IngredientImageJob
from Backend.apps.core.services.image_services import create_single_image_job, finish_single_image_job
import logging

logger = logging.getLogger(__name__)

class IngredientImageService:

    @staticmethod
    def create_job(ingrediente, original) -> IngredientImageJob:

        from apps.ingredients.tasks import process_ingredient_image_job
 
        return create_single_image_job(
            job_model=IngredientImageJob,
            owner_field='ingrediente',
            owner_instance=ingrediente,
            original_file=original,
            task=process_ingredient_image_job,
        )

    @staticmethod
    def finish_job(job: IngredientImageJob, processed_file) -> IngredientImage:

        resource, _ = finish_single_image_job(
            job=job,
            resource_model=IngredientImage,
            owner_field='ingrediente',
            processed_file=processed_file,
        )
        return resource