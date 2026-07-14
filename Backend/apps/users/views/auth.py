from rest_framework import status
from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.request import Request
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

COOKIE_ACCESS  = 'access'
COOKIE_REFRESH = 'refresh'

def _set_auth_cookies(response: Response, access: str, refresh: str | None = None) -> None:
    is_secure = getattr(settings, 'AUTH_COOKIE_SECURE', True)
    samesite  = getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Lax')

    response.set_cookie(
        key=COOKIE_ACCESS,
        value=access,
        max_age=int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=is_secure,
        samesite=samesite,
        path='/',
    )

    if refresh:
        response.set_cookie(
            key=COOKIE_REFRESH,
            value=refresh,
            max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
            httponly=True,
            secure=is_secure,
            samesite=samesite,
            path='/api/v1/auth/refresh/',
        )

def _delete_auth_cookies(response: Response) -> None:
    samesite  = getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Lax')

    response.delete_cookie(COOKIE_ACCESS,  path='/', samesite=samesite)
    response.delete_cookie(COOKIE_REFRESH, path='/api/v1/auth/refresh/', samesite=samesite)

@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenObtainView(APIView):
    permission_classes = []

    def post(self, request: Request) -> Response:

        serializer = TokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        access  = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']

        response = Response({'detail': 'Autenticación exitosa.'})
        _set_auth_cookies(response, access=access, refresh=refresh)

        response['X-CSRFToken'] = get_token(request)

        return response

@method_decorator(csrf_exempt, name='dispatch')
class CustomTokenRefreshView(TokenRefreshView):

    def post(self, request: Request, *args, **kwargs) -> Response:
        refresh_token = request.COOKIES.get(COOKIE_REFRESH)

        if not refresh_token:
            return Response(
                {'detail': 'Refresh token no encontrado.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, TokenError):
            error_response = Response(
                {'detail': 'Sesión expirada. Inicia sesión nuevamente.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            _delete_auth_cookies(error_response)
            return error_response
        
        access  = serializer.validated_data['access']
        refresh = serializer.validated_data.get('refresh')

        response = Response({'detail': 'Token renovado.'})
        _set_auth_cookies(response, access=access, refresh=refresh)
        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(COOKIE_REFRESH)
        response = Response({'detail': 'Sesión cerrada correctamente.'})

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()

            except TokenError:
                response = Response(
                    {"detail": "Token inválido o expirado."},
                    status=status.HTTP_400_BAD_REQUEST
                )
                _delete_auth_cookies(response)
                return response

            
        _delete_auth_cookies(response)
        return response
        
        