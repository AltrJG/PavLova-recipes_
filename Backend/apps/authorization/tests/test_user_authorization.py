import threading

import pytest
from django.contrib.auth.models import Group, Permission

from apps.authorization.exceptions import (
    AuthorizationPermissionError,
    GroupAlreadyAssignedError,
    GroupNotAssignedError,
    SelfModificationError,
)
from apps.authorization.models import AuthorizationAuditLog
from apps.authorization.services import user_authorization

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
def staff_user(db):
    from apps.users.models import User
    user = User.objects.create_user(
        email='staff@example.com',
        username='staffuser',
        password='StaffPass123!',
        is_staff=True,
    )
    perm = Permission.objects.get(codename='manage_staff_status')
    user.user_permissions.add(perm)
    return user


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
def another_user(db):
    from apps.users.models import User
    return User.objects.create_user(
        email='another@example.com',
        username='anotheruser',
        password='AnotherPass123!',
    )


@pytest.fixture
def group_a(db):
    return Group.objects.create(name='Group A')


@pytest.fixture
def group_b(db):
    return Group.objects.create(name='Group B')


@pytest.fixture
def protected_group(db):
    from apps.authorization.models import GroupMetadata
    group = Group.objects.create(name='Protected Group')
    GroupMetadata.objects.create(
        group=group,
        is_protected=True,
        description='Grupo protegido',
    )
    return group



class TestAssignGroups:

    def test_happy_path_asigna_grupos(self, manager_user, regular_user, group_a, group_b):
        log = user_authorization.assign_groups(
            actor=manager_user,
            target=regular_user,
            groups=[group_a, group_b],
        )
        assert regular_user.groups.count() == 2
        assert log.change_type == AuthorizationAuditLog.ChangeType.GROUPS_SET

    def test_set_masivo_reemplaza_grupos_existentes(
        self, manager_user, regular_user, group_a, group_b
    ):
        regular_user.groups.add(group_a)
        user_authorization.assign_groups(
            actor=manager_user,
            target=regular_user,
            groups=[group_b],
        )
        assert list(regular_user.groups.all()) == [group_b]

    def test_set_vacio_quita_todos_los_grupos(self, manager_user, regular_user, group_a):
        regular_user.groups.add(group_a)
        user_authorization.assign_groups(
            actor=manager_user,
            target=regular_user,
            groups=[],
        )
        assert regular_user.groups.count() == 0

    def test_crea_log_de_auditoria(self, manager_user, regular_user, group_a):
        user_authorization.assign_groups(
            actor=manager_user,
            target=regular_user,
            groups=[group_a],
        )
        log = AuthorizationAuditLog.objects.filter(
            actor=manager_user,
            target_user=regular_user,
            change_type=AuthorizationAuditLog.ChangeType.GROUPS_SET,
        ).first()
        assert log is not None
        assert 'groups' in log.before
        assert 'groups' in log.after

    def test_before_y_after_correctos(self, manager_user, regular_user, group_a, group_b):
        regular_user.groups.add(group_a)
        user_authorization.assign_groups(
            actor=manager_user,
            target=regular_user,
            groups=[group_b],
        )
        log = AuthorizationAuditLog.objects.filter(
            target_user=regular_user,
        ).latest('created_at')
        before_ids = {g['id'] for g in log.before['groups']}
        after_ids  = {g['id'] for g in log.after['groups']}
        assert group_a.pk in before_ids
        assert group_b.pk in after_ids
        assert group_a.pk not in after_ids

    def test_auto_modificacion_lanza(self, manager_user):
        with pytest.raises(SelfModificationError):
            user_authorization.assign_groups(
                actor=manager_user,
                target=manager_user,
                groups=[],
            )

    def test_sin_permiso_lanza(self, regular_user, another_user, group_a):
        with pytest.raises(AuthorizationPermissionError):
            user_authorization.assign_groups(
                actor=regular_user,
                target=another_user,
                groups=[group_a],
            )

    def test_no_superuser_no_puede_asignar_grupo_protegido(
        self, manager_user, regular_user, protected_group
    ):
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            user_authorization.assign_groups(
                actor=manager_user,
                target=regular_user,
                groups=[protected_group],
            )

    def test_superuser_puede_asignar_grupo_protegido(
        self, superuser, regular_user, protected_group
    ):
        user_authorization.assign_groups(
            actor=superuser,
            target=regular_user,
            groups=[protected_group],
        )
        assert regular_user.groups.filter(pk=protected_group.pk).exists()

    def test_no_puede_modificar_superuser_sin_ser_superuser(
        self, manager_user, superuser, group_a
    ):
        target_superuser = superuser
        with pytest.raises(AuthorizationPermissionError):
            user_authorization.assign_groups(
                actor=manager_user,
                target=target_superuser,
                groups=[group_a],
            )



