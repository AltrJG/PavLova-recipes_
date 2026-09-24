from django.urls import path, include
from rest_framework import routers

from apps.authorization.views import (
    GroupViewSet,
    UserGroupsView,
    UserGroupAddView,
    UserGroupRemoveView,
    UserStaffStatusView,
    UserSuperuserStatusView,
    UserAuditLogView,
    AuditLogListView,
)

router = routers.DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('', include(router.urls)),
    path('users/<uuid:pk>/groups/', UserGroupsView.as_view(), name='user-groups-set'),
    path('users/<uuid:pk>/groups/add/', UserGroupAddView.as_view(), name='user-groups-add'),
    path('users/<uuid:pk>/groups/remove/', UserGroupRemoveView.as_view(), name='user-groups-remove'),
    path('users/<uuid:pk>/staff/', UserStaffStatusView.as_view()),
    path('users/<uuid:pk>/superuser/', UserSuperuserStatusView.as_view()),
    path('users/<uuid:pk>/audit/', UserAuditLogView.as_view(), name='user-audit'),
    path('audit/', AuditLogListView.as_view(), name='audit-list'),
]