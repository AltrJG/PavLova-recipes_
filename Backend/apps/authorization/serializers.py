from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from rest_framework import serializers
from apps.authorization.models import AuthorizationAuditLog, GroupMetadata, GroupImage
from apps.authorization.services.group_authorization import create_group, update_group

User = get_user_model()

class GroupImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupImage
        fields = ['id', 'image', 'created_at', 'updated_at']
        read_only_fields = fields


class GroupMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMetadata
        fields = ['description', 'is_protected', 'created_at', 'updated_at']
        read_only_fields = fields


class GroupMetadataWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMetadata
        fields = ['description', 'is_protected']


class GroupMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active', 'is_staff']
        read_only_fields = fields


class GroupListSerializer(serializers.ModelSerializer):
    description = serializers.CharField(source='metadata.description', default='', read_only=True)
    is_protected = serializers.BooleanField(source='metadata.is_protected', default=False, read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    image = GroupImageSerializer(source='group_image', read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'is_protected', 'member_count', 'image']
        read_only_fields = fields

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename']
        read_only_fields = fields

class GroupDetailSerializer(serializers.ModelSerializer):
    metadata = GroupMetadataSerializer(read_only=True)
    image = GroupImageSerializer(source='group_image', read_only=True)
    members = GroupMemberSerializer(many=True, read_only=True, source='custom_user_set')
    member_count = serializers.IntegerField(read_only=True)
    permissions = PermissionSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'metadata', 'image', 'member_count', 'members', 'permissions']
        read_only_fields = fields


class GroupWriteSerializer(serializers.ModelSerializer):
    description = serializers.CharField(required=False, allow_blank=True, default='')
    is_protected = serializers.BooleanField(required=False, default=False)
    reason = serializers.CharField(required=False, allow_blank=True, write_only=True, default='')

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'is_protected', 'reason']
        read_only_fields = ['id']

    def create(self, validated_data):
        reason = validated_data.pop('reason', '')
        request = self.context.get('request')

        return create_group(
            actor=request.user,
            reason=reason,
            request=request,
            **validated_data
        )

    def update(self, instance, validated_data):
        reason = validated_data.pop('reason', '')
        request = self.context.get('request')

        return update_group(
            actor=request.user,
            group=instance,
            reason=reason,
            request=request,
            **validated_data
        )


class GroupMembershipSerializer(serializers.Serializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    reason = serializers.CharField(required=False, allow_blank=True, default='')


class GroupMembersBulkSerializer(serializers.Serializer):
    users = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        allow_empty=True,
    )
    reason = serializers.CharField(required=False, allow_blank=True, default='')

class GroupPermissionAssignmentSerializer(serializers.Serializer):
    permission = serializers.PrimaryKeyRelatedField(queryset=Permission.objects.all())
    reason = serializers.CharField(required=False, allow_blank=True, default='')

class GroupPermissionsBulkSerializer(serializers.Serializer):
    permissions = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(),
        many=True,
        allow_empty=True,
    )
    reason = serializers.CharField(required=False, allow_blank=True, default='')

class UserGroupAssignmentSerializer(serializers.Serializer):
    groups = serializers.PrimaryKeyRelatedField(
        queryset=Group.objects.all(),
        many=True,
        allow_empty=True,
    )
    reason = serializers.CharField(required=False, allow_blank=True, default='')


class UserGroupAddRemoveSerializer(serializers.Serializer):
    group = serializers.PrimaryKeyRelatedField(queryset=Group.objects.all())
    reason = serializers.CharField(required=False, allow_blank=True, default='')


class UserStatusUpdateSerializer(serializers.Serializer):
    status = serializers.BooleanField(help_text="True para otorgar, False para revocar.")
    reason = serializers.CharField(required=False, allow_blank=True, default='')


class AuditLogActorSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username', 'email']
        read_only_fields = fields


class AuditLogGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Group
        fields = ['id', 'name']
        read_only_fields = fields


class AuthorizationAuditLogSerializer(serializers.ModelSerializer):
    actor = AuditLogActorSerializer(read_only=True)
    target_user = AuditLogActorSerializer(read_only=True)
    target_group = AuditLogGroupSerializer(read_only=True)
    
    change_type_display = serializers.CharField(source='get_change_type_display', read_only=True)

    class Meta:
        model = AuthorizationAuditLog
        fields = [
            'id', 'actor', 
            'target_user', 'target_group', 
            'target_object_id', 'target_name', 'target_type',
            'change_type', 'change_type_display',
            'reason', 'before', 'after', 'metadata',
            'created_at',
        ]
        read_only_fields = fields