class TestAddToGroup:

    def test_happy_path_añade_usuario_al_grupo(
        self, manager_user, regular_user, group_a
    ):
        log = user_authorization.add_to_group(
            actor=manager_user,
            target=regular_user,
            group=group_a,
        )
        assert regular_user.groups.filter(pk=group_a.pk).exists()
        assert log.change_type == AuthorizationAuditLog.ChangeType.GROUP_ADDED

    def test_grupo_ya_asignado_lanza(self, manager_user, regular_user, group_a):
        regular_user.groups.add(group_a)
        with pytest.raises(GroupAlreadyAssignedError):
            user_authorization.add_to_group(
                actor=manager_user,
                target=regular_user,
                group=group_a,
            )

    def test_log_before_no_incluye_grupo(self, manager_user, regular_user, group_a):
        user_authorization.add_to_group(
            actor=manager_user, target=regular_user, group=group_a,
        )
        log = AuthorizationAuditLog.objects.filter(
            target_user=regular_user,
            change_type=AuthorizationAuditLog.ChangeType.GROUP_ADDED,
        ).latest('created_at')
        before_ids = {g['id'] for g in log.before['groups']}
        after_ids  = {g['id'] for g in log.after['groups']}
        assert group_a.pk not in before_ids
        assert group_a.pk in after_ids

    def test_auto_modificacion_lanza(self, manager_user, group_a):
        with pytest.raises(SelfModificationError):
            user_authorization.add_to_group(
                actor=manager_user, target=manager_user, group=group_a,
            )

    def test_grupo_protegido_lanza_sin_superuser(
        self, manager_user, regular_user, protected_group
    ):
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            user_authorization.add_to_group(
                actor=manager_user,
                target=regular_user,
                group=protected_group,
            )

    def test_reason_se_guarda_en_log(self, manager_user, regular_user, group_a):
        user_authorization.add_to_group(
            actor=manager_user,
            target=regular_user,
            group=group_a,
            reason='Onboarding Q3',
        )
        log = AuthorizationAuditLog.objects.filter(
            target_user=regular_user
        ).latest('created_at')
        assert log.reason == 'Onboarding Q3'



class TestRemoveFromGroup:

    def test_happy_path_elimina_usuario_del_grupo(
        self, manager_user, regular_user, group_a
    ):
        regular_user.groups.add(group_a)
        log = user_authorization.remove_from_group(
            actor=manager_user,
            target=regular_user,
            group=group_a,
        )
        assert not regular_user.groups.filter(pk=group_a.pk).exists()
        assert log.change_type == AuthorizationAuditLog.ChangeType.GROUP_REMOVED

    def test_grupo_no_asignado_lanza(self, manager_user, regular_user, group_a):
        with pytest.raises(GroupNotAssignedError):
            user_authorization.remove_from_group(
                actor=manager_user,
                target=regular_user,
                group=group_a,
            )

    def test_grupo_protegido_lanza(self, manager_user, regular_user, protected_group):
        regular_user.groups.add(protected_group)
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            user_authorization.remove_from_group(
                actor=manager_user,
                target=regular_user,
                group=protected_group,
            )



