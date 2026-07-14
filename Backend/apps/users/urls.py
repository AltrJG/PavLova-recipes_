from django.urls import path, include
from rest_framework import routers
from apps.users.views import (
    UserViewSet,
    LogoutView,
    GroupViewSet,
    PermissionListView,
    CustomTokenObtainView,
    CustomTokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', CustomTokenObtainView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='token_logout'),
    path('permissions/', PermissionListView.as_view(), name='permission-list'),
]