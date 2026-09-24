import threading

import pytest
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType

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
def regular_user(db):
    from apps.users.models import User
    return User.objects.create_user(
        email='regular@example.com',
        username='regularuser',
        password='RegularPass123!',
    )


@pytest.fixture
def group(db, manager_user):
    return group_authorization.create_group(
        actor=manager_user,
        name='Test Group',
        description='Grupo de prueba',
    )


@pytest.fixture
def protected_group(db, superuser):
    return group_authorization.create_group(
        actor=superuser,
        name='Protected Group',
        is_protected=True,
    )


@pytest.fixture
def perm_view_user(db):
    ct = ContentType.objects.get(app_label='users', model='user')
    return Permission.objects.get(content_type=ct, codename='view_user')


@pytest.fixture
def perm_change_user(db):
    ct = ContentType.objects.get(app_label='users', model='user')
    return Permission.objects.get(content_type=ct, codename='change_user')


@pytest.fixture
def perm_delete_user(db):
    ct = ContentType.objects.get(app_label='users', model='user')
    return Permission.objects.get(content_type=ct, codename='delete_user')


@pytest.fixture
def auth_client_manager(client, manager_user):
    resp = client.post(
        '/api/v1/auth/',
        {'email': manager_user.email, 'password': 'ManagerPass123!'},
        content_type='application/json',
    )
    assert resp.status_code == 200
    return client


@pytest.fixture
def auth_client_superuser(client, superuser):
    resp = client.post(
        '/api/v1/auth/',
        {'email': superuser.email, 'password': 'SuperPass123!'},
        content_type='application/json',
    )
    assert resp.status_code == 200
    return client


@pytest.fixture
def csrf_manager(auth_client_manager):
    return auth_client_manager.cookies['csrftoken'].value


@pytest.fixture
def csrf_super(auth_client_superuser):
    return auth_client_superuser.cookies['csrftoken'].value

class TestAddPermission:

    def test_happy_path_añade_permiso(self, manager_user, group, perm_view_user):
        log = group_authorization.add_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        assert group.permissions.filter(pk=perm_view_user.pk).exists()
        assert log is not None
        assert log.change_type == AuthorizationAuditLog.ChangeType.PERM_ADDED

    def test_permiso_ya_asignado_devuelve_none(
        self, manager_user, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        result = group_authorization.add_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        assert result is None

    def test_permiso_ya_asignado_no_crea_log(
        self, manager_user, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        initial_count = AuthorizationAuditLog.objects.count()
        group_authorization.add_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        assert AuthorizationAuditLog.objects.count() == initial_count

    def test_sin_permiso_manage_groups_lanza(self, regular_user, group, perm_view_user):
        with pytest.raises(AuthorizationPermissionError, match="gestionar grupos"):
            group_authorization.add_permission(
                actor=regular_user,
                group=group,
                permission=perm_view_user,
            )

    def test_grupo_protegido_lanza_sin_superuser(
        self, manager_user, protected_group, perm_view_user
    ):
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            group_authorization.add_permission(
                actor=manager_user,
                group=protected_group,
                permission=perm_view_user,
            )

    def test_superuser_puede_añadir_a_grupo_protegido(
        self, superuser, protected_group, perm_view_user
    ):
        log = group_authorization.add_permission(
            actor=superuser,
            group=protected_group,
            permission=perm_view_user,
        )
        assert protected_group.permissions.filter(pk=perm_view_user.pk).exists()
        assert log is not None

    def test_log_contiene_before_sin_permiso_y_after_con_permiso(
        self, manager_user, group, perm_view_user
    ):
        group_authorization.add_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERM_ADDED,
        ).latest('created_at')

        before_ids = {p['id'] for p in log.before['permissions']}
        after_ids  = {p['id'] for p in log.after['permissions']}

        assert perm_view_user.pk not in before_ids
        assert perm_view_user.pk in after_ids

    def test_reason_se_guarda_en_log(self, manager_user, group, perm_view_user):
        group_authorization.add_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
            reason='Acceso de moderación Q3',
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERM_ADDED,
        ).latest('created_at')
        assert log.reason == 'Acceso de moderación Q3'

    def test_actor_guardado_en_log(self, manager_user, group, perm_view_user):
        group_authorization.add_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERM_ADDED,
        ).latest('created_at')
        assert log.actor == manager_user

    def test_target_group_guardado_en_log(self, manager_user, group, perm_view_user):
        group_authorization.add_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
        ).latest('created_at')
        assert log.target_group == group
        assert log.target_type == 'Group'

