import django_filters
from apps.authorization.models import AuthorizationAuditLog

class AuditLogFilter(django_filters.FilterSet):
    target = django_filters.CharFilter(field_name='target_object_id')
    actor = django_filters.UUIDFilter(field_name='actor_id')
    
    class Meta:
        model = AuthorizationAuditLog
        fields = ['actor', 'change_type', 'target']