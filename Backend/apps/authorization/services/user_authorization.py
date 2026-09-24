import logging
from typing import TYPE_CHECKING, Iterable
from django.db import transaction
from django.contrib.auth.models import Group
from django.http import HttpRequest
from apps.authorization.models import AuthorizationAuditLog
from apps.authorization.exceptions import (
    GroupAlreadyAssignedError,
    GroupNotAssignedError,
)
from apps.authorization.services.audit import (
    audit_action,
    take_user_snapshot,
    get_metadata,
)
from apps.authorization.services.guards import (
    guard_self,
    guard_superuser_target,
    guard_protected_groups,
    guard_manage_groups,
    guard_manage_staff,
    guard_manage_superusers,
)

if TYPE_CHECKING:
    from apps.users.models import User

logger = logging.getLogger(__name__)

def assign_groups(
    *,
    actor: "User",
    target: "User",
    groups: Iterable[Group],
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog:
    
    guard_manage_groups(actor)
    groups = tuple(groups)

    with transaction.atomic():

        target = type(target).objects.select_for_update().get(pk=target.pk)

        guard_self(actor, target)
        guard_superuser_target(actor, target)

        before = take_user_snapshot(target)

        current_group_ids = set(g["id"] for g in before["groups"])
        incoming_group_ids = {g.pk for g in groups}
        changed_group_ids = current_group_ids ^ incoming_group_ids
        
        guard_protected_groups(actor, changed_group_ids)

        target.groups.set(groups)

        after = take_user_snapshot(target)

        return audit_action(
            actor=actor,
            target_user=target,
            action=AuthorizationAuditLog.ChangeType.GROUPS_SET,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )


def add_to_group(
    *,
    actor: "User",
    target: "User",
    group: Group,
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog:
    
    guard_manage_groups(actor)

    with transaction.atomic():

        target = type(target).objects.select_for_update().get(pk=target.pk)
        
        guard_self(actor, target)
        guard_superuser_target(actor, target)
        guard_protected_groups(actor, {group.pk})

        before = take_user_snapshot(target)
        
        if any(g["id"] == group.pk for g in before["groups"]):
            raise GroupAlreadyAssignedError("El usuario ya pertenece a este grupo.")

        target.groups.add(group)

        after = take_user_snapshot(target)

        return audit_action(
            actor=actor,
            target_user=target,
            action=AuthorizationAuditLog.ChangeType.GROUP_ADDED,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )


def remove_from_group(
    *,
    actor: "User",
    target: "User",
    group: Group,
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog:
    
    guard_manage_groups(actor)

    with transaction.atomic():

        target = type(target).objects.select_for_update().get(pk=target.pk)
        
        guard_self(actor, target)
        guard_superuser_target(actor, target)
        guard_protected_groups(actor, {group.pk})

        before = take_user_snapshot(target)
        
        if not any(g["id"] == group.pk for g in before["groups"]):
            raise GroupNotAssignedError("El usuario no pertenece a este grupo.")

        target.groups.remove(group)

        after = take_user_snapshot(target)

        return audit_action(
            actor=actor,
            target_user=target,
            action=AuthorizationAuditLog.ChangeType.GROUP_REMOVED,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )


def set_staff_status(
    *,
    actor: "User",
    target: "User",
    is_staff: bool,
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog | None:

    if target.is_staff == is_staff:
        return None

    with transaction.atomic():
        target = type(target).objects.select_for_update().get(pk=target.pk)

        guard_self(actor, target)
        guard_superuser_target(actor, target)
        guard_manage_staff(actor, target)

        if target.is_staff == is_staff:
            return None
        
        before = take_user_snapshot(target)

        target.is_staff = is_staff
        target.save(update_fields=["is_staff"])

        after = take_user_snapshot(target)

        return audit_action(
            actor=actor,
            target_user=target,
            action=AuthorizationAuditLog.ChangeType.STAFF_CHANGED,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )


def set_superuser_status(
    *,
    actor: "User",
    target: "User",
    is_superuser: bool,
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog | None:
    
    guard_manage_superusers(actor)

    if target.is_superuser == is_superuser:
        return None

    with transaction.atomic():
        if target.is_superuser and not is_superuser:
            active_superusers = len(
                type(target).objects.filter(is_superuser=True)
                .select_for_update().order_by('pk')
            )
            if active_superusers <= 1:
                from apps.authorization.exceptions import AuthorizationPermissionError
                raise AuthorizationPermissionError(
                    "No puede eliminarse el último superusuario del sistema."
                )

        target = type(target).objects.select_for_update().get(pk=target.pk)

        guard_self(actor, target)
        
        if target.is_superuser == is_superuser:
            return None
        
        before = take_user_snapshot(target)

        target.is_superuser = is_superuser
        target.save(update_fields=["is_superuser"])

        after = take_user_snapshot(target)

        return audit_action(
            actor=actor,
            target_user=target,
            action=AuthorizationAuditLog.ChangeType.SUPER_CHANGED,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )

def set_group_members(
    *,
    actor: "User",
    group: Group,
    users: Iterable["User"],
    reason: str = "",
    request: HttpRequest | None = None,
) -> list[AuthorizationAuditLog]:
    
    guard_manage_groups(actor)
    guard_protected_groups(actor, {group.pk})

    incoming_user_ids = {u.pk for u in users}

    with transaction.atomic():
        current_users = list(group.custom_user_set.all())
        current_user_ids = {u.pk for u in current_users}

        added_ids = incoming_user_ids - current_user_ids
        removed_ids = current_user_ids - incoming_user_ids
        affected_ids = added_ids | removed_ids

        if not affected_ids:
            return []

        affected_users = list(
            type(actor).objects.filter(pk__in=affected_ids)
            .select_for_update().order_by('pk')
        )

        logs = []
        
        for user in affected_users:
            guard_self(actor, user)
            guard_superuser_target(actor, user)

            before = take_user_snapshot(user)

            if user.pk in added_ids:
                user.groups.add(group)
                action = AuthorizationAuditLog.ChangeType.GROUP_ADDED
            else:
                user.groups.remove(group)
                action = AuthorizationAuditLog.ChangeType.GROUP_REMOVED

            after = take_user_snapshot(user)

            log = audit_action(
                actor=actor,
                target_user=user,
                action=action,
                before=before,
                after=after,
                reason=reason,
                request=request,
            )
            logs.append(log)

        return logs