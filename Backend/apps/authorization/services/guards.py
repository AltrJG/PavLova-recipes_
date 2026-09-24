from typing import TYPE_CHECKING
from apps.authorization.models import GroupMetadata
from django.contrib.auth.models import Group
from apps.authorization.exceptions import (
    SelfModificationError,
    AuthorizationPermissionError,
)

if TYPE_CHECKING:
    from apps.users.models import User

def guard_self(actor: "User", target: "User") -> None:
    if actor.pk == target.pk:
        raise SelfModificationError("No puedes modificar tu propia autorización.")

def guard_superuser_target(actor: "User", target: "User") -> None:
    if target.is_superuser and not actor.is_superuser:
        raise AuthorizationPermissionError(
            "Solo un superusuario puede modificar a otro superusuario."
        )

def guard_manage_groups(actor: "User") -> None:
    if actor.is_superuser:
        return
    if actor.has_perm("users.manage_user_groups"):
        return
    raise AuthorizationPermissionError("No tienes permiso para gestionar grupos.")

def guard_protected_groups(actor: "User", operated_group_ids: set[int]) -> None:
    if actor.is_superuser or not operated_group_ids:
        return

    protected = (
        GroupMetadata.objects
        .filter(group_id__in=operated_group_ids, is_protected=True)
        .select_related("group")
        .only("group__name")
        .first()
    )

    if protected:
        raise AuthorizationPermissionError(
            f"No tienes permiso para operar sobre el grupo protegido '{protected.group.name}'."
        )

def guard_locked_group_protection(actor: "User", group: Group) -> None:
    if actor.is_superuser:
        return
        
    if hasattr(group, 'metadata') and group.metadata.is_protected:
        raise AuthorizationPermissionError(
            f"No tienes permiso para operar sobre el grupo protegido '{group.name}'."
        )

def guard_create_protected_group(actor: "User", is_protected: bool) -> None:
    if is_protected and not actor.is_superuser:
        raise AuthorizationPermissionError(
            "Solo un superusuario puede crear grupos protegidos desde cero."
        )

def guard_modify_group_protection(actor: "User", is_protected: bool | None) -> None:
    if is_protected is not None and not actor.is_superuser:
        raise AuthorizationPermissionError(
            "No tienes permiso para modificar la protección de un grupo."
        )

def guard_manage_staff(actor: "User", target: "User") -> None:
    if actor.is_superuser:
        return
    if not actor.has_perm("users.manage_staff_status"):
        raise AuthorizationPermissionError("No tienes permiso para modificar el estado staff.")
    if target.is_staff:
        raise AuthorizationPermissionError("Solo un superusuario puede modificar a otro usuario staff.")

def guard_manage_superusers(actor: "User") -> None:
    if not actor.is_superuser:
        raise AuthorizationPermissionError("Solo un superusuario puede modificar este estado.")