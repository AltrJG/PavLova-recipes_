import pytest
from django.contrib.auth.models import Group, Permission
from django.urls import reverse

from apps.authorization.exceptions import AuthorizationPermissionError
from apps.authorization.models import AuthorizationAuditLog, GroupMetadata
from apps.authorization.services import group_authorization

pytestmark = pytest.mark.django_db

@pytest.fixture
def superuser(db):
    from apps.users.models import User
    return User.objects.create_superuser(
        email='super@example.com',
        username='superuser',
        password='SuperPass123!',
    )


@pytest.fixture
def manager_user(db):
    from apps.users.models import User
    user = User.objects.create_user(
        email='manager@example.com',
        username='manageruser',
        password='ManagerPass123!',
    )
    perm = Permission.objects.get(codename='manage_user_groups')
    user.user_permissions.add(perm)
    return user


@pytest.fixture
def staff_with_perm(db):
    from apps.users.models import User
    user = User.objects.create_user(
        email='staffperm@example.com',
        username='staffperm',
        password='StaffPass123!',
        is_staff=True,
    )
    p1 = Permission.objects.get(codename='manage_user_groups')
    p2 = Permission.objects.get(codename='manage_staff_status')
    user.user_permissions.add(p1, p2)
    return user


@pytest.fixture
def regular_user(db):
    from apps.users.models import User
    return User.objects.create_user(
        email='regular@example.com',
        username='regularuser',
        password='RegularPass123!',
    )


@pytest.fixture
def another_user(db):
    from apps.users.models import User
    return User.objects.create_user(
        email='another@example.com',
        username='anotheruser',
        password='AnotherPass123!',
    )


@pytest.fixture
def auth_client_manager(client, manager_user):
    """Cliente autenticado como manager."""
    response = client.post(
        '/api/v1/auth/',
        {'email': manager_user.email, 'password': 'ManagerPass123!'},
        content_type='application/json',
    )
    assert response.status_code == 200
    return client


@pytest.fixture
def auth_client_superuser(client, superuser):
    response = client.post(
        '/api/v1/auth/',
        {'email': superuser.email, 'password': 'SuperPass123!'},
        content_type='application/json',
    )
    assert response.status_code == 200
    return client


@pytest.fixture
def auth_client_regular(client, regular_user):
    response = client.post(
        '/api/v1/auth/',
        {'email': regular_user.email, 'password': 'RegularPass123!'},
        content_type='application/json',
    )
    assert response.status_code == 200
    return client


@pytest.fixture
def csrf_token_manager(auth_client_manager):
    return auth_client_manager.cookies.get('csrftoken').value


@pytest.fixture
def csrf_token_super(auth_client_superuser):
    return auth_client_superuser.cookies.get('csrftoken').value

class TestCreateGroup:

    def test_happy_path_crea_grupo_con_metadata(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user,
            name='New Group',
            description='Descripción del grupo',
        )
        assert Group.objects.filter(name='New Group').exists()
        assert group.metadata.description == 'Descripción del grupo'
        assert group.metadata.is_protected is False
        assert group.metadata.created_by == manager_user

    def test_crea_log_de_auditoria(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user,
            name='Audited Group',
            reason='Test de auditoría',
        )
        log = AuthorizationAuditLog.objects.filter(
            actor=manager_user,
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.GROUP_CREATED,
        ).first()
        assert log is not None
        assert log.reason == 'Test de auditoría'
        assert log.before == {}
        assert log.after.get('name') == 'Audited Group'

    def test_sin_permiso_lanza(self, regular_user):
        with pytest.raises(AuthorizationPermissionError):
            group_authorization.create_group(
                actor=regular_user,
                name='Forbidden Group',
            )

    def test_no_superuser_no_puede_crear_protegido(self, manager_user):
        with pytest.raises(AuthorizationPermissionError, match="protegidos"):
            group_authorization.create_group(
                actor=manager_user,
                name='Protected',
                is_protected=True,
            )

    def test_superuser_puede_crear_protegido(self, superuser):
        group = group_authorization.create_group(
            actor=superuser,
            name='Super Protected',
            is_protected=True,
        )
        assert group.metadata.is_protected is True


class TestUpdateGroup:

    def test_happy_path_actualiza_nombre(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user, name='Original Name'
        )
        updated = group_authorization.update_group(
            actor=manager_user,
            group=group,
            name='Updated Name',
        )
        assert updated.name == 'Updated Name'

    def test_actualiza_descripcion(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user, name='Test Group'
        )
        group_authorization.update_group(
            actor=manager_user,
            group=group,
            description='Nueva descripción',
        )
        group.metadata.refresh_from_db()
        assert group.metadata.description == 'Nueva descripción'

    def test_cambio_de_proteccion_genera_log_especifico(self, superuser):
        group = group_authorization.create_group(
            actor=superuser, name='Protect Me'
        )
        group_authorization.update_group(
            actor=superuser,
            group=group,
            is_protected=True,
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.GROUP_PROTECTED,
        ).first()
        assert log is not None

    def test_no_superuser_no_puede_cambiar_proteccion(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user, name='Test'
        )
        with pytest.raises(AuthorizationPermissionError, match="protección"):
            group_authorization.update_group(
                actor=manager_user,
                group=group,
                is_protected=True,
            )

    def test_no_puede_modificar_grupo_protegido_sin_superuser(self, superuser, manager_user):
        group = group_authorization.create_group(
            actor=superuser, name='Protected', is_protected=True,
        )
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            group_authorization.update_group(
                actor=manager_user,
                group=group,
                name='Hacked Name',
            )

    def test_crea_log_before_after_correcto(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user, name='Before Name'
        )
        group_authorization.update_group(
            actor=manager_user,
            group=group,
            name='After Name',
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.GROUP_UPDATED,
        ).latest('created_at')
        assert log.before['name'] == 'Before Name'
        assert log.after['name'] == 'After Name'


