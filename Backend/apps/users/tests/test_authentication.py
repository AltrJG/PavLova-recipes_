import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from apps.users.models import User

pytestmark = pytest.mark.django_db

LOGIN_URL         = 'token_obtain_pair'
REFRESH_URL       = 'token_refresh'
LOGOUT_URL        = 'token_logout'
ME_URL            = 'user-me'
USER_LIST_URL     = 'user-list'
EMAIL_CONFIRM_URL = 'user-email-confirm'

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email='test@example.com',
        username='testuser',
        password='TestPassword123!',
    )


@pytest.fixture
def superuser(db):
    return User.objects.create_superuser(
        email='admin@example.com',
        username='adminuser',
        password='AdminPassword123!',
    )


@pytest.fixture
def auth_client(csrf_client, user):
    response = csrf_client.post(
        reverse(LOGIN_URL),
        {'email': user.email, 'password': 'TestPassword123!'},
        content_type='application/json',
    )
    assert response.status_code == status.HTTP_200_OK, (
        f"Login falló con {response.status_code}: {response.content}"
    )
    return csrf_client


@pytest.fixture
def csrf_token(auth_client):
    cookie = auth_client.cookies.get('csrftoken')
    assert cookie is not None, "La cookie csrftoken no fue seteada tras el login"
    return cookie.value

