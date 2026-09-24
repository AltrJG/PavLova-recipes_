import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db.models import Count, Prefetch
from rest_framework import permissions, status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError as DRFValidationError
from drf_spectacular.utils import extend_schema, extend_schema_view, inline_serializer
from apps.authorization.services import user_authorization, group_authorization
from apps.authorization.services.group_image import GroupImageService
from apps.authorization.permissions import CanManageGroups, CanManageUserGroups
from apps.authorization.serializers import (
    GroupDetailSerializer,
    GroupListSerializer,
    GroupMembersBulkSerializer,
    GroupMembershipSerializer,
    GroupWriteSerializer,
    PermissionSerializer,
    GroupPermissionAssignmentSerializer,
    GroupPermissionsBulkSerializer,
)
from .utils import _handle_service_errors, DetailResponse

User = get_user_model()
logger = logging.getLogger(__name__)

@extend_schema_view(
    list=extend_schema(summary="Listar grupos", tags=["Groups"]),
    retrieve=extend_schema(summary="Obtener detalles del grupo", tags=["Groups"]),
    create=extend_schema(summary="Crear un grupo", tags=["Groups"]),
    update=extend_schema(summary="Actualizar un grupo completamente", tags=["Groups"]),
    partial_update=extend_schema(summary="Actualizar un grupo parcialmente", tags=["Groups"]),
)
class GroupViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        return (
            Group.objects
            .select_related('metadata', 'group_image')
            .prefetch_related(
                'permissions',
                Prefetch('custom_user_set', queryset=User.objects.only(
                    'id', 'username', 'email', 'is_active', 'is_staff'
                ))
            )
            .annotate(member_count=Count('custom_user_set'))
        )

    def get_permissions(self):
        match getattr(self, 'action', None):
            case 'list' | 'retrieve' | 'members':
                return [permissions.IsAuthenticated()]
            case _:
                return [CanManageGroups()]

    def get_serializer_class(self):
        action = getattr(self, 'action', None)
        
        if action == 'members':
            method = getattr(self.request, 'method', 'GET')
            if method in ['POST', 'DELETE']:
                return GroupMembershipSerializer
            if method == 'PUT':
                return GroupMembersBulkSerializer
            return GroupDetailSerializer

        match action:
            case 'list':
                return GroupListSerializer
            case 'retrieve':
                return GroupDetailSerializer
            case 'create' | 'update' | 'partial_update':
                return GroupWriteSerializer
            case _:
                return GroupDetailSerializer

    def get_parsers(self):
        if getattr(self, 'action', None) == 'upload_image':
            return [MultiPartParser(), FormParser()]
            
        return super().get_parsers()

    @extend_schema(
        summary="Eliminar un grupo",
        description="Elimina el grupo. Permite enviar un 'reason' opcional en el cuerpo (payload) para la auditoría.",
        request=inline_serializer(
            'GroupDeleteRequest', 
            fields={'reason': serializers.CharField(required=False, help_text='Motivo de la eliminación')}
        ),
        responses={204: None},
        tags=["Groups"]
    )
    def destroy(self, request, *args, **kwargs):

        group = self.get_object()
        
        reason = request.data.get('reason', 'Grupo eliminado vía API.')
        
        try:
            group_authorization.delete_group(
                actor=request.user,
                group=group,
                reason=reason,
                request=request
            )
        except Exception as exc:
            return _handle_service_errors(exc)
            
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Subir imagen de grupo",
        request={'multipart/form-data': {'type': 'object', 'properties': {'image': {'type': 'string', 'format': 'binary'}}}},
        responses={202: inline_serializer('ImageUploadResponse', fields={
            'detail': serializers.CharField(),
            'job_id': serializers.CharField(),
            'trace_id': serializers.CharField(),
        })},
        tags=["Groups"]
    )
    @action(
        detail=True,
        methods=['post'],
        url_path='image',
        url_name='upload-image',
        parser_classes=[MultiPartParser, FormParser],
    )
    def upload_image(self, request, pk=None):
        group = self.get_object()
        image_file = request.FILES.get('image')

        if not image_file:
            return Response(
                {'detail': 'El campo image es requerido.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            job = GroupImageService.create_job(group=group, original=image_file)
        except DRFValidationError as exc:
            return Response(exc.detail, status=status.HTTP_409_CONFLICT)

        return Response(
            {
                'detail': 'Imagen recibida, procesando en segundo plano.',
                'job_id': str(job.pk),
                'trace_id': job.trace_id,
            },
            status=status.HTTP_202_ACCEPTED,
        )

    @extend_schema(methods=['GET'], responses=GroupDetailSerializer, summary="Ver miembros del grupo", tags=["Group Members"])
    @extend_schema(methods=['POST'], request=GroupMembershipSerializer, responses={200: DetailResponse}, summary="Añadir miembro al grupo", tags=["Group Members"])
    @extend_schema(methods=['PUT'], request=GroupMembersBulkSerializer, responses={200: DetailResponse}, summary="Sincronizar (Reemplazar) miembros", tags=["Group Members"])
    @extend_schema(methods=['DELETE'], request=GroupMembershipSerializer, responses={200: DetailResponse}, summary="Eliminar miembro del grupo", tags=["Group Members"])
    @action(
        detail=True,
        methods=['get', 'post', 'put', 'delete'],
        url_path='members',
        url_name='members',
        permission_classes=[CanManageUserGroups],
    )
    def members(self, request, pk=None):
        group = self.get_object()

        if request.method == 'GET':
            return self._members_list(group)
        if request.method == 'POST':
            return self._members_add(request, group)
        if request.method == 'PUT':
            return self._members_set(request, group)
        if request.method == 'DELETE':
            return self._members_remove(request, group)

    def _members_list(self, group):
        serializer = GroupDetailSerializer(group)
        return Response(serializer.data)

    def _members_add(self, request, group):
        serializer = GroupMembershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        target = serializer.validated_data['user']
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
            {'detail': f"Usuario '{target.username}' añadido al grupo '{group.name}'."},
            status=status.HTTP_200_OK,
        )

    def _members_set(self, request, group):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        users = serializer.validated_data['users']
        reason = serializer.validated_data.get('reason', '')

        try:
            user_authorization.set_group_members(
                actor=request.user,
                group=group,
                users=users,
                reason=reason,
                request=request,
            )
        except Exception as exc:
            return _handle_service_errors(exc)

        return Response(
            {'detail': f"Miembros del grupo '{group.name}' actualizados de forma exacta."},
            status=status.HTTP_200_OK,
        )

    def _members_remove(self, request, group):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        target = serializer.validated_data['user']
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
            {'detail': f"Usuario '{target.username}' eliminado del grupo '{group.name}'."},
            status=status.HTTP_200_OK,
        )

    @extend_schema(methods=['GET'], responses=PermissionSerializer(many=True), summary="Ver permisos del grupo", tags=["Group Permissions"])
    @extend_schema(methods=['POST'], request=GroupPermissionAssignmentSerializer, responses={200: DetailResponse}, summary="Añadir un permiso al grupo", tags=["Group Permissions"])
    @extend_schema(methods=['PUT'], request=GroupPermissionsBulkSerializer, responses={200: DetailResponse}, summary="Sincronizar (Reemplazar) permisos", tags=["Group Permissions"])
    @extend_schema(methods=['DELETE'], request=GroupPermissionAssignmentSerializer, responses={200: DetailResponse}, summary="Eliminar un permiso del grupo", tags=["Group Permissions"])
    @action(
        detail=True,
        methods=['get', 'post', 'put', 'delete'],
        url_path='permissions',
        url_name='permissions',
        permission_classes=[CanManageGroups],
    )
    def permissions(self, request, pk=None):
        group = self.get_object()

        if request.method == 'GET':
            serializer = PermissionSerializer(group.permissions.all(), many=True)
            return Response(serializer.data)

        if request.method == 'POST':
            serializer = GroupPermissionAssignmentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            try:
                group_authorization.add_permission(
                    actor=request.user,
                    group=group,
                    permission=serializer.validated_data['permission'],
                    reason=serializer.validated_data.get('reason', ''),
                    request=request,
                )
            except Exception as exc:
                return _handle_service_errors(exc)

            return Response({'detail': f"Permiso añadido al grupo '{group.name}'."}, status=status.HTTP_200_OK)
            
        if request.method == 'PUT':
            serializer = GroupPermissionsBulkSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            try:
                group_authorization.set_group_permissions(
                    actor=request.user,
                    group=group,
                    permissions=serializer.validated_data['permissions'],
                    reason=serializer.validated_data.get('reason', ''),
                    request=request,
                )
            except Exception as exc:
                return _handle_service_errors(exc)

            return Response({'detail': f"Permisos del grupo '{group.name}' actualizados."}, status=status.HTTP_200_OK)

        if request.method == 'DELETE':
            serializer = GroupPermissionAssignmentSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            try:
                group_authorization.remove_permission(
                    actor=request.user,
                    group=group,
                    permission=serializer.validated_data['permission'],
                    reason=serializer.validated_data.get('reason', ''),
                    request=request,
                )
            except Exception as exc:
                return _handle_service_errors(exc)

            return Response({'detail': f"Permiso eliminado del grupo '{group.name}'."}, status=status.HTTP_200_OK)