from unittest.mock import MagicMock, patch, PropertyMock

import pytest

from apps.authorization.exceptions import (
    AuthorizationPermissionError,
    SelfModificationError,
)
from apps.authorization.services.guards import (
    guard_create_protected_group,
    guard_locked_group_protection,
    guard_manage_groups,
    guard_manage_staff,
    guard_manage_superusers,
    guard_modify_group_protection,
    guard_protected_groups,
    guard_self,
    guard_superuser_target,
)



def make_user(
    pk='user-1',
    is_superuser=False,
    is_staff=False,
    perms=None,
):
    user = MagicMock()
    user.pk = pk
    user.is_superuser = is_superuser
    user.is_staff = is_staff
    user.has_perm = lambda perm: perm in (perms or set())
    return user


def make_group(pk=1, name='Test Group', is_protected=False):
    group = MagicMock()
    group.pk = pk
    group.name = name
    metadata = MagicMock()
    metadata.is_protected = is_protected
    group.metadata = metadata
    return group


class TestGuardSelf:

    def test_mismo_usuario_lanza_self_modification(self):
        actor = make_user(pk='user-1')
        target = make_user(pk='user-1')
        with pytest.raises(SelfModificationError):
            guard_self(actor, target)

    def test_usuarios_distintos_no_lanza(self):
        actor = make_user(pk='user-1')
        target = make_user(pk='user-2')
        guard_self(actor, target)



class TestGuardSuperuserTarget:

    def test_no_superuser_no_puede_modificar_superuser(self):
        actor = make_user(is_superuser=False)
        target = make_user(is_superuser=True)
        with pytest.raises(AuthorizationPermissionError, match="superusuario"):
            guard_superuser_target(actor, target)

    def test_superuser_puede_modificar_superuser(self):
        actor = make_user(is_superuser=True)
        target = make_user(is_superuser=True)
        guard_superuser_target(actor, target)

    def test_no_superuser_puede_modificar_no_superuser(self):
        actor = make_user(is_superuser=False)
        target = make_user(is_superuser=False)
        guard_superuser_target(actor, target)



class TestGuardManageGroups:

    def test_superuser_siempre_puede(self):
        actor = make_user(is_superuser=True)
        guard_manage_groups(actor)

    def test_con_permiso_puede(self):
        actor = make_user(perms={'users.manage_user_groups'})
        guard_manage_groups(actor)

    def test_sin_permiso_ni_superuser_lanza(self):
        actor = make_user()
        with pytest.raises(AuthorizationPermissionError, match="gestionar grupos"):
            guard_manage_groups(actor)

    def test_is_staff_sin_permiso_lanza(self):
        """is_staff no equivale a manage_user_groups."""
        actor = make_user(is_staff=True)
        with pytest.raises(AuthorizationPermissionError):
            guard_manage_groups(actor)


class TestGuardProtectedGroups:

    def test_superuser_puede_operar_grupos_protegidos(self):
        actor = make_user(is_superuser=True)
        with patch(
            'apps.authorization.services.guards.GroupMetadata.objects.filter'
        ):
            guard_protected_groups(actor, {1, 2})

    def test_set_vacio_no_consulta_db(self):
        actor = make_user()
        with patch(
            'apps.authorization.services.guards.GroupMetadata.objects.filter'
        ) as mock_filter:
            guard_protected_groups(actor, set())
            mock_filter.assert_not_called()

    def test_no_superuser_grupo_protegido_lanza(self):
        actor = make_user(is_superuser=False)
        mock_metadata = MagicMock()
        mock_metadata.group.name = 'Admins'

        with patch(
            'apps.authorization.services.guards.GroupMetadata.objects'
            '.filter'
        ) as mock_filter:
            mock_filter.return_value.select_related.return_value\
                .only.return_value.first.return_value = mock_metadata

            with pytest.raises(AuthorizationPermissionError, match="protegido"):
                guard_protected_groups(actor, {1})

    def test_no_superuser_grupo_no_protegido_no_lanza(self):
        actor = make_user(is_superuser=False)

        with patch(
            'apps.authorization.services.guards.GroupMetadata.objects'
            '.filter'
        ) as mock_filter:
            mock_filter.return_value.select_related.return_value\
                .only.return_value.first.return_value = None

            guard_protected_groups(actor, {1})


