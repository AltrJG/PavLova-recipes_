from django.urls import path, include
from rest_framework import routers
from apps.users.views import (
    UserViewSet,
    LogoutView,
    CustomTokenObtainView,
    CustomTokenRefreshView,
)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', CustomTokenObtainView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='token_logout'),
]