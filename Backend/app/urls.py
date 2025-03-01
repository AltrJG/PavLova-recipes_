from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from app import views
from .views import RegisterView, LoginView, LogoutView, UserInfoView, CustomTokenRefreshView, UpdateUserProfileView, UpdateUserPasswordView, UpdateUserEmailView, ProfilePictureUpdateView, UserViewSet, UserUpdateViewSet, GetUsuarioById, PasswordResetRequestView, PasswordResetView, VerifyEmailView

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user') # /users/
router.register(r'users/update', UserUpdateViewSet, basename='user_update') # /users/update/<id>/

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('user/details/', UserInfoView.as_view(), name='get_user_info'),
    path('user/update_profile/', UpdateUserProfileView.as_view(), name='update_user_profile'),
    path('user/update_password/', UpdateUserPasswordView.as_view(), name='update_user_password'),
    path('user/update_email/', UpdateUserEmailView.as_view(), name='update_user_email'),
    path("user/<int:usuario_id>/", GetUsuarioById.as_view(), name="get_usuario_by_id"),
    path('profile/picture/', ProfilePictureUpdateView.as_view(), name='profile-picture-update'),
    path('password_reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password_reset/', PasswordResetView.as_view(), name='password_reset'),
    path('verify_email/<uuid:code>/', VerifyEmailView.as_view(), name="verify_email"),
]