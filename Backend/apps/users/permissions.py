from rest_framework.permissions import BasePermission, DjangoModelPermissions

class StrictDjangoModelPermissions(DjangoModelPermissions):

    perms_map = {
        'GET':     ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD':    [],
        'POST':    ['%(app_label)s.add_%(model_name)s'],
        'PUT':     ['%(app_label)s.change_%(model_name)s'],
        'PATCH':   ['%(app_label)s.change_%(model_name)s'],
        'DELETE':  ['%(app_label)s.delete_%(model_name)s'],
    }


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
    
class IsAuthorOrHasModelPermission(BasePermission):

    author_field = 'author'

    method_permission_map = {
        'GET':    'view',
        'HEAD':   'view',
        'POST':   'add',
        'PUT':    'change',
        'PATCH':  'change',
        'DELETE': 'delete',
    }

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_superuser:
            return True

        if self._has_model_permission(user, request.method, obj):
            return True

        author = getattr(obj, self.author_field, None)
        if author is None:
            return False

        author_id = getattr(author, 'pk', author)
        return author_id == user.pk

    def _has_model_permission(self, user, method: str, obj) -> bool:
        action = self.method_permission_map.get(method)
        if not action:
            return False

        opts = obj._meta
        perm_codename = f"{opts.app_label}.{action}_{opts.model_name}"
        return user.has_perm(perm_codename)


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