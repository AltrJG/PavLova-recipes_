from .models import User, PasswordResetToken, Ingrediente, Categoria, Etiqueta, Receta, RecetaIngrediente, Comentario, RecetaFavorito
from rest_framework import serializers
from django.core.mail import send_mail
from django.utils import timezone
from django.conf import settings
import bleach

def sanitize_input(value):
    return bleach.clean(value, tags=[], strip=True)

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'country', 'profile_picture', 'role', 'status', 'email']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def get_role(self, obj):
        if obj.is_superuser:
            return 'Administrador'
        elif obj.is_staff:
            return 'Moderador'
        return 'Usuario'
    
    def get_status(self, obj):
        if obj.is_active:
            return 'Activado'
        return 'Desactivado'

class UserDetailsSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'country', 'profile_picture', 'role', 'status', 'email', 'about', 'social_youtube', 'social_facebook', 'social_twitter']

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and request:
            return request.build_absolute_uri(obj.profile_picture.url)
        return None

    def get_role(self, obj):
        if obj.is_superuser:
            return 'Administrador'
        elif obj.is_staff:
            return 'Moderador'
        return 'Usuario'
    
    def get_status(self, obj):
        if obj.is_active:
            return 'Activado'
        return 'Desactivado'

class UserUpdateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=[('Usuario', 'Usuario'), ('Moderador', 'Moderador'), ('Administrador', 'Administrador')], write_only=True)
    status = serializers.ChoiceField(choices=[('Activado', 'Activado'), ('Desactivado', 'Desactivado')], write_only=True)

    class Meta:
        model = User
        fields = ['role', 'status']
    
    def update(self, instance, validated_data):
        role = validated_data.get('role')
        status_value = validated_data.get('status')

        if role == 'Administrador':
            instance.is_staff = False
            instance.is_superuser = True
        elif role == 'Moderador':
            instance.is_staff = True
            instance.is_superuser = False
        else:
            instance.is_staff = False
            instance.is_superuser = False

        if status_value == 'Activado':
            instance.is_active = True
        else:
            instance.is_active = False

        instance.save()
        return instance
    
class ProfilePictureUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=True)

    class Meta:
        model = User
        fields = ['profile_picture']

    def update(self, instance, validated_data):
        profile_picture = validated_data.get('profile_picture')
        if profile_picture:
            instance.profile_picture = profile_picture
            instance.save()
        return instance
    
#---------------------------UTILIDADES-------------------------------#
    
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No existe una cuenta con este correo electrónico.")
        return value

    def create_reset_token(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)

        PasswordResetToken.objects.filter(user=user, is_used=False).delete()

        reset_token = PasswordResetToken.objects.create(user=user)

        reset_link = f"http://localhost:5173/auth/password_reset/{reset_token.token}"

        send_mail(
            subject="Restablecimiento de contraseña",
            message=f"Haz clic en el siguiente enlace para restablecer tu contraseña: {reset_link}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return reset_link
    
class PasswordResetSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, data):
        token = data.get("token")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        try:
            reset_token = PasswordResetToken.objects.get(token=token)
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError({"token": "Token inválido o inexistente."})

        if reset_token.expires_at < timezone.now():
            raise serializers.ValidationError({"token": "El enlace de restablecimiento ha expirado."})

        if reset_token.is_used:
            raise serializers.ValidationError({"token": "Este enlace ya ha sido utilizado."})

        if new_password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden."})

        return data

    def save(self):
        token = self.validated_data["token"]
        new_password = self.validated_data["new_password"]

        reset_token = PasswordResetToken.objects.get(token=token)

        user = reset_token.user
        user.set_password(new_password)
        user.save()

        reset_token.is_used = True
        reset_token.save()

        return user
    
#---------------------------INGREDIENTE-------------------------------#

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = '__all__'
        read_only_fields = ('creador',)

    def validate(self, data):
        request = self.context.get('request')
        user = request.user
        instance = self.instance

        if data.get('tipo') == 'global':
            if instance and Ingrediente.objects.filter(nombre=data['nombre'], tipo='global').exclude(id=instance.id).exists():
                raise serializers.ValidationError(
                    {'nombre': 'Ya existe un ingrediente global con este nombre.'}
                )
            elif not instance and Ingrediente.objects.filter(nombre=data['nombre'], tipo='global').exists():
                raise serializers.ValidationError(
                    {'nombre': 'Ya existe un ingrediente global con este nombre.'}
                )
            
        if data.get('tipo') == 'personal':
            if instance:
                if Ingrediente.objects.filter(nombre=data['nombre'], tipo='personal').exclude(id=instance.id).exists():
                    raise serializers.ValidationError(
                        {'nombre': 'Este nombre de ingrediente ya existe.'}
                    )
            else:
                if Ingrediente.objects.filter(nombre=data['nombre'], tipo='personal', creador=user).exists():
                    raise serializers.ValidationError(
                        {'nombre': 'Ya tienes un ingrediente personal con este nombre.'}
                    )

        return data

    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user
        validated_data['creador'] = user

        if validated_data.get('tipo', 'personal') == 'global' and not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError(
                "No tienes permisos para crear ingredientes globales."
            )

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user

        if instance.tipo == 'personal' and instance.creador != user and not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError(
                "No tienes permisos para actualizar este ingrediente."
            )

        if 'tipo' in validated_data:
            nuevo_tipo = validated_data['tipo']
            if nuevo_tipo == 'global' and not (user.is_staff or user.is_superuser):
                raise serializers.ValidationError(
                    "No tienes permisos para establecer un ingrediente como global."
                )

        return super().update(instance, validated_data)
    
    def delete(self, instance):
        request = self.context.get('request')
        user = request.user

        if instance.tipo == 'personal' and instance.creador != user and not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError(
                "No tienes permisos para eliminar este ingrediente."
            )
        
        return super().delete(instance)
    
