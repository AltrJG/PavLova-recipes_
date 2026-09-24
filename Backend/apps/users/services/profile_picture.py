from apps.users.models import ProfilePicture, ProfilePictureJob
from apps.core.services.image_services import create_single_image_job, finish_single_image_job
import logging

logger = logging.getLogger(__name__)

class ProfilePictureService:

    @staticmethod
    def create_job(user, original) -> ProfilePictureJob:

        from apps.users.tasks import process_profile_picture_job
 
        return create_single_image_job(
            job_model=ProfilePictureJob,
            owner_field='user',
            owner_instance=user,
            original_file=original,
            task=process_profile_picture_job,
        )

    @staticmethod
    def finish_job(job: ProfilePictureJob, processed_file) -> ProfilePicture:

        resource, _ = finish_single_image_job(
            job=job,
            resource_model=ProfilePicture,
            owner_field='user',
            processed_file=processed_file,
        )
        return resource