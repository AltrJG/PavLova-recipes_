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