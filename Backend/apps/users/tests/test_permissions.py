import pytest
from unittest.mock import Mock
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import AnonymousUser, Permission
from apps.users.models import User
from apps.users.permissions import (
    IsSelfOrHasUserPermission,
    IsAuthorOrHasModelPermission,
    CanManageGroups
)

pytestmark = pytest.mark.django_db

class TestIsSelfOrHasUserPermission:
    
    def setup_method(self):
        self.factory = APIRequestFactory()
        self.permission = IsSelfOrHasUserPermission()

    def test_anonymous_user_denied(self):
        request = self.factory.get('/')
        request.user = AnonymousUser()
        
        assert self.permission.has_permission(request, None) is False

    def test_user_can_access_own_object(self):
        user = User.objects.create_user(email='self@test.com', username='self')
        request = self.factory.get('/')
        request.user = user
        
        #El objeto que intenta acceder es el mismo usuario (Self)
        assert self.permission.has_object_permission(request, None, user) is True

    def test_user_cannot_access_other_object_without_permission(self):
        user1 = User.objects.create_user(email='u1@test.com', username='u1')
        user2 = User.objects.create_user(email='u2@test.com', username='u2')
        
        request = self.factory.get('/')
        request.user = user1
        
        #user1 intenta acceder a user2 sin tener el permiso 'view_user'
        assert self.permission.has_object_permission(request, None, user2) is False

    def test_user_with_permission_can_access_other_object(self):
        admin = User.objects.create_user(email='admin@test.com', username='admin')
        target_user = User.objects.create_user(email='target@test.com', username='target')
        
        #Le damos el permiso de ver usuarios
        perm = Permission.objects.get(codename='view_user')
        admin.user_permissions.add(perm)
        
        request = self.factory.get('/')
        request.user = admin
        
        assert self.permission.has_object_permission(request, None, target_user) is True


class TestIsAuthorOrHasModelPermission:

    def setup_method(self):
        self.factory = APIRequestFactory()
        self.permission = IsAuthorOrHasModelPermission()
        self.mock_obj = Mock()

    def test_superuser_has_absolute_access(self):
        superuser = User.objects.create_superuser(email='sup@test.com', username='sup', password='123')
        request = self.factory.delete('/')
        request.user = superuser
        
        assert self.permission.has_object_permission(request, None, self.mock_obj) is True

    def test_author_can_modify_own_object(self):
        author = User.objects.create_user(email='author@test.com', username='author')
        self.mock_obj.author = author
        
        request = self.factory.put('/')
        request.user = author
        
        assert self.permission.has_object_permission(request, None, self.mock_obj) is True

    def test_non_author_denied(self):
        author = User.objects.create_user(email='author@test.com', username='author')
        thief = User.objects.create_user(email='thief@test.com', username='thief')
        self.mock_obj.author = author
        
        request = self.factory.put('/')
        request.user = thief
        
        assert self.permission.has_object_permission(request, None, self.mock_obj) is False


class TestCanManageGroups:

    def setup_method(self):
        self.factory = APIRequestFactory()
        self.permission = CanManageGroups()

    def test_read_requires_view_group_permission(self):
        user = User.objects.create_user(email='reader@test.com', username='reader')
        request = self.factory.get('/')
        request.user = user
        
        assert self.permission.has_permission(request, None) is False
        
        perm = Permission.objects.get(codename='view_group')
        user.user_permissions.add(perm)
        
        user = User.objects.get(pk=user.pk)
        request.user = user

        assert self.permission.has_permission(request, None) is True