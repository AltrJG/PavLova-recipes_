import logging
from typing import TYPE_CHECKING, Any
from django.http import HttpRequest
from django.contrib.auth.models import Group, Permission
from apps.authorization.models import GroupMetadata
from apps.authorization.models import AuthorizationAuditLog

if TYPE_CHECKING:
    from apps.users.models import User

logger = logging.getLogger(__name__)

def get_metadata(request: HttpRequest | None = None) -> dict[str, str]:
    if request is None:
        return {}

    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    return {
        "ip": (
            xff.split(",")[0].strip()
            if xff
            else request.META.get("REMOTE_ADDR", "")
        ),
        "user_agent": request.META.get("HTTP_USER_AGENT", "")[:255],
    }


def audit_action(
    *,
    actor: "User",
    action: str,
    before: dict[str, Any],
    after: dict[str, Any],
    target_user: "User" | None = None,
    target_group: Group | None = None,
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog:
    
    if (target_user is None) == (target_group is None):
        raise ValueError(
            "Error de auditoría: Debe proporcionarse exactamente un target "
            "(target_user O target_group), no ambos ni ninguno."
        )

    if target_user is not None:
        target_obj_id = str(target_user.pk)
        target_name_val = target_user.username
        target_type_val = "User"
    else:
        target_obj_id = str(target_group.pk)
        target_name_val = target_group.name
        target_type_val = "Group"

    log = AuthorizationAuditLog.objects.create(
        actor=actor,
        target_user=target_user,
        target_group=target_group,
        target_object_id=target_obj_id,
        target_name=target_name_val,
        target_type=target_type_val,
        change_type=action,
        reason=reason,
        before=before,
        after=after,
        metadata=get_metadata(request),
    )

    logger.info(
        "authorization.%s actor=%s target_%s=%s",
        action,
        actor.pk,
        target_type_val.lower(),
        target_obj_id,
        extra={
            "authorization_action": action,
            "actor_id": str(actor.pk),
            "target_id": target_obj_id,
            "target_type": target_type_val,
            "reason": reason,
        }
    )

    return log


def take_user_snapshot(user: "User") -> dict[str, Any]:
    return {
        "groups": tuple(
            {"id": pk, "name": name}
            for pk, name in user.groups.values_list("id", "name").order_by("id")
        ),
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    }


def take_group_snapshot(group: Group) -> dict[str, Any]:
    try:
        metadata = group.metadata
        description = metadata.description
        is_protected = metadata.is_protected
    except GroupMetadata.DoesNotExist:
        description = ""
        is_protected = False

    return {
        "name": group.name,
        "description": description,
        "is_protected": is_protected,
        "permissions": tuple(
            {"id": pk, "codename": codename}
            for pk, codename in group.permissions.values_list("id", "codename").order_by("id")
        )
    }