import pytest
from django.test import override_settings

pytestmark = pytest.mark.django_db

@pytest.fixture(autouse=True)
def disable_secure_cookies(settings):
    settings.CSRF_COOKIE_SECURE = False
    settings.AUTH_COOKIE_SECURE = False
    settings.SESSION_COOKIE_SECURE = False

@pytest.fixture
def csrf_client():
    from django.test import Client
    return Client(enforce_csrf_checks=True)


@pytest.fixture
def auth_client(csrf_client, user):
    from django.urls import reverse
    from rest_framework import status

    response = csrf_client.post(
        reverse('token_obtain_pair'),
        {'email': user.email, 'password': 'TestPassword123!'},
        content_type='application/json',
    )
    assert response.status_code == status.HTTP_200_OK, (
        f"Login falló con {response.status_code}: {response.content}"
    )
    return csrf_client