from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.shortcuts import get_object_or_404
from .models import User, EmailVerificationCode, Ingrediente, Categoria, Etiqueta, Receta, Comentario, RecetaFavorito, PlanAlimenticio, PlanAlimenticioDia, PlanAlimenticioDiaReceta, ObjetivosAI
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from .serializers import UserSerializer, UserUpdateSerializer, ProfilePictureUpdateSerializer, UserDetailsSerializer, PasswordResetRequestSerializer, PasswordResetSerializer, IngredienteSerializer, CategoriaSerializer, EtiquetaSerializer, RecetaSerializer, ComentarioSerializer, RecetaFavoritoSerializer, PlanAlimenticioSerializer, PlanAlimenticioDiaSerializer, PlanAlimenticioDiaRecetaSerializer, ObjetivosAISerializer
from .permissions import IsModeratorOrAdmin, IsSuperUserOrReadOnly, IsStaffOrSuperUserOrReadOnly, IsOwnerOrStaffOrSuperUser
from .filters import UserFilter, IngredienteFilter, EtiquetaFilter, CategoriaFilter, RecetaFilter, MisRecetasFilter, MisFavoritosFilter
from django.core.mail import send_mail
from django.conf import settings
from django.core.exceptions import PermissionDenied
from .pagination import IngredientePagination, UserPagination, CommentPagination, RecipePagination
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import timedelta, date
from app.machine_learning.training import entrenar_modelo
from app.machine_learning.prediction import predecir_puntuacion
from app.machine_learning.load_model import get_modelo
from .throttles import LoginThrottle
#from axes.helpers import get_client_ip_address
#from axes.handlers.proxy import AxesProxyHandler
#from axes.utils import reset

#Miscellaneous>>>>>>>>>>>>>>>>>>>

def validar_archivo_imagen(file, max_size_mb=5, allowed_extensions=None, nombre_campo="archivo"):
    if not file:
        return Response({'error': f'No se proporcionó {nombre_campo}.'}, status=status.HTTP_400_BAD_REQUEST)

    max_size = max_size_mb * 1024 * 1024
    if file.size > max_size:
        return Response({'error': f'El tamaño máximo permitido es de {max_size_mb} MB.'}, status=status.HTTP_400_BAD_REQUEST)

    ext_permitidas = allowed_extensions or ['png', 'jpg', 'jpeg', 'webp']
    file_extension = file.name.split('.')[-1].lower()
    if file_extension not in ext_permitidas:
        return Response({'error': f'Formato de archivo no permitido. Usa: {", ".join(ext_permitidas)}.'}, status=status.HTTP_400_BAD_REQUEST)

    return None

