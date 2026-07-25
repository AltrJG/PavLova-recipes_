from django.db import transaction
from apps.users.models import ProfilePicture, ProfilePictureJob
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError

class ProfilePictureService:

    @staticmethod
    def create_job(user, original):

        from apps.users.tasks import process_profile_picture_job

        with transaction.atomic():

            active_job = (
                ProfilePictureJob.objects
                .select_for_update()
                .filter(
                    user=user,
                    status__in=[
                        ProfilePictureJob.Status.PENDING,
                        ProfilePictureJob.Status.PROCESSING,
                    ],
                )
                .first()
            )

            if active_job:

                if active_job.is_processing:
                    raise ValidationError(
                        "Ya existe una imagen de perfil procesándose. "
                        "Espera unos segundos e inténtalo nuevamente."
                    )

                old_file = active_job.original.name

                active_job.mark_cancelled(
                    "Reemplazado por una nueva imagen."
                )
                active_job.save_state()

                transaction.on_commit(
                    lambda name=old_file: (
                        active_job.original.storage.delete(name)
                        if name else None
                    )
                )

            try:
                job = ProfilePictureJob.objects.create(
                    user=user,
                    original=original,
                )
            except IntegrityError:
                raise ValidationError(
                    "Ya existe una imagen de perfil en proceso."
                )

            transaction.on_commit(
                lambda: process_profile_picture_job.delay(
                    job_id=str(job.pk),
                    trace_id=job.trace_id,
                )
            )

        return job

    @staticmethod
    def finish_job(job: ProfilePictureJob, processed_file) -> ProfilePicture:

        with transaction.atomic():

            old_file = None

            try:
                old_file = ProfilePicture.objects.only("image").get(user=job.user).image.name
            except ProfilePicture.DoesNotExist:
                pass
            
            picture, _ = ProfilePicture.objects.update_or_create(
                user=job.user,
                defaults={
                    "image": processed_file,
                },
            )

            transaction.on_commit(
                lambda: (
                    picture.image.storage.delete(old_file)
                    if old_file and old_file != picture.image.name
                    else None
                )
            )

            job.mark_processed()
            job.save_state()

        return picture