class TestSetStaffStatus:

    def test_otorga_staff(self, staff_user, regular_user):
        user_authorization.set_staff_status(
            actor=staff_user,
            target=regular_user,
            is_staff=True,
        )
        regular_user.refresh_from_db()
        assert regular_user.is_staff is True

    def test_revoca_staff(self, superuser, another_user):
        another_user.is_staff = True
        another_user.save()
        user_authorization.set_staff_status(
            actor=superuser,
            target=another_user,
            is_staff=False,
        )
        another_user.refresh_from_db()
        assert another_user.is_staff is False

    def test_sin_cambio_devuelve_none(self, staff_user, regular_user):
        """Si el valor ya es el mismo, no debe crear log ni retornar log."""
        result = user_authorization.set_staff_status(
            actor=staff_user,
            target=regular_user,
            is_staff=False,
        )
        assert result is None
        assert not AuthorizationAuditLog.objects.filter(
            target_user=regular_user,
            change_type=AuthorizationAuditLog.ChangeType.STAFF_CHANGED,
        ).exists()

    def test_no_superuser_no_puede_modificar_staff_a_otro_staff(
        self, staff_user, another_user
    ):
        another_user.is_staff = True
        another_user.save()
        with pytest.raises(AuthorizationPermissionError, match="staff"):
            user_authorization.set_staff_status(
                actor=staff_user,
                target=another_user,
                is_staff=False,
            )

    def test_auto_modificacion_lanza(self, staff_user):
        with pytest.raises(SelfModificationError):
            user_authorization.set_staff_status(
                actor=staff_user,
                target=staff_user,
                is_staff=False,
            )

    def test_crea_log_con_before_after(self, superuser, regular_user):
        user_authorization.set_staff_status(
            actor=superuser,
            target=regular_user,
            is_staff=True,
        )
        log = AuthorizationAuditLog.objects.filter(
            target_user=regular_user,
            change_type=AuthorizationAuditLog.ChangeType.STAFF_CHANGED,
        ).latest('created_at')
        assert log.before['is_staff'] is False
        assert log.after['is_staff'] is True



class TestSetSuperuserStatus:

    def test_otorga_superuser(self, superuser, regular_user):
        user_authorization.set_superuser_status(
            actor=superuser,
            target=regular_user,
            is_superuser=True,
        )
        regular_user.refresh_from_db()
        assert regular_user.is_superuser is True

    def test_revoca_superuser(self, db):
        from apps.users.models import User
        super1 = User.objects.create_superuser(
            email='s1@example.com', username='s1', password='Pass123!'
        )
        super2 = User.objects.create_superuser(
            email='s2@example.com', username='s2', password='Pass123!'
        )
        user_authorization.set_superuser_status(
            actor=super1,
            target=super2,
            is_superuser=False,
        )
        super2.refresh_from_db()
        assert super2.is_superuser is False

    def test_ultimo_superuser_no_puede_revocarse(self, superuser):
        """El sistema no puede quedarse sin ningún superuser."""
        from apps.authorization.exceptions import AuthorizationPermissionError
        with pytest.raises(AuthorizationPermissionError, match="último"):
            user_authorization.set_superuser_status(
                actor=superuser,
                target=superuser,
                is_superuser=False,
            )

    def test_no_superuser_no_puede_otorgar_superuser(self, staff_user, regular_user):
        with pytest.raises(AuthorizationPermissionError):
            user_authorization.set_superuser_status(
                actor=staff_user,
                target=regular_user,
                is_superuser=True,
            )

    def test_sin_cambio_devuelve_none(self, superuser, regular_user):
        result = user_authorization.set_superuser_status(
            actor=superuser,
            target=regular_user,
            is_superuser=False,
        )
        assert result is None

    def test_auto_modificacion_lanza(self, superuser):
        with pytest.raises((SelfModificationError, AuthorizationPermissionError)):
            user_authorization.set_superuser_status(
                actor=superuser,
                target=superuser,
                is_superuser=False,
            )



