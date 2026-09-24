from typing import TYPE_CHECKING, Any
from django.contrib.auth.models import Group, Permission
from django.db import transaction
from django.http import HttpRequest
from apps.authorization.models import GroupMetadata
from apps.authorization.models import AuthorizationAuditLog
from collections.abc import Iterable
from apps.authorization.services.audit import (
    audit_action,
    take_group_snapshot
)
from apps.authorization.services.guards import (
    guard_manage_groups, 
    guard_protected_groups,
    guard_create_protected_group,
    guard_modify_group_protection,
    guard_locked_group_protection
)

if TYPE_CHECKING:
    from apps.users.models import User

def create_group(
    *, 
    actor: "User", 
    name: str, 
    description: str = '', 
    is_protected: bool = False, 
    reason: str = "",
    request: HttpRequest | None = None,
) -> Group:
    
    guard_manage_groups(actor)
    guard_create_protected_group(actor, is_protected)

    with transaction.atomic():
        group = Group.objects.create(name=name)
        GroupMetadata.objects.create(
            group=group,
            description=description,
            is_protected=is_protected,
            created_by=actor,
        )
        
        after = take_group_snapshot(group)

        audit_action(
            actor=actor,
            target_group=group,
            action=AuthorizationAuditLog.ChangeType.GROUP_CREATED,
            before={},
            after=after,
            reason=reason,
            request=request,
        )

        return group


def update_group(
    *, 
    actor: "User",
    group: Group, 
    name: str | None = None, 
    description: str | None = None, 
    is_protected: bool | None = None,
    reason: str = "",
    request: HttpRequest | None = None,
) -> Group:
    
    guard_manage_groups(actor)
    guard_modify_group_protection(actor, is_protected)

    with transaction.atomic():
        group = Group.objects.select_for_update(of=('self',)).select_related('metadata').get(pk=group.pk)

        guard_locked_group_protection(actor, group)

        before = take_group_snapshot(group)
        
        if name is not None:
            group.name = name
            group.save(update_fields=['name'])

        if description is not None or is_protected is not None:
            metadata = GroupMetadata.objects.select_for_update().get(group=group)
            
            update_fields = []

            if description is not None:
                metadata.description = description
                update_fields.append('description')

            if is_protected is not None:
                metadata.is_protected = is_protected
                update_fields.append('is_protected')
                
            if update_fields:
                update_fields.append('updated_at')
                metadata.save(update_fields=update_fields)

            group.metadata = metadata

        after = take_group_snapshot(group)
        
        action = AuthorizationAuditLog.ChangeType.GROUP_UPDATED
        if before["is_protected"] != after["is_protected"]:
            action = AuthorizationAuditLog.ChangeType.GROUP_PROTECTED

        audit_action(
            actor=actor,
            target_group=group,
            action=action,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )

        return group


def delete_group(
    *,
    actor: "User",
    group: Group,
    reason: str = "",
    request: HttpRequest | None = None,
) -> None:
    
    guard_manage_groups(actor)

    with transaction.atomic():
        group = Group.objects.select_for_update(of=('self',)).select_related('metadata').get(pk=group.pk)

        guard_locked_group_protection(actor, group)

        before = take_group_snapshot(group)
        
        audit_action(
            actor=actor,
            target_group=group,
            action=AuthorizationAuditLog.ChangeType.GROUP_DELETED,
            before=before,
            after={},
            reason=reason,
            request=request,
        )
        
        group.delete()

def set_group_permissions(
    *, 
    actor: "User", 
    group: Group, 
    permissions: Iterable[Permission], 
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog | None:
    
    guard_manage_groups(actor)
    guard_protected_groups(actor, {group.pk})

    permissions = tuple(permissions)

    with transaction.atomic():
        group = Group.objects.select_for_update(of=('self',)).select_related('metadata').get(pk=group.pk)
        
        guard_locked_group_protection(actor, group)
        
        before = take_group_snapshot(group)

        current_perm_ids = set(p["id"] for p in before["permissions"])
        incoming_perm_ids = {p.pk for p in permissions}
        
        if current_perm_ids == incoming_perm_ids:
            return None
            
        group.permissions.set(permissions)
        
        after = take_group_snapshot(group)

        return audit_action(
            actor=actor,
            target_group=group,
            action=AuthorizationAuditLog.ChangeType.PERMS_SET,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )

def add_permission(
    *, 
    actor: "User", 
    group: Group, 
    permission: Permission, 
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog | None:
    
    guard_manage_groups(actor)

    with transaction.atomic():
        group = Group.objects.select_for_update(of=('self',)).select_related('metadata').get(pk=group.pk)
        
        guard_locked_group_protection(actor, group)
        
        before = take_group_snapshot(group)

        if any(p["id"] == permission.pk for p in before["permissions"]):
            return None
            
        group.permissions.add(permission)
        
        after = take_group_snapshot(group)

        return audit_action(
            actor=actor,
            target_group=group,
            action=AuthorizationAuditLog.ChangeType.PERM_ADDED,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )


def remove_permission(
    *, 
    actor: "User", 
    group: Group, 
    permission: Permission, 
    reason: str = "",
    request: HttpRequest | None = None,
) -> AuthorizationAuditLog | None:
    
    guard_manage_groups(actor)

    with transaction.atomic():
        group = Group.objects.select_for_update(of=('self',)).select_related('metadata').get(pk=group.pk)
        
        guard_locked_group_protection(actor, group)
        
        before = take_group_snapshot(group)

        if not any(p["id"] == permission.pk for p in before["permissions"]):
            return None
            
        group.permissions.remove(permission)
        
        after = take_group_snapshot(group)

        return audit_action(
            actor=actor,
            target_group=group,
            action=AuthorizationAuditLog.ChangeType.PERM_REMOVED,
            before=before,
            after=after,
            reason=reason,
            request=request,
        )