#---------------------------RECETA-------------------------------#

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'foto_categoria']

    def validate_nombre(self, value):
        return sanitize_input(value)

class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ['id', 'nombre']

    def validate_nombre(self, value):
        return sanitize_input(value)
    
class RecetaIngredienteSerializer(serializers.ModelSerializer):
    ingrediente_id = serializers.PrimaryKeyRelatedField(
        queryset=Ingrediente.objects.all(), source='ingrediente', write_only=True
    )
    ingrediente = IngredienteSerializer(read_only=True)

    class Meta:
        model = RecetaIngrediente
        fields = ['id', 'ingrediente_id', 'ingrediente', 'cantidad', 'unidad']

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'profile_picture']

class RecetaSerializer(serializers.ModelSerializer):
    ingredientes = RecetaIngredienteSerializer(source="receta_ingredientes", many=True)
    etiquetas = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Etiqueta.objects.all(), write_only=True
    )
    etiquetas_info = EtiquetaSerializer(source='etiquetas', many=True, read_only=True)

    categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), allow_null=True, write_only=True
    )
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    creador = serializers.HiddenField(default=serializers.CurrentUserDefault())
    creador_info = UsuarioSerializer(source='creador', read_only=True)
    rating_promedio = serializers.FloatField(read_only=True, default=0.0)

    class Meta:
        model = Receta
        fields = [
            'id', 'nombre', 'porciones', 'frase', 'foto_receta', 'procedimiento',
            'tiempo_preparacion', 'tiempo_coccion', 'categoria', 'categoria_info',
            'etiquetas', 'etiquetas_info', 'ingredientes', 'creador', 'creador_info', 'rating_promedio'
        ]

    def validate_ingredientes(self, value):
        if not value:
            raise serializers.ValidationError("La receta debe tener al menos un ingrediente.")
        return value

    def create(self, validated_data):
        print(validated_data)
        ingredientes_data = validated_data.pop('receta_ingredientes')
        etiquetas = validated_data.pop('etiquetas')
        receta = Receta.objects.create(**validated_data)
        receta.etiquetas.set(etiquetas)
 
        for item in ingredientes_data:
            RecetaIngrediente.objects.create(receta=receta, **item)
 
        return receta

    def update(self, instance, validated_data):
        ingredientes_data = validated_data.pop('receta_ingredientes', None)
        etiquetas = validated_data.pop('etiquetas', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if etiquetas is not None:
            instance.etiquetas.set(etiquetas)

        if ingredientes_data is not None:
            instance.receta_ingredientes.all().delete()
            for item in ingredientes_data:
                RecetaIngrediente.objects.create(receta=instance, **item)

        return instance
    
class ComentarioSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.name', read_only=True)
    usuario_id = serializers.IntegerField(source='usuario.id', read_only=True)
    profile_picture = serializers.ImageField(source='usuario.profile_picture', read_only=True)
    
    class Meta:
        model = Comentario
        fields = [
            'id', 'usuario_id', 'usuario_nombre', 'puntuacion',
            'contenido', 'fecha_creacion', 'receta', 'profile_picture'
        ]
        read_only_fields = ['id', 'fecha_creacion', 'usuario_id', 'usuario_nombre', 'receta', 'profile_picture']

class RecetaFavoritoSerializer(serializers.ModelSerializer):
    usuario_id = serializers.IntegerField(source='usuario.id', read_only=True)
    receta_nombre = serializers.CharField(source='receta.nombre', read_only=True)
    receta_imagen_url = serializers.SerializerMethodField()
    receta_categoria = serializers.CharField(source='receta.categoria.nombre', read_only=True)
    receta_tiempo_preparacion = serializers.IntegerField(source='receta.tiempo_preparacion', read_only=True)
    receta_tiempo_coccion = serializers.IntegerField(source='receta.tiempo_coccion', read_only=True)
    receta_rating_promedio = serializers.FloatField(source='receta.rating_promedio', read_only=True)
    creador_nombre = serializers.CharField(source='receta.creador.name', read_only=True)
    
    class Meta:
        model = RecetaFavorito
        fields = [
            'id', 'usuario_id', 'receta', 'receta_nombre', 'receta_imagen_url',
            'receta_categoria', 'receta_tiempo_preparacion', 'receta_tiempo_coccion',
            'receta_rating_promedio', 'creador_nombre'
        ]
        read_only_fields = ['id', 'usuario_id', 'creador_nombre']

    def get_receta_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.receta.foto_receta and hasattr(obj.receta.foto_receta, 'url'):
            return request.build_absolute_uri(obj.receta.foto_receta.url)
        return None