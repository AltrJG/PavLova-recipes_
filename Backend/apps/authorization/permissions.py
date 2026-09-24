# apps/authorization/permissions.py
from rest_framework.permissions import BasePermission


class CanManageGroups(BasePermission):

    message = "Necesitas el permiso 'manage_user_groups' para gestionar grupos."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.is_superuser
            or request.user.has_perm('users.manage_user_groups')
        )


class CanManageUserGroups(BasePermission):

    message = "Necesitas el permiso 'manage_user_groups' para gestionar membresías."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.is_superuser
            or request.user.has_perm('users.manage_user_groups')
        )


class CanManageStaffStatus(BasePermission):

    message = "Necesitas el permiso 'manage_staff_status' para modificar el rol de staff."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.is_superuser
            or request.user.has_perm('users.manage_staff_status')
        )


class CanManageSuperuserStatus(BasePermission):

    message = "Solo un superusuario puede modificar el rol de superusuario."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.is_superuser


class CanViewAuditLog(BasePermission):

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return (
            request.user.is_superuser
            or request.user.has_perm('users.manage_user_groups')
            or request.user.has_perm('users.manage_staff_status')
        )