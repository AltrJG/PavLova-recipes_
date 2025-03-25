from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.shortcuts import get_object_or_404
from .models import User, EmailVerificationCode, Ingrediente
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from .serializers import UserSerializer, UserUpdateSerializer, ProfilePictureUpdateSerializer, UserDetailsSerializer, PasswordResetRequestSerializer, PasswordResetSerializer, IngredienteSerializer
from .permissions import IsModeratorOrAdmin
from .filters import UserFilter
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import PermissionDenied

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

            verification_code = EmailVerificationCode.objects.create(user=user)

            verification_link = f"http://localhost:5173/verify_email/{verification_code.code}/"

            send_mail(
                subject="Verificación de correo",
                message=f"Usa este enlace para verificar tu cuenta: {verification_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[correo],
                fail_silently=False,
            )

            return Response({'message': 'Usuario registrado exitosamente. Se ha enviado un enlace de verificación a tu correo.'}, status=status.HTTP_201_CREATED)
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
    
class GetUsuarioById(APIView):
    def get(self, request, usuario_id):
        usuario = get_object_or_404(User, id=usuario_id)
        serializer = UserDetailsSerializer(usuario, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

#Esta es la vista que devuelve la información de todos los usuarios (activos)
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(is_active=True).order_by('id')
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    filterset_class = UserFilter

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
    
class ProfilePictureUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    MAX_FILE_SIZE_MB = 5
    ALLOWED_FILE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']

    def put(self, request, *args, **kwargs):
        user = request.user
        profile_picture = request.FILES.get('profile_picture')
        
        if profile_picture:
            max_size = self.MAX_FILE_SIZE_MB * 1024 * 1024
            if profile_picture.size > max_size:
                return Response(
                    {'error': f'El tamaño máximo permitido es de {self.MAX_FILE_SIZE_MB} MB.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            file_extension = profile_picture.name.split('.')[-1].lower()
            if file_extension not in self.ALLOWED_FILE_EXTENSIONS:
                return Response(
                    {'error': f'Formato de archivo no permitido. Usa: {", ".join(self.ALLOWED_FILE_EXTENSIONS)}.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        serializer = ProfilePictureUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Imagen de perfil actualizada correctamente.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)

        if serializer.is_valid():
            reset_link = serializer.create_reset_token()
            return Response(
                {"message": "Se ha enviado un enlace de restablecimiento de contraseña a tu correo electrónico."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PasswordResetView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Tu contraseña ha sido restablecida exitosamente."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyEmailView(APIView):
    def post(self, request, code):
        try:
            verification_code = EmailVerificationCode.objects.get(code=code)
            
            if not verification_code.is_valid():
                return Response({"error": "El código ya expiró o fue usado."}, status=status.HTTP_400_BAD_REQUEST)
            
            verification_code.is_used = True
            verification_code.save()

            user = verification_code.user
            user.is_active = True
            user.save()

            return Response({"message": "Correo verificado con éxito, ya puedes iniciar sesion."}, status=status.HTTP_200_OK)

        except EmailVerificationCode.DoesNotExist:
            return Response({"error": "Código inválido."}, status=status.HTTP_400_BAD_REQUEST)
        
class ResendVerificationEmailView(APIView):
    def post(self, request):
        correo = request.data.get('correo')

        if not correo:
            return Response({'error': 'El correo es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.filter(email=correo, is_active=False).first()

            if not user:
                return Response({'error': 'No se encontró un usuario con este correo electrónico o el usuario ya está activo.'}, status=status.HTTP_404_NOT_FOUND)

            verification_code = EmailVerificationCode.objects.create(user=user)
            
            verification_link = f"http://localhost:8000/app/verify_email/{verification_code.code}/"
            
            send_mail(
                subject="Verificación de correo",
                message=f"Usa este enlace para verificar tu cuenta: {verification_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[correo],
                fail_silently=False,
            )

            return Response({'message': 'Se ha enviado un nuevo enlace de verificación a tu correo.'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': 'Ocurrió un problema al reenviar el enlace de verificación.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class IngredienteViewSet(viewsets.ModelViewSet):
    serializer_class = IngredienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if not user.is_staff and not user.is_superuser:
            return Ingrediente.objects.filter(creador=user)

        return Ingrediente.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        tipo_ingrediente = serializer.validated_data.get('tipo', 'personal')
        if tipo_ingrediente == 'global' and not (user.is_staff or user.is_superuser):
            raise PermissionDenied(
                "No tienes permisos para crear ingredientes globales."
            )

        if not serializer.validated_data.get('creador'):
            serializer.validated_data['creador'] = user
        
        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.instance

        if instance.tipo == 'personal' and instance.creador != user and not (user.is_staff or user.is_superuser):
            raise PermissionDenied(
                "No tienes permisos para actualizar este ingrediente."
            )
        
        if serializer.validated_data.get('tipo') == 'global' and not (user.is_staff or user.is_superuser):
            raise PermissionDenied(
                "No tienes permisos para cambiar el tipo a global."
            )

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if instance.tipo == 'personal' and instance.creador != user and not (user.is_staff or user.is_superuser):
            raise PermissionDenied(
                "No tienes permisos para eliminar este ingrediente."
            )

        instance.delete()