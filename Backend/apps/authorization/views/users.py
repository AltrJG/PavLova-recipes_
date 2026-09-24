from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from apps.authorization.services import user_authorization
from apps.authorization.permissions import (
    CanManageUserGroups,
    CanManageStaffStatus,
    CanManageSuperuserStatus,
)
from apps.authorization.serializers import (
    UserGroupAddRemoveSerializer,
    UserGroupAssignmentSerializer,
    UserStatusUpdateSerializer,
)
from .utils import _handle_service_errors, _get_user, DetailResponse

class UserGroupsView(APIView):
    permission_classes = [CanManageUserGroups]

    @extend_schema(
        summary="Reemplazar grupos de un usuario",
        request=UserGroupAssignmentSerializer,
        responses={200: DetailResponse},
        tags=["User Authorization"]
    )
    def post(self, request, pk):
        target = _get_user(pk)
        serializer = UserGroupAssignmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        groups = serializer.validated_data['groups']
        reason = serializer.validated_data.get('reason', '')

        try:
            user_authorization.assign_groups(
                actor=request.user,
                target=target,
                groups=groups,
                reason=reason,
                request=request,
            )
        except Exception as exc:
            return _handle_service_errors(exc)

        return Response(
            {'detail': 'Grupos del usuario actualizados.'},
            status=status.HTTP_200_OK,
        )


class UserGroupAddView(APIView):
    permission_classes = [CanManageUserGroups]

    @extend_schema(
        summary="Añadir grupo a un usuario",
        request=UserGroupAddRemoveSerializer,
        responses={200: DetailResponse},
        tags=["User Authorization"]
    )
    def post(self, request, pk):
        target = _get_user(pk)
        serializer = UserGroupAddRemoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        group = serializer.validated_data['group']
        reason = serializer.validated_data.get('reason', '')

        try:
            user_authorization.add_to_group(
                actor=request.user,
                target=target,
                group=group,
                reason=reason,
                request=request,
            )
        except Exception as exc:
            return _handle_service_errors(exc)

        return Response(
            {'detail': f"Usuario añadido al grupo '{group.name}'."},
            status=status.HTTP_200_OK,
        )


class UserGroupRemoveView(APIView):
    permission_classes = [CanManageUserGroups]

    @extend_schema(
        summary="Quitar grupo a un usuario",
        description="Se usa el verbo DELETE pero se envía el ID del grupo en el Body (Payload).",
        request=UserGroupAddRemoveSerializer,
        responses={200: DetailResponse},
        tags=["User Authorization"]
    )
    def delete(self, request, pk):
        target = _get_user(pk)
        serializer = UserGroupAddRemoveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        group = serializer.validated_data['group']
        reason = serializer.validated_data.get('reason', '')

        try:
            user_authorization.remove_from_group(
                actor=request.user,
                target=target,
                group=group,
                reason=reason,
                request=request,
            )
        except Exception as exc:
            return _handle_service_errors(exc)

        return Response(
            {'detail': f"Usuario eliminado del grupo '{group.name}'."},
            status=status.HTTP_200_OK,
        )


class UserStaffStatusView(APIView):
    permission_classes = [CanManageStaffStatus]

    @extend_schema(
        summary="Asignar o revocar estado Staff",
        request=UserStatusUpdateSerializer,
        responses={200: DetailResponse},
        tags=["User Authorization"]
    )
    def patch(self, request, pk):
        target = _get_user(pk)
        serializer = UserStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_authorization.set_staff_status(
            actor=request.user,
            target=target,
            is_staff=serializer.validated_data['status'],
            reason=serializer.validated_data.get('reason', ''),
            request=request,
        )

        return Response({'detail': "Estado staff procesado."}, status=status.HTTP_200_OK)


class UserSuperuserStatusView(APIView):
    permission_classes = [CanManageSuperuserStatus]

    @extend_schema(
        summary="Asignar o revocar estado Superuser",
        request=UserStatusUpdateSerializer,
        responses={200: DetailResponse},
        tags=["User Authorization"]
    )
    def patch(self, request, pk):
        target = _get_user(pk)
        serializer = UserStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_authorization.set_superuser_status(
            actor=request.user,
            target=target,
            is_superuser=serializer.validated_data['status'],
            reason=serializer.validated_data.get('reason', ''),
            request=request,
        )

        return Response({'detail': "Estado superusuario procesado."}, status=status.HTTP_200_OK)