from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate
from .models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

class RegisterView(APIView):
    def post(self, request):
        correo = request.data.get('correo')
        password = request.data.get('password')
        nombre = request.data.get('nombre', '')

        if not correo or not password:
            return Response({'error': 'Correo y contraseña son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=correo).exists():
            return Response({'error': 'Ya existe un usuario con este correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(email=correo, password=password, name=nombre)
            return Response({'message': 'Usuario registrado exitosamente.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': 'Ocurrió un problema al registrar el usuario.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        tokens = OutstandingToken.objects.filter(user=user)
        for token in tokens:
            try:
                BlacklistedToken.objects.get_or_create(token=token)
            except Exception as e:
                pass

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({
            'message': 'Inicio de sesión exitoso.',
            'access': access_token
        })
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite='None'
        )
        return response
    
class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as e:
                return Response({'error': 'El token de refresco no es válido'}, status=status.HTTP_400_BAD_REQUEST)

        response = Response({'message': 'Sesión cerrada correctamente'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        return response

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            response = Response({'error': 'No se encontró el refresh token.'}, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh_token')
            return response

        try:
            refresh = RefreshToken(refresh_token)

            user_id = refresh.payload.get('user_id')
            user = User.objects.get(id=user_id)

            OutstandingToken.objects.filter(user=user).delete()

            new_refresh = RefreshToken.for_user(user)
            new_access_token = str(new_refresh.access_token)

            response = Response({'access': new_access_token})
            response.set_cookie(
                key='refresh_token',
                value=str(new_refresh),
                httponly=True,
                secure=True,
                samesite='None'
            )
            return response

        except TokenError:
            response = Response({'error': 'El refresh token no es válido.'}, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh_token')
            return response
        except User.DoesNotExist:
            response = Response({'error': 'Usuario no encontrado.'}, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh_token')
            return response

class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user

        user_data = {
            'username': user.name,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'country': user.country,
            'about': user.about,
            'profile_picture': request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
            'social_youtube': user.social_youtube,
            'social_facebook': user.social_facebook,
            'social_twitter': user.social_twitter
        }
    
        return Response(user_data, status=status.HTTP_200_OK)