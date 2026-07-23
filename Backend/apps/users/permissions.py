from rest_framework.permissions import BasePermission

class IsSelfOrHasUserPermission(BasePermission):

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if obj.pk == request.user.pk:
            return True

        method_to_perm = {
            'GET':    'users.view_user',
            'PUT':    'users.change_user',
            'PATCH':  'users.change_user',
            'DELETE': 'users.delete_user',
        }
        perm = method_to_perm.get(request.method)
        return perm and request.user.has_perm(perm)

class CanManageGroups(BasePermission):

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.user.is_superuser:
            return True
        
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user.has_perm('auth.view_group')
        
        return request.user.has_perm('auth.change_group') or request.user.has_perm('auth.add_group')
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)