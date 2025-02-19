from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from app import views
from .views import RegisterView, LoginView, LogoutView, UserInfoView, CustomTokenRefreshView

router = routers.DefaultRouter()

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('user/details/', UserInfoView.as_view(), name='get_user_info'),
]