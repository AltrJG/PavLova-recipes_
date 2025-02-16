from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework import routers
from app import views
from .views import RegisterView

router = routers.DefaultRouter()

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
]