class TestDeleteGroup:

    def test_happy_path_elimina_grupo(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user, name='To Delete'
        )
        group_pk = group.pk
        group_authorization.delete_group(
            actor=manager_user,
            group=group,
        )
        assert not Group.objects.filter(pk=group_pk).exists()

    def test_crea_log_antes_de_eliminar(self, manager_user):
        group = group_authorization.create_group(
            actor=manager_user, name='Log Before Delete'
        )
        group_pk = group.pk
        group_authorization.delete_group(
            actor=manager_user,
            group=group,
        )
        log = AuthorizationAuditLog.objects.filter(
            change_type=AuthorizationAuditLog.ChangeType.GROUP_DELETED,
            target_object_id=str(group_pk),
        ).first()
        assert log is not None
        assert log.before.get('name') == 'Log Before Delete'

    def test_no_puede_eliminar_grupo_protegido_sin_superuser(
        self, superuser, manager_user
    ):
        group = group_authorization.create_group(
            actor=superuser, name='Protected', is_protected=True,
        )
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            group_authorization.delete_group(
                actor=manager_user,
                group=group,
            )

    def test_sin_permiso_lanza(self, regular_user):
        group = Group.objects.create(name='Some Group')
        with pytest.raises(AuthorizationPermissionError):
            group_authorization.delete_group(
                actor=regular_user,
                group=group,
            )