class TestLogin:

    def test_login_exitoso_devuelve_200(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_200_OK

    def test_login_setea_cookie_access(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert 'access' in response.cookies
        access_cookie = response.cookies['access']
        assert access_cookie['httponly']
        assert access_cookie['path'] == '/'

    def test_login_setea_cookie_refresh(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert 'refresh' in response.cookies
        refresh_cookie = response.cookies['refresh']
        assert refresh_cookie['httponly']
        assert refresh_cookie['path'] == '/api/v1/auth/refresh/'

    def test_login_setea_csrftoken_legible(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert 'csrftoken' in response.cookies
        assert not response.cookies['csrftoken']['httponly']

    def test_login_devuelve_csrf_en_header(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert 'X-CSRFToken' in response

    def test_login_no_expone_tokens_en_body(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        data = response.json()
        assert 'access' not in data
        assert 'refresh' not in data

    def test_login_credenciales_incorrectas_devuelve_401(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'WrongPassword!'},
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'access' not in response.cookies
        assert 'refresh' not in response.cookies

    def test_login_usuario_inactivo_devuelve_401(self, client, user):
        user.is_active = False
        user.save()
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_no_requiere_csrf(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_200_OK

    def test_login_actualiza_last_login(self, client, user):
        before = user.last_login
        client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        user.refresh_from_db()
        assert user.last_login != before

class TestRequestsAutenticados:

    def test_get_me_con_cookie_access_devuelve_200(self, auth_client, user):
        response = auth_client.get(reverse(ME_URL))
        assert response.status_code == status.HTTP_200_OK
        assert response.json()['email'] == user.email

    def test_get_me_sin_cookie_devuelve_401(self, client):
        response = client.get(reverse(ME_URL))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_patch_me_con_csrf_devuelve_200(self, auth_client, user, csrf_token):
        response = auth_client.patch(
            reverse(ME_URL),
            {'username': 'nuevo_username'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.username == 'nuevo_username'

    def test_patch_me_sin_csrf_devuelve_403(self, auth_client):
        response = auth_client.patch(
            reverse(ME_URL),
            {'username': 'sin_csrf'},
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_patch_me_csrf_invalido_devuelve_403(self, auth_client):
        response = auth_client.patch(
            reverse(ME_URL),
            {'username': 'csrf_invalido'},
            content_type='application/json',
            HTTP_X_CSRFTOKEN='token_completamente_invalido',
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_no_requiere_csrf(self, auth_client):
        response = auth_client.get(reverse(USER_LIST_URL))
        assert response.status_code == status.HTTP_200_OK

    def test_header_authorization_sin_csrf_funciona(self, client, user):
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = client.patch(
            reverse(ME_URL),
            {'username': 'via_header'},
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}',
        )
        assert response.status_code == status.HTTP_200_OK

class TestRefresh:

    def test_refresh_rota_tokens(self, auth_client):
        old_access = auth_client.cookies['access'].value

        response = auth_client.post(reverse(REFRESH_URL))
        assert response.status_code == status.HTTP_200_OK
        assert response.cookies['access'].value != old_access

    def test_refresh_actualiza_cookie_refresh(self, auth_client):
        old_refresh = auth_client.cookies['refresh'].value

        response = auth_client.post(reverse(REFRESH_URL))
        assert response.status_code == status.HTTP_200_OK
        assert response.cookies['refresh'].value != old_refresh

    def test_refresh_sin_cookie_devuelve_401(self, client):
        response = client.post(reverse(REFRESH_URL))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_no_requiere_csrf(self, auth_client):
        response = auth_client.post(reverse(REFRESH_URL))
        assert response.status_code == status.HTTP_200_OK

    def test_refresh_no_expone_tokens_en_body(self, auth_client):
        response = auth_client.post(reverse(REFRESH_URL))
        data = response.json()
        assert 'access' not in data
        assert 'refresh' not in data

    def test_refresh_blacklistea_token_anterior(self, auth_client):
        initial_count = BlacklistedToken.objects.count()
        response = auth_client.post(reverse(REFRESH_URL))
        assert response.status_code == status.HTTP_200_OK
        assert BlacklistedToken.objects.count() > initial_count

    def test_refresh_token_ya_usado_devuelve_401(self, auth_client):
        old_refresh = auth_client.cookies['refresh'].value

        response = auth_client.post(reverse(REFRESH_URL))
        assert response.status_code == status.HTTP_200_OK

        auth_client.cookies['refresh'] = old_refresh

        response = auth_client.post(reverse(REFRESH_URL))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_mantiene_cookie_httponly(self, auth_client):
        response = auth_client.post(reverse(REFRESH_URL))
        assert response.cookies['access']['httponly']
        assert response.cookies['refresh']['httponly']

    def test_refresh_mantiene_path_restringido(self, auth_client):
        response = auth_client.post(reverse(REFRESH_URL))
        assert response.cookies['refresh']['path'] == '/api/v1/auth/refresh/'

class TestLogout:

    def test_logout_devuelve_200(self, auth_client, csrf_token):
        response = auth_client.post(
            reverse(LOGOUT_URL),
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        assert response.status_code == status.HTTP_200_OK

    def test_logout_elimina_cookie_access(self, auth_client, csrf_token):
        response = auth_client.post(
            reverse(LOGOUT_URL),
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        assert response.cookies['access']['max-age'] == 0

    def test_logout_elimina_cookie_refresh(self, auth_client, csrf_token):
        response = auth_client.post(
            reverse(LOGOUT_URL),
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        assert response.cookies['refresh']['max-age'] == 0

    def test_logout_blacklistea_refresh_token(self, auth_client, csrf_token):
        initial_count = BlacklistedToken.objects.count()
        auth_client.post(
            reverse(LOGOUT_URL),
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        assert BlacklistedToken.objects.count() > initial_count

    def test_logout_requiere_csrf(self, auth_client):
        response = auth_client.post(reverse(LOGOUT_URL))
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_logout_sin_autenticacion_devuelve_401(self, client):
        response = client.post(reverse(LOGOUT_URL))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_despues_de_logout_access_invalido(self, auth_client, csrf_token):
        auth_client.post(
            reverse(LOGOUT_URL),
            HTTP_X_CSRFTOKEN=csrf_token,
        )
        response = auth_client.get(reverse(ME_URL))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_con_refresh_invalido_igual_limpia_cookies(self, client, user):
        client.cookies['refresh'] = 'token_invalido'
        client.cookies['access'] = 'token_invalido'

        response = client.post(
            reverse(LOGOUT_URL),
            HTTP_X_CSRFTOKEN='cualquier_valor',
        )
        assert response.status_code in (
            status.HTTP_200_OK,
            status.HTTP_401_UNAUTHORIZED,
        )

class TestVistasAnonimas:

    def test_registro_no_requiere_csrf(self, client):
        response = client.post(
            reverse(USER_LIST_URL),
            {
                'email': 'nuevo@example.com',
                'username': 'nuevousuario',
                'password': 'NuevaPassword123!',
            },
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_confirm_email_no_requiere_csrf(self, client, user):
        from apps.users.services.user_account import request_email_change
        token = request_email_change(user, 'nuevo@example.com')

        response = client.post(
            reverse(EMAIL_CONFIRM_URL),
            {'token': token},
            content_type='application/json',
        )
        assert response.status_code == status.HTTP_200_OK

class TestSeguridadCookies:

    def test_access_token_no_accesible_via_js(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert response.cookies['access']['httponly'] is True

    def test_refresh_solo_en_su_path(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert response.cookies['refresh']['path'] == '/api/v1/auth/refresh/'

    def test_csrf_cookie_legible_por_js(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert not response.cookies['csrftoken']['httponly']

    def test_samesite_lax_en_access(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert response.cookies['access']['samesite'].lower() == 'lax'

    def test_samesite_lax_en_refresh(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        assert response.cookies['refresh']['samesite'].lower() == 'lax'

    def test_tokens_no_en_body_de_respuesta(self, client, user):
        response = client.post(
            reverse(LOGIN_URL),
            {'email': user.email, 'password': 'TestPassword123!'},
            content_type='application/json',
        )
        body = response.content.decode()
        assert 'eyJ' not in body