class TestGuardLockedGroupProtection:

    def test_superuser_puede_operar_grupo_protegido(self):
        actor = make_user(is_superuser=True)
        group = make_group(is_protected=True)
        guard_locked_group_protection(actor, group)

    def test_no_superuser_grupo_protegido_lanza(self):
        actor = make_user(is_superuser=False)
        group = make_group(is_protected=True)
        with pytest.raises(AuthorizationPermissionError, match="protegido"):
            guard_locked_group_protection(actor, group)

    def test_no_superuser_grupo_no_protegido_no_lanza(self):
        actor = make_user(is_superuser=False)
        group = make_group(is_protected=False)
        guard_locked_group_protection(actor, group)


class TestGuardCreateProtectedGroup:

    def test_superuser_puede_crear_protegido(self):
        actor = make_user(is_superuser=True)
        guard_create_protected_group(actor, is_protected=True)

    def test_no_superuser_no_puede_crear_protegido(self):
        actor = make_user(is_superuser=False)
        with pytest.raises(AuthorizationPermissionError, match="protegidos"):
            guard_create_protected_group(actor, is_protected=True)

    def test_cualquiera_puede_crear_no_protegido(self):
        actor = make_user(is_superuser=False)
        guard_create_protected_group(actor, is_protected=False)


class TestGuardModifyGroupProtection:

    def test_superuser_puede_cambiar_proteccion(self):
        actor = make_user(is_superuser=True)
        guard_modify_group_protection(actor, is_protected=True)

    def test_no_superuser_no_puede_cambiar_proteccion(self):
        actor = make_user(is_superuser=False)
        with pytest.raises(AuthorizationPermissionError, match="protección"):
            guard_modify_group_protection(actor, is_protected=True)

    def test_none_no_activa_la_guardia(self):
        """Pasar is_protected=None significa 'no cambiar' — no debe lanzar."""
        actor = make_user(is_superuser=False)
        guard_modify_group_protection(actor, is_protected=None)


class TestGuardManageStaff:

    def test_superuser_puede_modificar_staff(self):
        actor = make_user(is_superuser=True)
        target = make_user(is_staff=True)
        guard_manage_staff(actor, target)

    def test_con_permiso_puede_modificar_no_staff(self):
        actor = make_user(perms={'users.manage_staff_status'})
        target = make_user(is_staff=False)
        guard_manage_staff(actor, target)

    def test_con_permiso_no_puede_modificar_staff(self):
        """Un non-superuser con manage_staff_status no puede tocar a otro staff."""
        actor = make_user(perms={'users.manage_staff_status'})
        target = make_user(is_staff=True)
        with pytest.raises(AuthorizationPermissionError, match="staff"):
            guard_manage_staff(actor, target)

    def test_sin_permiso_lanza(self):
        actor = make_user()
        target = make_user(is_staff=False)
        with pytest.raises(AuthorizationPermissionError):
            guard_manage_staff(actor, target)


class TestGuardManageSuperusers:

    def test_superuser_puede(self):
        actor = make_user(is_superuser=True)
        guard_manage_superusers(actor)

    def test_no_superuser_lanza(self):
        actor = make_user(is_superuser=False)
        with pytest.raises(AuthorizationPermissionError):
            guard_manage_superusers(actor)

    def test_staff_sin_superuser_lanza(self):
        """is_staff no da acceso a operaciones de superuser."""
        actor = make_user(is_staff=True, is_superuser=False)
        with pytest.raises(AuthorizationPermissionError):
            guard_manage_superusers(actor)

class TestAuditActionUnit:

    def test_lanza_si_ambos_targets_son_none(self):
        from apps.authorization.services.audit import audit_action
        actor = make_user()
        with pytest.raises(ValueError, match="exactamente un target"):
            audit_action(
                actor=actor,
                action='group_added',
                before={},
                after={},
                target_user=None,
                target_group=None,
            )

    def test_lanza_si_ambos_targets_presentes(self):
        from apps.authorization.services.audit import audit_action
        actor = make_user()
        target_user = make_user(pk='user-2')
        target_group = make_group(pk=1)
        with pytest.raises(ValueError, match="exactamente un target"):
            audit_action(
                actor=actor,
                action='group_added',
                before={},
                after={},
                target_user=target_user,
                target_group=target_group,
            )