class TestSetGroupMembers:

    def test_happy_path_añade_y_quita_miembros(
        self, manager_user, regular_user, another_user, group_a
    ):
        regular_user.groups.add(group_a)

        logs = user_authorization.set_group_members(
            actor=manager_user,
            group=group_a,
            users=[another_user],
        )
        assert group_a.custom_user_set.filter(pk=another_user.pk).exists()
        assert not group_a.custom_user_set.filter(pk=regular_user.pk).exists()
        assert len(logs) > 0

    def test_sin_cambios_devuelve_lista_vacia(
        self, manager_user, regular_user, group_a
    ):
        regular_user.groups.add(group_a)
        logs = user_authorization.set_group_members(
            actor=manager_user,
            group=group_a,
            users=[regular_user],
        )
        assert logs == []

    def test_grupo_protegido_lanza(
        self, manager_user, regular_user, protected_group
    ):
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            user_authorization.set_group_members(
                actor=manager_user,
                group=protected_group,
                users=[regular_user],
            )

    def test_no_permite_añadir_superuser(
        self, manager_user, superuser, group_a
    ):
        with pytest.raises(AuthorizationPermissionError):
            user_authorization.set_group_members(
                actor=manager_user,
                group=group_a,
                users=[superuser],
            )

    def test_crea_log_por_cada_cambio(
        self, manager_user, regular_user, another_user, group_a
    ):
        regular_user.groups.add(group_a)
        initial_count = AuthorizationAuditLog.objects.count()

        user_authorization.set_group_members(
            actor=manager_user,
            group=group_a,
            users=[another_user],
        )
        new_logs = AuthorizationAuditLog.objects.count() - initial_count
        assert new_logs == 2



class TestConcurrency:

    @pytest.mark.django_db(transaction=True)
    def test_add_to_group_no_duplica_con_requests_concurrentes(
        self, manager_user, regular_user, group_a
    ):

        errors = []
        successes = []

        def try_add():
            try:
                from apps.users.models import User
                actor  = User.objects.get(pk=manager_user.pk)
                target = User.objects.get(pk=regular_user.pk)
                user_authorization.add_to_group(
                    actor=actor,
                    target=target,
                    group=group_a,
                )
                successes.append(True)
            except GroupAlreadyAssignedError:
                errors.append('already_assigned')
            except Exception as exc:
                errors.append(str(exc))

        t1 = threading.Thread(target=try_add)
        t2 = threading.Thread(target=try_add)
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        assert group_a.custom_user_set.filter(pk=regular_user.pk).count() == 1
        assert len(successes) + len(errors) == 2

    @pytest.mark.django_db(transaction=True)
    def test_set_superuser_status_protege_ultimo_superuser(self, db):

        from apps.users.models import User
        super1 = User.objects.create_superuser(
            email='cs1@ex.com', username='cs1', password='P123!'
        )
        super2 = User.objects.create_superuser(
            email='cs2@ex.com', username='cs2', password='P123!'
        )

        errors = []

        def revoke_super2():
            try:
                actor  = User.objects.get(pk=super1.pk)
                target = User.objects.get(pk=super2.pk)
                user_authorization.set_superuser_status(
                    actor=actor, target=target, is_superuser=False,
                )
            except Exception as exc:
                errors.append(str(exc))

        def revoke_super1():
            try:
                actor  = User.objects.get(pk=super2.pk)
                target = User.objects.get(pk=super1.pk)
                user_authorization.set_superuser_status(
                    actor=actor, target=target, is_superuser=False,
                )
            except Exception as exc:
                errors.append(str(exc))

        t1 = threading.Thread(target=revoke_super1)
        t2 = threading.Thread(target=revoke_super2)
        t1.start()
        t2.start()
        t1.join()
        t2.join()

        remaining = User.objects.filter(is_superuser=True).count()
        assert remaining >= 1