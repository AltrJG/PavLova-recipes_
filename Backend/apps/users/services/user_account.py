import hashlib
from datetime import timedelta
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction, IntegrityError
from django.utils import timezone
from apps.users.models import EmailChangeRequest
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from users.models import User 
else:
    User = get_user_model()

EMAIL_CHANGE_TOKEN_TTL = timedelta(hours=1)

def set_user_password(user: User, raw_password: str, *, save: bool = True) -> User:

    user.set_password(raw_password)
    if save:
        user.save(update_fields=["password"])
    return user

def change_user_password(user: User, *, current_password: str, new_password: str) -> User:

    if not user.check_password(current_password):
        raise ValueError("La contraseña actual no es correcta.")

    return set_user_password(user, new_password)

def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def request_email_change(user: User, new_email: str, *, ip: str | None = None) -> str:

    new_email = User.objects.normalize_email(new_email)

    if User.objects.filter(email__iexact=new_email).exclude(pk=user.pk).exists():
        raise ValueError("Ese correo ya está en uso por otra cuenta.")

    try:
        with transaction.atomic():

            EmailChangeRequest.objects.filter(user=user, used_at__isnull=True).update(
                used_at=timezone.now()
            )

            token = EmailChangeRequest.generate_token()

            EmailChangeRequest.objects.create(
                user=user,
                new_email=new_email,
                token_hash=_hash_token(token),
                expires_at=timezone.now() + EMAIL_CHANGE_TOKEN_TTL,
                requested_ip=ip,
            )
    except IntegrityError:
        raise ValueError("No se pudo procesar la solicitud, intenta de nuevo.")

    return token

def confirm_email_change(token: str) -> User:

    token_hash = _hash_token(token)

    with transaction.atomic():

        try:
            change_request = (
                EmailChangeRequest.objects
                .select_related("user")
                .select_for_update()
                .get(token_hash=token_hash)
            )
        except EmailChangeRequest.DoesNotExist:
            raise ValueError("El enlace de confirmación no es válido.")

        if not change_request.is_valid:
            raise ValueError("El enlace de confirmación expiró o ya fue utilizado.")

        normalized_email = User.objects.normalize_email(change_request.new_email)

        if User.objects.filter(email__iexact=normalized_email).exclude(
            pk=change_request.user_id
        ).exists():
            raise ValueError("Ese correo ya está en uso por otra cuenta.")

        user = change_request.user
        user.email = normalized_email
        user.save(update_fields=["email"])
        change_request.used_at = timezone.now()
        change_request.save(update_fields=["used_at"])

    return user