class TestGroupViewSetHTTP:

    def test_list_requiere_autenticacion(self, client):
        response = client.get('/api/v1/authorization/groups/')
        assert response.status_code == 401

    def test_list_retorna_grupos(self, auth_client_manager):
        Group.objects.create(name='HTTP Group')
        response = auth_client_manager.get('/api/v1/authorization/groups/')
        assert response.status_code == 200
        assert response.json()['count'] >= 1

    def test_create_grupo(self, auth_client_manager, csrf_token_manager):
        response = auth_client_manager.post(
            '/api/v1/authorization/groups/',
            {'name': 'New HTTP Group', 'description': 'Test', 'reason': 'Testing'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 201
        assert Group.objects.filter(name='New HTTP Group').exists()

    def test_create_requiere_permiso(self, auth_client_regular, client, regular_user):
        response = auth_client_regular.post(
            '/api/v1/authorization/groups/',
            {'name': 'Forbidden Group'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=client.cookies.get('csrftoken', MissingCsrf()).value,
        )
        assert response.status_code in (403, 401)

    def test_delete_grupo(self, auth_client_manager, manager_user, csrf_token_manager):
        group = group_authorization.create_group(
            actor=manager_user, name='To Delete HTTP'
        )
        response = auth_client_manager.delete(
            f'/api/v1/authorization/groups/{group.pk}/',
            {'reason': 'HTTP Delete test'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 204
        assert not Group.objects.filter(pk=group.pk).exists()

    def test_upload_image_endpoint_existe(self, auth_client_manager, manager_user, csrf_token_manager):
        group = group_authorization.create_group(
            actor=manager_user, name='Image Group'
        )
        response = auth_client_manager.post(
            f'/api/v1/authorization/groups/{group.pk}/image/',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 400
        assert 'image' in response.json().get('detail', '').lower()


class TestGroupMembersHTTP:

    def test_get_members(self, auth_client_manager, manager_user, regular_user):
        group = group_authorization.create_group(actor=manager_user, name='Members Group')
        regular_user.groups.add(group)
        response = auth_client_manager.get(
            f'/api/v1/authorization/groups/{group.pk}/members/'
        )
        assert response.status_code == 200

    def test_post_add_member(
        self, auth_client_manager, manager_user, regular_user, csrf_token_manager
    ):
        group = group_authorization.create_group(actor=manager_user, name='Add Member')
        response = auth_client_manager.post(
            f'/api/v1/authorization/groups/{group.pk}/members/',
            {'user': str(regular_user.pk), 'reason': 'Test add'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 200
        assert group.custom_user_set.filter(pk=regular_user.pk).exists()

    def test_delete_remove_member(
        self, auth_client_manager, manager_user, regular_user, csrf_token_manager
    ):
        group = group_authorization.create_group(actor=manager_user, name='Remove Member')
        regular_user.groups.add(group)
        response = auth_client_manager.delete(
            f'/api/v1/authorization/groups/{group.pk}/members/',
            {'user': str(regular_user.pk), 'reason': 'Test remove'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 200
        assert not group.custom_user_set.filter(pk=regular_user.pk).exists()

    def test_put_set_members(
        self, auth_client_manager, manager_user, regular_user,
        another_user, csrf_token_manager
    ):
        group = group_authorization.create_group(actor=manager_user, name='Set Members')
        regular_user.groups.add(group)

        response = auth_client_manager.put(
            f'/api/v1/authorization/groups/{group.pk}/members/',
            {'users': [str(another_user.pk)], 'reason': 'Set test'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 200
        assert group.custom_user_set.filter(pk=another_user.pk).exists()
        assert not group.custom_user_set.filter(pk=regular_user.pk).exists()


class TestUserGroupsHTTP:

    def test_set_grupos_usuario(
        self, auth_client_manager, manager_user, regular_user,
        csrf_token_manager
    ):
        group = group_authorization.create_group(actor=manager_user, name='Set User Groups')
        response = auth_client_manager.post(
            f'/api/v1/authorization/users/{regular_user.pk}/groups/',
            {'groups': [group.pk], 'reason': 'HTTP set'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 200
        assert regular_user.groups.filter(pk=group.pk).exists()

    def test_add_grupo_a_usuario(
        self, auth_client_manager, manager_user, regular_user, csrf_token_manager
    ):
        group = group_authorization.create_group(actor=manager_user, name='Add User Group')
        response = auth_client_manager.post(
            f'/api/v1/authorization/users/{regular_user.pk}/groups/add/',
            {'group': group.pk, 'reason': 'HTTP add'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 200
        assert regular_user.groups.filter(pk=group.pk).exists()

    def test_remove_grupo_de_usuario(
        self, auth_client_manager, manager_user, regular_user, csrf_token_manager
    ):
        group = group_authorization.create_group(actor=manager_user, name='Remove User Group')
        regular_user.groups.add(group)
        response = auth_client_manager.delete(
            f'/api/v1/authorization/users/{regular_user.pk}/groups/remove/',
            {'group': group.pk, 'reason': 'HTTP remove'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 200
        assert not regular_user.groups.filter(pk=group.pk).exists()

    def test_auto_modificacion_devuelve_403(
        self, auth_client_manager, manager_user, csrf_token_manager
    ):
        group = group_authorization.create_group(actor=manager_user, name='Self Mod')
        response = auth_client_manager.post(
            f'/api/v1/authorization/users/{manager_user.pk}/groups/add/',
            {'group': group.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 403


class TestUserRolesHTTP:

    def test_patch_staff_status(
        self, auth_client_superuser, superuser, regular_user, csrf_token_super
    ):
        response = auth_client_superuser.patch(
            f'/api/v1/authorization/users/{regular_user.pk}/staff/',
            {'status': True, 'reason': 'Promotion'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_super,
        )
        assert response.status_code == 200
        regular_user.refresh_from_db()
        assert regular_user.is_staff is True

    def test_patch_superuser_requiere_superuser(
        self, auth_client_manager, regular_user, csrf_token_manager
    ):
        response = auth_client_manager.patch(
            f'/api/v1/authorization/users/{regular_user.pk}/superuser/',
            {'status': True},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_manager,
        )
        assert response.status_code == 403

    def test_patch_superuser_como_superuser(
        self, auth_client_superuser, regular_user, csrf_token_super
    ):
        response = auth_client_superuser.patch(
            f'/api/v1/authorization/users/{regular_user.pk}/superuser/',
            {'status': True, 'reason': 'Elevación'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token_super,
        )
        assert response.status_code == 200
        regular_user.refresh_from_db()
        assert regular_user.is_superuser is True


class TestAuditLogHTTP:

    def test_audit_log_usuario_requiere_permiso(self, auth_client_regular, regular_user):
        response = auth_client_regular.get(
            f'/api/v1/authorization/users/{regular_user.pk}/audit/'
        )
        assert response.status_code == 403

    def test_audit_log_usuario_retorna_logs(
        self, auth_client_manager, manager_user, regular_user
    ):
        group = group_authorization.create_group(actor=manager_user, name='Audit Test Group')
        from apps.authorization.services import user_authorization
        user_authorization.add_to_group(
            actor=manager_user, target=regular_user, group=group,
        )

        response = auth_client_manager.get(
            f'/api/v1/authorization/users/{regular_user.pk}/audit/'
        )
        assert response.status_code == 200
        data = response.json()
        assert data['count'] >= 1

    def test_audit_log_global_con_filtros(self, auth_client_manager, manager_user):
        response = auth_client_manager.get(
            f'/api/v1/authorization/audit/?actor={manager_user.pk}'
        )
        assert response.status_code == 200

    def test_audit_log_global_filtro_change_type(self, auth_client_manager):
        response = auth_client_manager.get(
            '/api/v1/authorization/audit/?change_type=group_added'
        )
        assert response.status_code == 200
        for item in response.json().get('results', []):
            assert item['change_type'] == 'group_added'


class MissingCsrf:
    value = ''