from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate, update_session_auth_hash
from .models import User
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from .serializers import UserSerializer, UserUpdateSerializer
from .permissions import IsModeratorOrAdmin

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
                
                tokens = OutstandingToken.objects.filter(user=token.payload.get('user_id'))
                for token in tokens:
                    try:
                        BlacklistedToken.objects.get_or_create(token=token)
                    except Exception as e:
                        pass

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

            tokens = OutstandingToken.objects.filter(user=user)
            for token in tokens:
                try:
                    BlacklistedToken.objects.get_or_create(token=token)
                except Exception as e:
                    pass

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

#Esta es la vista que devuelve la información del perfil del usuario
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user

        user_data = {
            'username': user.name,
            'email': user.email,
            'country': user.country,
            'about': user.about,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'profile_picture': request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
            'social_youtube': user.social_youtube,
            'social_facebook': user.social_facebook,
            'social_twitter': user.social_twitter
        }
    
        return Response(user_data, status=status.HTTP_200_OK)

#Esta es la vista que devuelve la información de todos los usuarios (activos)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(is_active=True).order_by('id')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserUpdateViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated, IsModeratorOrAdmin]
    
class UpdateUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        if 'nombre' in data:
            user.name = data['nombre']
        if 'pais' in data:
            user.country = data['pais']
        if 'facebook_link' in data:
            user.social_facebook = data['facebook_link']
        if 'twitter_link' in data:
            user.social_twitter = data['twitter_link']
        if 'youtube_link' in data:
            user.social_youtube = data['youtube_link']
        if 'about_me' in data:
            user.about = data['about_me']

        user.save()
        return Response({"message": "Perfil actualizado correctamente"}, status=status.HTTP_200_OK)
    
class UpdateUserPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        old_password = data.get('oldPassword')
        new_password = data.get('newPassword')
        new_password_confirm = data.get('newPasswordConfirm')

        if not user.check_password(old_password):
            return Response({"error": "La contraseña actual es incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
        if not new_password or not new_password_confirm:
            return Response({"error": "Todos los campos son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != new_password_confirm:
            return Response({"error": "Las nuevas contraseñas no coinciden"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        update_session_auth_hash(request, user)
        return Response({"message": "Contraseña actualizada correctamente"}, status=status.HTTP_200_OK)
    
class UpdateUserEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_email = request.data.get('correo')
        contrasena = request.data.get('password')
        if not new_email:
            return Response({"error": "Debe proporcionar un nuevo correo"}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(contrasena):
            return Response({"error": "La contraseña actual es incorrecta"}, status=status.HTTP_400_BAD_REQUEST)
        if user.email == new_email:
            return Response({"error": "Este es tu correo actual."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=new_email).exists():
            return Response({'error': 'Ya existe un usuario con este correo electrónico.'}, status=status.HTTP_400_BAD_REQUEST)
        user.email = new_email
        user.save()
        return Response({"message": "Correo actualizado correctamente"}, status=status.HTTP_200_OK)