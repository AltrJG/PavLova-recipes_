from .models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    profile_picture = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'country', 'profile_picture', 'role', 'status']

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