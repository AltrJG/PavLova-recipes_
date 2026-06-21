from rest_framework import viewsets, generics
from django.contrib.auth.models import Group, Permission
from django.db.models import Count
from apps.users.serializers import (
    PermissionSerializer,
    GroupWriteSerializer,
    GroupListSerializer,
    GroupDetailSerializer,
)
from apps.users.permissions import (
    CanManageGroups,
)

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = [CanManageGroups]

    def get_queryset(self):
        match self.action:
            case 'list':
                return (
                    Group.objects
                    .annotate(member_count=Count('custom_user_set'))
                    .order_by('name')
                )
            case 'retrieve':
                return (
                    Group.objects
                    .prefetch_related('permissions__content_type', 'custom_user_set')
                )
            case _:
                return Group.objects.prefetch_related('permissions')

    def get_serializer_class(self):
        match self.action:
            case 'list':
                return GroupListSerializer
            case 'retrieve':
                return GroupDetailSerializer
            case 'create' | 'update' | 'partial_update':
                return GroupWriteSerializer
            case _:
                return GroupListSerializer


class PermissionListView(generics.ListAPIView):
    queryset = (
        Permission.objects
        .select_related('content_type')
        .order_by('content_type__app_label', 'codename')
    )
    serializer_class = PermissionSerializer
    permission_classes = [CanManageGroups]