class TestRemovePermission:

    def test_happy_path_elimina_permiso(self, manager_user, group, perm_view_user):
        group.permissions.add(perm_view_user)
        log = group_authorization.remove_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        assert not group.permissions.filter(pk=perm_view_user.pk).exists()
        assert log is not None
        assert log.change_type == AuthorizationAuditLog.ChangeType.PERM_REMOVED

    def test_permiso_no_asignado_devuelve_none(
        self, manager_user, group, perm_view_user
    ):
        result = group_authorization.remove_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        assert result is None

    def test_permiso_no_asignado_no_crea_log(
        self, manager_user, group, perm_view_user
    ):
        initial_count = AuthorizationAuditLog.objects.count()
        group_authorization.remove_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        assert AuthorizationAuditLog.objects.count() == initial_count

    def test_grupo_protegido_lanza(
        self, manager_user, superuser, protected_group, perm_view_user
    ):
        protected_group.permissions.add(perm_view_user)
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            group_authorization.remove_permission(
                actor=manager_user,
                group=protected_group,
                permission=perm_view_user,
            )

    def test_log_contiene_before_con_permiso_y_after_sin_permiso(
        self, manager_user, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        group_authorization.remove_permission(
            actor=manager_user,
            group=group,
            permission=perm_view_user,
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERM_REMOVED,
        ).latest('created_at')

        before_ids = {p['id'] for p in log.before['permissions']}
        after_ids  = {p['id'] for p in log.after['permissions']}

        assert perm_view_user.pk in before_ids
        assert perm_view_user.pk not in after_ids

    def test_sin_permiso_manage_groups_lanza(
        self, regular_user, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        with pytest.raises(AuthorizationPermissionError):
            group_authorization.remove_permission(
                actor=regular_user,
                group=group,
                permission=perm_view_user,
            )

class TestSetGroupPermissions:

    def test_happy_path_reemplaza_permisos(
        self, manager_user, group, perm_view_user, perm_change_user, perm_delete_user
    ):
        group.permissions.add(perm_view_user)

        log = group_authorization.set_group_permissions(
            actor=manager_user,
            group=group,
            permissions=[perm_change_user, perm_delete_user],
        )

        current_ids = set(group.permissions.values_list('id', flat=True))
        assert perm_change_user.pk in current_ids
        assert perm_delete_user.pk in current_ids
        assert perm_view_user.pk not in current_ids
        assert log is not None
        assert log.change_type == AuthorizationAuditLog.ChangeType.PERMS_SET

    def test_set_vacio_quita_todos_los_permisos(
        self, manager_user, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        group_authorization.set_group_permissions(
            actor=manager_user,
            group=group,
            permissions=[],
        )
        assert group.permissions.count() == 0

    def test_sin_cambios_devuelve_none(
        self, manager_user, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        result = group_authorization.set_group_permissions(
            actor=manager_user,
            group=group,
            permissions=[perm_view_user],
        )
        assert result is None

    def test_sin_cambios_no_crea_log(self, manager_user, group, perm_view_user):
        group.permissions.add(perm_view_user)
        initial_count = AuthorizationAuditLog.objects.count()
        group_authorization.set_group_permissions(
            actor=manager_user,
            group=group,
            permissions=[perm_view_user],
        )
        assert AuthorizationAuditLog.objects.count() == initial_count

    def test_log_before_after_correcto(
        self, manager_user, group, perm_view_user, perm_change_user
    ):
        group.permissions.add(perm_view_user)
        group_authorization.set_group_permissions(
            actor=manager_user,
            group=group,
            permissions=[perm_change_user],
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERMS_SET,
        ).latest('created_at')

        before_ids = {p['id'] for p in log.before['permissions']}
        after_ids  = {p['id'] for p in log.after['permissions']}

        assert perm_view_user.pk in before_ids
        assert perm_change_user.pk in after_ids
        assert perm_view_user.pk not in after_ids

    def test_grupo_protegido_lanza_sin_superuser(
        self, manager_user, protected_group, perm_view_user
    ):
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            group_authorization.set_group_permissions(
                actor=manager_user,
                group=protected_group,
                permissions=[perm_view_user],
            )

    def test_superuser_puede_set_en_grupo_protegido(
        self, superuser, protected_group, perm_view_user
    ):
        group_authorization.set_group_permissions(
            actor=superuser,
            group=protected_group,
            permissions=[perm_view_user],
        )
        assert protected_group.permissions.filter(pk=perm_view_user.pk).exists()

    def test_sin_permiso_manage_groups_lanza(
        self, regular_user, group, perm_view_user
    ):
        with pytest.raises(AuthorizationPermissionError):
            group_authorization.set_group_permissions(
                actor=regular_user,
                group=group,
                permissions=[perm_view_user],
            )

    def test_snapshot_incluye_permisos_actualizados(
        self, manager_user, group, perm_view_user, perm_change_user
    ):
        group_authorization.set_group_permissions(
            actor=manager_user,
            group=group,
            permissions=[perm_view_user, perm_change_user],
        )
        log = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERMS_SET,
        ).latest('created_at')
        assert 'permissions' in log.before
        assert 'permissions' in log.after
        assert 'name' in log.before
        assert 'is_protected' in log.before

class TestPermissionConcurrency:

    @pytest.mark.django_db(transaction=True)
    def test_add_permission_concurrente_no_duplica_log(
        self, manager_user, perm_view_user
    ):
        from apps.authorization.services import group_authorization as ga
        from apps.users.models import User

        grp = Group.objects.create(name='Concurrent Perm Group')
        GroupMetadata.objects.create(group=grp)

        initial_log_count = AuthorizationAuditLog.objects.filter(
            target_group=grp,
            change_type=AuthorizationAuditLog.ChangeType.PERM_ADDED,
        ).count()

        errors = []

        def try_add():
            try:
                actor = User.objects.get(pk=manager_user.pk)
                ga.add_permission(
                    actor=actor,
                    group=grp,
                    permission=perm_view_user,
                )
            except Exception as exc:
                errors.append(str(exc))

        t1 = threading.Thread(target=try_add)
        t2 = threading.Thread(target=try_add)
        t1.start(); t2.start()
        t1.join(); t2.join()

        assert grp.permissions.filter(pk=perm_view_user.pk).count() == 1

        new_logs = AuthorizationAuditLog.objects.filter(
            target_group=grp,
            change_type=AuthorizationAuditLog.ChangeType.PERM_ADDED,
        ).count() - initial_log_count
        assert new_logs <= 1

    @pytest.mark.django_db(transaction=True)
    def test_set_permissions_concurrente_estado_consistente(
        self, manager_user, perm_view_user, perm_change_user
    ):

        from apps.authorization.services import group_authorization as ga
        from apps.users.models import User

        grp = Group.objects.create(name='Concurrent Set Group')
        GroupMetadata.objects.create(group=grp)

        errors = []

        def set_view():
            try:
                actor = User.objects.get(pk=manager_user.pk)
                ga.set_group_permissions(
                    actor=actor, group=grp, permissions=[perm_view_user],
                )
            except Exception as exc:
                errors.append(str(exc))

        def set_change():
            try:
                actor = User.objects.get(pk=manager_user.pk)
                ga.set_group_permissions(
                    actor=actor, group=grp, permissions=[perm_change_user],
                )
            except Exception as exc:
                errors.append(str(exc))

        t1 = threading.Thread(target=set_view)
        t2 = threading.Thread(target=set_change)
        t1.start(); t2.start()
        t1.join(); t2.join()

        final_perms = set(grp.permissions.values_list('id', flat=True))
        valid_state_a = {perm_view_user.pk}
        valid_state_b = {perm_change_user.pk}

        assert final_perms == valid_state_a or final_perms == valid_state_b
        assert not errors

class TestGroupPermissionsHTTP:

    def _group_perms_url(self, group_pk):
        return f'/api/v1/authorization/groups/{group_pk}/permissions/'


    def test_get_permissions_requiere_autenticacion(self, client, group):
        response = client.get(self._group_perms_url(group.pk))
        assert response.status_code == 401

    def test_get_permissions_retorna_lista(
        self, auth_client_manager, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.get(self._group_perms_url(group.pk))
        assert response.status_code == 200
        ids = [p['id'] for p in response.json()]
        assert perm_view_user.pk in ids

    def test_get_permissions_grupo_sin_permisos_devuelve_lista_vacia(
        self, auth_client_manager, group
    ):
        response = auth_client_manager.get(self._group_perms_url(group.pk))
        assert response.status_code == 200
        assert response.json() == []


    def test_post_añade_permiso(
        self, auth_client_manager, group, perm_view_user, csrf_manager
    ):
        response = auth_client_manager.post(
            self._group_perms_url(group.pk),
            {'permission': perm_view_user.pk, 'reason': 'HTTP add perm'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 200
        assert group.permissions.filter(pk=perm_view_user.pk).exists()

    def test_post_sin_permiso_manage_groups_devuelve_403(
        self, client, regular_user, group, perm_view_user
    ):
        resp = client.post(
            '/api/v1/auth/',
            {'email': regular_user.email, 'password': 'RegularPass123!'},
            content_type='application/json',
        )
        csrf = client.cookies['csrftoken'].value
        response = client.post(
            self._group_perms_url(group.pk),
            {'permission': perm_view_user.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf,
        )
        assert response.status_code == 403

    def test_post_permiso_ya_asignado_devuelve_200_sin_duplicar(
        self, auth_client_manager, group, perm_view_user, csrf_manager
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.post(
            self._group_perms_url(group.pk),
            {'permission': perm_view_user.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 200
        assert group.permissions.filter(pk=perm_view_user.pk).count() == 1

    def test_post_grupo_protegido_sin_superuser_devuelve_403(
        self, auth_client_manager, protected_group, perm_view_user, csrf_manager
    ):
        response = auth_client_manager.post(
            self._group_perms_url(protected_group.pk),
            {'permission': perm_view_user.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 403

    def test_post_grupo_protegido_como_superuser_devuelve_200(
        self, auth_client_superuser, protected_group, perm_view_user, csrf_super
    ):
        response = auth_client_superuser.post(
            self._group_perms_url(protected_group.pk),
            {'permission': perm_view_user.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_super,
        )
        assert response.status_code == 200

    def test_put_reemplaza_permisos(
        self, auth_client_manager, group,
        perm_view_user, perm_change_user, csrf_manager
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.put(
            self._group_perms_url(group.pk),
            {'permissions': [perm_change_user.pk], 'reason': 'Reemplazo'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 200
        assert group.permissions.filter(pk=perm_change_user.pk).exists()
        assert not group.permissions.filter(pk=perm_view_user.pk).exists()

    def test_put_vacio_quita_todos_los_permisos(
        self, auth_client_manager, group, perm_view_user, csrf_manager
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.put(
            self._group_perms_url(group.pk),
            {'permissions': []},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 200
        assert group.permissions.count() == 0

    def test_put_sin_cambios_devuelve_200(
        self, auth_client_manager, group, perm_view_user, csrf_manager
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.put(
            self._group_perms_url(group.pk),
            {'permissions': [perm_view_user.pk]},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 200

    def test_delete_elimina_permiso(
        self, auth_client_manager, group, perm_view_user, csrf_manager
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.delete(
            self._group_perms_url(group.pk),
            {'permission': perm_view_user.pk, 'reason': 'Revocación'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 200
        assert not group.permissions.filter(pk=perm_view_user.pk).exists()

    def test_delete_permiso_no_asignado_devuelve_200(
        self, auth_client_manager, group, perm_view_user, csrf_manager
    ):
        response = auth_client_manager.delete(
            self._group_perms_url(group.pk),
            {'permission': perm_view_user.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 200

    def test_delete_grupo_protegido_sin_superuser_devuelve_403(
        self, auth_client_manager, superuser, protected_group, perm_view_user, csrf_manager
    ):
        protected_group.permissions.add(perm_view_user)
        response = auth_client_manager.delete(
            self._group_perms_url(protected_group.pk),
            {'permission': perm_view_user.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 403

    def test_add_permission_via_http_crea_log(
        self, auth_client_manager, manager_user, group, perm_view_user, csrf_manager
    ):
        initial = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERM_ADDED,
        ).count()

        auth_client_manager.post(
            self._group_perms_url(group.pk),
            {'permission': perm_view_user.pk, 'reason': 'Audit HTTP test'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        new_count = AuthorizationAuditLog.objects.filter(
            target_group=group,
            change_type=AuthorizationAuditLog.ChangeType.PERM_ADDED,
        ).count()
        assert new_count == initial + 1

    def test_log_visible_en_audit_endpoint(
        self, auth_client_manager, manager_user, group, perm_view_user, csrf_manager
    ):
        auth_client_manager.post(
            self._group_perms_url(group.pk),
            {'permission': perm_view_user.pk},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        response = auth_client_manager.get('/api/v1/authorization/audit/')
        assert response.status_code == 200
        change_types = [r['change_type'] for r in response.json().get('results', [])]
        assert AuthorizationAuditLog.ChangeType.PERM_ADDED in change_types

    def test_post_permission_id_inexistente_devuelve_400(
        self, auth_client_manager, group, csrf_manager
    ):
        response = auth_client_manager.post(
            self._group_perms_url(group.pk),
            {'permission': 99999},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 400

    def test_put_permission_ids_invalidos_devuelve_400(
        self, auth_client_manager, group, csrf_manager
    ):
        response = auth_client_manager.put(
            self._group_perms_url(group.pk),
            {'permissions': [99999, 88888]},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 400

    def test_put_campo_requerido_ausente_devuelve_400(
        self, auth_client_manager, group, csrf_manager
    ):
        response = auth_client_manager.put(
            self._group_perms_url(group.pk),
            {},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_manager,
        )
        assert response.status_code == 400

    def test_retrieve_grupo_incluye_permissions(
        self, auth_client_manager, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.get(
            f'/api/v1/authorization/groups/{group.pk}/'
        )
        assert response.status_code == 200
        data = response.json()
        assert 'permissions' in data
        perm_ids = [p['id'] for p in data['permissions']]
        assert perm_view_user.pk in perm_ids

    def test_retrieve_grupo_permissions_incluye_codename(
        self, auth_client_manager, group, perm_view_user
    ):
        group.permissions.add(perm_view_user)
        response = auth_client_manager.get(
            f'/api/v1/authorization/groups/{group.pk}/'
        )
        data = response.json()
        perm = next(p for p in data['permissions'] if p['id'] == perm_view_user.pk)
        assert 'codename' in perm
        assert 'name' in perm
        assert perm['codename'] == perm_view_user.codename