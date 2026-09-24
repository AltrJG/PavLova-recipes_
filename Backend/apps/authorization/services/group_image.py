from apps.authorization.models import GroupImage, GroupImageJob
from apps.core.services.image_services import create_single_image_job, finish_single_image_job
import logging

logger = logging.getLogger(__name__)

class GroupImageService:

    @staticmethod
    def create_job(group, original) -> GroupImageJob:

        from apps.authorization.tasks import process_group_image_job
 
        return create_single_image_job(
            job_model=GroupImageJob,
            owner_field='group',
            owner_instance=group,
            original_file=original,
            task=process_group_image_job,
        )

    @staticmethod
    def finish_job(job: GroupImageJob, processed_file) -> GroupImage:

        resource, _ = finish_single_image_job(
            job=job,
            resource_model=GroupImage,
            owner_field='group',
            processed_file=processed_file,
        )
        return resource