from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from apps.authorization.models import AuthorizationAuditLog
from apps.authorization.filters import AuditLogFilter
from apps.authorization.permissions import CanViewAuditLog
from apps.authorization.serializers import AuthorizationAuditLogSerializer

class UserAuditLogView(generics.ListAPIView):
    serializer_class = AuthorizationAuditLogSerializer
    permission_classes = [CanViewAuditLog]

    @extend_schema(
        summary="Ver auditoría de un usuario específico",
        tags=["Audit"]
    )
    def get_queryset(self):
        return (
            AuthorizationAuditLog.objects
            .filter(target_user_id=self.kwargs['pk'])
            .select_related('actor', 'target_user', 'target_group')
            .order_by('-created_at')
        )


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuthorizationAuditLogSerializer
    permission_classes = [CanViewAuditLog]

    @extend_schema(
        summary="Listar log global de auditoría",
        tags=["Audit"],
        parameters=[
            OpenApiParameter(name='actor', description='UUID del administrador que hizo el cambio', required=False, type=OpenApiTypes.UUID),
            OpenApiParameter(name='target', description='ID/UUID inmutable del objetivo (Usuario o Grupo)', required=False, type=OpenApiTypes.STR),
            OpenApiParameter(name='change_type', description='Clave del tipo de cambio (ej: group_added, super_changed)', required=False, type=OpenApiTypes.STR),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    filter_backends = [DjangoFilterBackend]
    filterset_class = AuditLogFilter

    def get_queryset(self):
        qs = AuthorizationAuditLog.objects.select_related('actor', 'target_user', 'target_group')
        
        actor_id = self.request.query_params.get('actor')
        target_id = self.request.query_params.get('target')
        change_type = self.request.query_params.get('change_type')

        if actor_id:
            qs = qs.filter(actor_id=actor_id)
        if target_id:
            qs = qs.filter(target_object_id=target_id)
        if change_type:
            qs = qs.filter(change_type=change_type)

        return qs.order_by('-created_at')