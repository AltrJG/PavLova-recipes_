from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.users.models import User
from .public import SocialLinkSerializer, ProfilePictureSerializer
from apps.users.services.user_account import set_user_password
from django.contrib.auth.models import Group

class AdminUserDetailSerializer(serializers.ModelSerializer):

    social_links = SocialLinkSerializer(many=True, read_only=True)
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name',
    )
    group_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.none(),
        source='groups',
        write_only=True,
        required=False,
    )
    profile_picture = ProfilePictureSerializer(read_only=True)


    class Meta:
        model = User
        fields = ['id', 'username', 'is_active', 'is_staff', 'is_superuser', 'last_login', 'date_joined', 'password', 'country', 'email', 'about', 'social_links', 'groups', 'group_ids', 'profile_picture']
        read_only_fields = ['is_staff', 'is_superuser', 'date_joined', 'last_login']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = super().create(validated_data)
        if password:
            set_user_password(instance, password)
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            set_user_password(instance, password)
        return instance
    
class AdminUserSerializer(serializers.ModelSerializer):

    groups = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name',
    )
    profile_picture = ProfilePictureSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'country', 'is_active', 'is_staff', 'is_superuser', 'email', 'groups', 'profile_picture']
        read_only_fields = fields