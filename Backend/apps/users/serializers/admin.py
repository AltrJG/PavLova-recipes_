from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from apps.users.models import User
from .public import SocialLinkSerializer, ProfilePictureSerializer
from apps.users.services.user_account import set_user_password
from django.contrib.auth.models import Group, Permission

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
        read_only_fields = ['date_joined', 'last_login']

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

class PermissionSerializer(serializers.ModelSerializer):
    content_type = serializers.StringRelatedField()

    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name', 'content_type']
        read_only_fields = fields


class GroupWriteSerializer(serializers.ModelSerializer):

    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Permission.objects.select_related('content_type').all(),
        source='permissions',
        write_only=True,
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'permission_ids']


class UserGroupAssignSerializer(serializers.ModelSerializer):

    group_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.none(),
        source='groups',
    )

    class Meta:
        model = User
        fields = ['group_ids']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')

        if request and request.user:
            if request.user.is_superuser:
                self.fields['group_ids'].child_relation.queryset = Group.objects.all()
            else:
                restricted = getattr(settings, 'RESTRICTED_GROUPS', [])
                self.fields['group_ids'].child_relation.queryset = Group.objects.exclude(
                    name__in=restricted
                )

class GroupUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active']
        read_only_fields = fields


class GroupListSerializer(serializers.ModelSerializer):

    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'member_count']
        read_only_fields = fields


class GroupDetailSerializer(serializers.ModelSerializer):

    permissions = PermissionSerializer(many=True, read_only=True)
    members = GroupUserSerializer(many=True, read_only=True, source='custom_user_set')

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'members']
        read_only_fields = fields