#>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

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
    throttle_classes = [LoginThrottle]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, username=email, password=password)
        if user is None:
            #AxesProxyHandler().user_login_failed(
            #    sender=LoginView,
            #    credentials={'username': email},
            #    request=request
            #)
            return Response({'error': 'Credenciales inválidas.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        #AxesProxyHandler().user_logged_in(
        #    sender=LoginView,
        #    request=request,
        #    user=user
        #)

        #reset(get_client_ip_address(request))
        
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
            response = Response({'error': 'Usuario .'}, status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie('refresh_token')
            return response

#Esta es la vista que devuelve la información del perfil del usuario
class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user

        user_data = {
            'id': user.id,
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
    pagination_class = UserPagination
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
            
            verification_link = f"http://localhost:5173/verify_email/{verification_code.code}/"
            
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
    pagination_class = IngredientePagination
    permission_classes = [IsAuthenticated]
    filterset_class = IngredienteFilter

    def get_queryset(self):
        user = self.request.user

        if not user.is_staff and not user.is_superuser:
            return Ingrediente.objects.filter(creador=user) | Ingrediente.objects.filter(tipo='global')

        return Ingrediente.objects.all()
    
    @action(detail=False, methods=['get'], url_path='all', pagination_class=None)
    def listar_sin_paginacion(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

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

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsSuperUserOrReadOnly]
    filterset_class = CategoriaFilter

    @action(detail=False, methods=['get'], url_path='all', pagination_class=None)
    def listar_sin_paginacion(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class EtiquetaViewSet(viewsets.ModelViewSet):
    queryset = Etiqueta.objects.all()
    serializer_class = EtiquetaSerializer
    permission_classes = [IsStaffOrSuperUserOrReadOnly]
    filterset_class = EtiquetaFilter

    @action(detail=False, methods=['get'], url_path='all', pagination_class=None)
    def listar_sin_paginacion(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class RecetaViewSet(viewsets.ModelViewSet):
    serializer_class = RecetaSerializer
    filterset_class = RecetaFilter
    pagination_class = RecipePagination
    
    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return Receta.objects.filter(visibilidad=True)

        if user.is_staff or user.is_superuser:
            return Receta.objects.all()

        return Receta.objects.filter(
            Q(visibilidad=True) | Q(creador=user)
        )

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrStaffOrSuperUser()]
        return []

    def perform_create(self, serializer):
        serializer.save(creador=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.instance
        serializer.save(creador=instance.creador)

    @action(detail=True, methods=['post', 'put'], url_path='upload_imagen')
    def upload_imagen(self, request, pk=None):
        receta = self.get_object()
        imagen = request.FILES.get('foto_receta')
        if 'foto_receta' not in request.FILES:
            return Response({'error': 'No se proporcionó imagen.'}, status=status.HTTP_400_BAD_REQUEST)
        
        error_response = validar_archivo_imagen(
            imagen,
            max_size_mb=5,
            allowed_extensions=['png', 'jpg', 'jpeg', 'webp'],
            nombre_campo="foto_receta"
        )
        if error_response:
            return error_response

        receta.foto_receta = imagen
        receta.save(update_fields=['foto_receta'])
        return Response({'mensaje': 'Imagen subida con éxito'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='mis-recetas', permission_classes=[IsAuthenticated])
    def mis_recetas(self, request):
        queryset = Receta.objects.filter(creador=request.user)

        filter_backend = DjangoFilterBackend()
        filterset = MisRecetasFilter(request.GET, queryset=queryset, request=request)

        if filterset.is_valid():
            queryset = filterset.qs
        else:
            return Response({"error": "Parámetros de filtro inválidos", "detalles": filterset.errors}, status=status.HTTP_400_BAD_REQUEST)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='por-usuario/(?P<user_id>[^/.]+)')
    def recetas_por_usuario(self, request, user_id=None):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        current_user = request.user

        if current_user.is_staff or current_user.is_superuser:
            queryset = Receta.objects.filter(creador=user)

        elif current_user.is_authenticated and current_user == user:
            queryset = Receta.objects.filter(creador=user)

        else:
            queryset = Receta.objects.filter(creador=user, visibilidad=True)

        filter_backend = DjangoFilterBackend()
        filterset = RecetaFilter(request.GET, queryset=queryset, request=request)

        if filterset.is_valid():
            queryset = filterset.qs
        else:
            return Response({"error": "Parámetros de filtro inválidos", "detalles": filterset.errors}, status=status.HTTP_400_BAD_REQUEST)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], url_path='cambiar-visibilidad', permission_classes=[IsAuthenticated, IsOwnerOrStaffOrSuperUser])
    def cambiar_visibilidad(self, request, pk=None):
        receta = self.get_object()

        nueva_visibilidad = request.data.get('visibilidad')

        if nueva_visibilidad is None:
            return Response({'error': 'Debes proporcionar el campo "visibilidad".'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(nueva_visibilidad, bool) and not str(nueva_visibilidad).lower() in ['true', 'false']:
            return Response({'error': '"visibilidad" debe ser un valor booleano (true o false).'}, status=status.HTTP_400_BAD_REQUEST)

        if isinstance(nueva_visibilidad, str):
            nueva_visibilidad = nueva_visibilidad.lower() == 'true'

        receta.visibilidad = nueva_visibilidad
        receta.save(update_fields=['visibilidad'])

        return Response({
            'mensaje': f'La receta ahora es {"pública" if receta.visibilidad else "privada"}.',
            'visibilidad': receta.visibilidad
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['patch'], url_path='actualizar-puntuacion', permission_classes=[IsModeratorOrAdmin])
    def actualizar_puntuacion(self, request, pk=None):
        receta = self.get_object()
        puntuacion = request.data.get('puntuacion')
        verificado = request.data.get('verificado')

        if puntuacion is None and verificado is None:
            return Response({'error': 'Debes proporcionar al menos uno de los campos: "puntuacion" o "verificado".'}, status=status.HTTP_400_BAD_REQUEST)
        
        if puntuacion is not None:
            try:
                puntuacion = int(puntuacion)
                if puntuacion % 10 != 0 or puntuacion < 0 or puntuacion > 500:
                    return Response({'error': 'La puntuación debe ser un múltiplo de 10 entre 0 y 500.'}, status=status.HTTP_400_BAD_REQUEST)
                receta.puntuacion = puntuacion
            except (ValueError, TypeError):
                return Response({'error': 'La puntuación debe ser un número entero.'}, status=status.HTTP_400_BAD_REQUEST)

        if verificado is not None:
            if not isinstance(verificado, bool):
                return Response({'error': '"verificado" debe ser un valor booleano (true o false).'}, status=status.HTTP_400_BAD_REQUEST)
            receta.verificado = verificado

        receta.save()

        return Response({'mensaje': 'Puntuación actualizada correctamente.'}, status=status.HTTP_200_OK)

class ComentarioViewSet(viewsets.ModelViewSet):
    queryset = Comentario.objects.all()
    serializer_class = ComentarioSerializer
    pagination_class = CommentPagination

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrStaffOrSuperUser()]
        elif self.action == 'comentario_usuario':
            return [IsAuthenticated()]
        return []

    def get_queryset(self):
        queryset = Comentario.objects.all()
        receta_id = self.request.query_params.get('receta')
        if receta_id:
            queryset = queryset.filter(receta_id=receta_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        receta_id = self.request.data.get('receta')

        if not receta_id:
            raise PermissionDenied("Debes especificar la receta.")

        receta = Receta.objects.get(pk=receta_id)

        if Comentario.objects.filter(receta=receta, usuario=user).exists():
            raise PermissionDenied("Ya has comentado en esta receta.")

        serializer.save(usuario=user, receta=receta)

    def perform_update(self, serializer):
        instance = serializer.instance
        user = self.request.user

        if instance.usuario != user and not (user.is_staff or user.is_superuser):
            raise PermissionDenied("No puedes editar este comentario.")

        serializer.save(usuario=instance.usuario)

    def perform_destroy(self, instance):
        user = self.request.user

        if instance.usuario != user and not (user.is_staff or user.is_superuser):
            raise PermissionDenied("No puedes borrar este comentario.")

        instance.delete()

    @action(detail=False, methods=['get'], url_path='mi-comentario', permission_classes=[IsAuthenticated])
    def comentario_usuario(self, request):
        receta_id = request.query_params.get('receta')
        if not receta_id:
            return Response({"error": "Debes especificar el parámetro 'receta'."}, status=400)

        try:
            comentario = Comentario.objects.get(receta_id=receta_id, usuario=request.user)
        except Comentario.DoesNotExist:
            return Response({"detail": "El usuario no ha comentado en esta receta."}, status=404)

        serializer = self.get_serializer(comentario)
        return Response(serializer.data)
    
class RecetaFavoritoViewSet(viewsets.ModelViewSet):
    serializer_class = RecetaFavoritoSerializer
    filterset_class = MisFavoritosFilter
    pagination_class = RecipePagination

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return RecetaFavorito.objects.filter(visibilidad=True)

        if user.is_staff or user.is_superuser:
            return RecetaFavorito.objects.all()

        return RecetaFavorito.objects.filter(
            Q(visibilidad=True) | Q(creador=user)
        )
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsModeratorOrAdmin()]
        elif self.action in ['create', 'destroy', 'mis_favoritos', 'favorito_usuario']:
            return [IsAuthenticated()]
        return []

    def get_queryset(self):
        if self.action in ['list', 'retrieve']:
            return RecetaFavorito.objects.all()
        return RecetaFavorito.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        receta_id = self.request.data.get('receta')

        if not receta_id:
            raise PermissionDenied("Debes especificar la receta que quieres agregar a favoritos.")

        receta = Receta.objects.get(pk=receta_id)

        if RecetaFavorito.objects.filter(usuario=user, receta=receta).exists():
            raise PermissionDenied("Esta receta ya está en tus favoritos.")

        serializer.save(usuario=user, receta=receta)

    def perform_destroy(self, instance):
        user = self.request.user
        if instance.usuario != user and not (user.is_staff or user.is_superuser):
            raise PermissionDenied("No puedes eliminar este favorito.")
        instance.delete()

    @action(detail=False, methods=['get'], url_path='mis-favoritos', permission_classes=[IsAuthenticated])
    def mis_favoritos(self, request):
        queryset = RecetaFavorito.objects.filter(usuario=request.user, receta__visibilidad=True)
        queryset = self.filter_queryset(queryset)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='favorito-usuario', permission_classes=[IsAuthenticated])
    def favorito_usuario(self, request):
        receta_id = request.query_params.get('receta')
        if not receta_id:
            return Response({"error": "Debes especificar el parámetro 'receta'."}, status=400)

        try:
            favorito = RecetaFavorito.objects.get(receta_id=receta_id, usuario_id=request.user)
        except RecetaFavorito.DoesNotExist:
            return Response({"detail": "El usuario no ha marcado favorito en esta receta."}, status=404)

        serializer = self.get_serializer(favorito)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='por-usuario/(?P<user_id>[^/.]+)')
    def recetas_por_usuario(self, request, user_id=None):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        queryset = RecetaFavorito.objects.filter(usuario=user, receta__visibilidad=True)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class PlanAlimenticioViewSet(viewsets.ModelViewSet):
    serializer_class = PlanAlimenticioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlanAlimenticio.objects.filter(usuario=self.request.user)
    
    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.is_authenticated:
            raise PermissionDenied("Debes iniciar sesión para crear un plan alimenticio.")
        
        if PlanAlimenticio.objects.filter(usuario=user).exists():
            raise PermissionDenied("Ya tienes un plan alimenticio creado.")
        
        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)

        fecha_inicio = serializer.validated_data.get('fecha_inicio')
        fecha_fin = serializer.validated_data.get('fecha_finalizacion')

        if fecha_fin <= fecha_inicio:
            return Response({'error': 'La fecha de finalización debe ser posterior a la fecha de inicio.'}, status=status.HTTP_400_BAD_REQUEST)

        plan = serializer.save(usuario=user)

        dia_actual = fecha_inicio
        while dia_actual <= fecha_fin:
            PlanAlimenticioDia.objects.create(plan_alimenticio=plan, fecha_objetivo=dia_actual)
            dia_actual += timedelta(days=1)

        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        try:
            plan = self.get_object()
        except Exception:
            return Response({"error": "Plan alimenticio no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        if plan.usuario != request.user:
            return Response({"error": "No tienes permiso para eliminar este plan alimenticio."}, status=status.HTTP_403_FORBIDDEN)

        plan.delete()
        return Response({"mensaje": "Plan alimenticio eliminado correctamente."}, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], url_path='plan-actual')
    def obtener_plan_actual(self, request):
   
        user = request.user
        hoy = date.today()

        try:
            plan = PlanAlimenticio.objects.get(usuario=user)
        except PlanAlimenticio.DoesNotExist:
            return Response({"error": "No tienes un plan alimenticio activo."}, status=status.HTTP_404_NOT_FOUND)

        if plan.fecha_finalizacion and hoy > plan.fecha_finalizacion:
            plan.delete()
            response = Response({"error": "Tu plan alimenticio ha caducado y fue eliminado."}, status=status.HTTP_410_GONE)
            response["Cache-Control"] = "no-store"        
            return response

        for dia in plan.dias.all():
            recetas_dia = dia.recetas.select_related('receta', 'receta__creador')

            for receta_dia in recetas_dia:
                receta = receta_dia.receta
                if not receta.visibilidad and receta.creador != user:
                    receta_dia.delete()

        dias_plan = plan.dias.all().order_by('fecha_objetivo')
        ids_fechas = [{"id": dia.id, "fecha": dia.fecha_objetivo} for dia in dias_plan]

        if not dias_plan.exists():
            return Response({"error": "Tu plan alimenticio no tiene dias asignados."}, status=status.HTTP_404_NOT_FOUND)

        primer_dia = dias_plan.first()
        dia_serializer = PlanAlimenticioDiaSerializer(primer_dia, context={'request': request})
        print(plan.objetivo_sodio)

        return Response({
            "plan": {
                "id": plan.id,
                "fecha_inicio": plan.fecha_inicio,
                "fecha_finalizacion": plan.fecha_finalizacion,
                "ids_fechas": ids_fechas,
                "objetivos_nutricionales": {
                    "calorias": plan.objetivo_calorias,
                    "proteina": plan.objetivo_proteinas,
                    "carbohidratos": plan.objetivo_carbohidratos,
                    "grasas_saturadas": plan.objetivo_grasas_saturadas,
                    "grasas_insaturadas": plan.objetivo_grasas_insaturadas,
                    "grasas_trans": plan.objetivo_grasas_trans,
                    "sodio": plan.objetivo_sodio
                }
            },
            "primer_dia": dia_serializer.data,
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['put', 'patch'], url_path='actualizar-objetivos')
    def actualizar_objetivos(self, request, pk=None):
        
        user = request.user

        try:
            plan = PlanAlimenticio.objects.get(pk=pk)
        except PlanAlimenticio.DoesNotExist:
            return Response({'error': 'El plan alimenticio no existe.'}, status=status.HTTP_404_NOT_FOUND)
        
        if plan.usuario != user:
            return Response({'error': 'No tienes permiso para modificar este plan alimenticio.'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(plan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({'mensaje': 'Plan alimenticio actualizado correctamente.'}, status=status.HTTP_200_OK)
    
class PlanAlimenticioDiaViewSet(viewsets.ModelViewSet):
    serializer_class = PlanAlimenticioDiaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlanAlimenticioDia.objects.filter(plan_alimenticio__usuario=self.request.user)
    
    def retrieve(self, request, pk=None):
        
        user = request.user
        dia = get_object_or_404(PlanAlimenticioDia, pk=pk)

        if dia.plan_alimenticio.usuario != user:
            return Response({"error": "No tienes permiso para acceder a este dia del plan alimenticio."}, status=status.HTTP_403_FORBIDDEN)
        
        recetas_dia = dia.recetas.select_related('receta', 'receta__creador')
        for receta_dia in recetas_dia:
            receta = receta_dia.receta
            if not receta.visibilidad and receta.creador != user:
                receta_dia.delete()

        serializer = PlanAlimenticioDiaSerializer(dia, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class PlanAlimenticioDiaRecetaViewSet(viewsets.ModelViewSet):
    serializer_class = PlanAlimenticioDiaRecetaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlanAlimenticioDiaReceta.objects.filter(plan_alimenticio_dia__plan_alimenticio__usuario=self.request.user)
    
    @action(detail=True, methods=['put'], url_path='actualizar-recetas')
    def actualizar_recetas(self, request, pk=None):
        
        user = request.user
        dia_id = request.data.get("dia_id")
        recetas_ids = request.data.get("recetas", [])

        if not dia_id:
            return Response({"error": "Se requiere 'dia_id'."}, status=status.HTTP_400_BAD_REQUEST)
        
        plan = get_object_or_404(PlanAlimenticio, id=pk)

        if plan.usuario != user:
            return Response({"error": "No tienes permiso para modificar este plan alimenticio."}, status=status.HTTP_403_FORBIDDEN)
        
        dia = get_object_or_404(PlanAlimenticioDia, id=dia_id, plan_alimenticio=plan)

        recetas_existentes = PlanAlimenticioDiaReceta.objects.filter(plan_alimenticio_dia=dia)

        recetas_en_tabla = set(recetas_existentes.values_list("receta_id", flat=True))
        recetas_enviadas = set(recetas_ids)

        nuevas_recetas_ids = recetas_enviadas - recetas_en_tabla
        for receta_id in nuevas_recetas_ids:
            try:
                receta = Receta.objects.get(id=receta_id)

                if receta.visibilidad or receta.creador == user:
                    PlanAlimenticioDiaReceta.objects.create(
                        plan_alimenticio_dia=dia,
                        receta=receta,
                        porcion=1.0
                    )
            except Receta.DoesNotExist:
                continue

        recetas_a_eliminar = recetas_en_tabla - recetas_enviadas
        PlanAlimenticioDiaReceta.objects.filter(
            plan_alimenticio_dia=dia,
            receta_id__in=recetas_a_eliminar
        ).delete()

        recetas_actualizadas = PlanAlimenticioDiaReceta.objects.filter(plan_alimenticio_dia=dia)
        serializer = PlanAlimenticioDiaRecetaSerializer(recetas_actualizadas, many=True, context={"request": request})

        return Response({'mensaje': 'Recetas del plan alimenticio actualizadas correctamente.'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=["patch"], url_path="actualizar-porcion")
    def editar_porcion(self, request, pk=None):
        
        user = request.user
        dia_id = request.data.get("dia_id")
        receta_id = request.data.get("receta_id")
        nueva_porcion = request.data.get("nueva_porcion")


        if not (dia_id and receta_id and nueva_porcion is not None):
            return Response({"error": "Se requieren 'dia_id', 'receta_id' y 'nueva_porcion'."}, status=status.HTTP_400_BAD_REQUEST)


        plan = get_object_or_404(PlanAlimenticio, id=pk)
        if plan.usuario != user:
            return Response({"error": "No tienes permiso para modificar este plan alimenticio."}, status=status.HTTP_403_FORBIDDEN)


        dia = get_object_or_404(PlanAlimenticioDia, id=dia_id, plan_alimenticio=plan)


        dia_receta = PlanAlimenticioDiaReceta.objects.filter(
            plan_alimenticio_dia=dia, receta_id=receta_id
        ).first()

        if not dia_receta:
            return Response({"error": "La receta no pertenece a este dia del plan alimenticio."}, status=status.HTTP_404_NOT_FOUND)

        try:
            nueva_porcion = float(nueva_porcion)
            if nueva_porcion <= 0:
                raise ValueError
        except ValueError:
            return Response({"error": "La porcion debe ser un numero mayor que 0."}, status=status.HTTP_400_BAD_REQUEST)

        dia_receta.porcion = nueva_porcion
        dia_receta.save()

        serializer = PlanAlimenticioDiaRecetaSerializer(dia_receta, context={"request": request})
        return Response({'mensaje': 'Porcion actualizada correctamente.'}, status=status.HTTP_200_OK)
    
class ObjetivosAIViewSet(viewsets.ModelViewSet):
    queryset = ObjetivosAI.objects.all()
    serializer_class = ObjetivosAISerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsModeratorOrAdmin()]
        return [IsAuthenticated()]
    
class ModeloEntrenamientoViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'], url_path='entrenar-modelo')
    def entrenar_modelo(self, request):
        try:
            resultado = entrenar_modelo()
            return Response(resultado, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ModeloPrediccionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='predecir-puntuacion')
    def predecir_puntuacion(self, request):
        ids = request.data.get('ids', [])

        if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
            return Response({'error': 'Debes enviar una lista de IDs de recetas válidos.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            resultado = predecir_puntuacion(ids)
            return Response({'resultados': resultado}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ModeloRecargarViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['post'], url_path='recargar-modelo')
    def recargar_modelo(self, request):
        try:
            get_modelo(force_reload=True)
            return Response({'mensaje': 'Modelo recargado correctamente.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
