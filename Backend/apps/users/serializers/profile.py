from rest_framework import serializers
from apps.users.models import User, ProfilePictureJob, UserSocialLink
from .public import SocialLinkSerializer, ProfilePictureSerializer


class MeUserDetailsSerializer(serializers.ModelSerializer):

    social_links = SocialLinkSerializer(many=True, read_only=True)
    profile_picture = ProfilePictureSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'country', 'email', 'about', 'social_links', 'profile_picture']
        read_only_fields = ['id', 'email']
    
    
class AdminMeUserDetailsSerializer(serializers.ModelSerializer):

    social_links = SocialLinkSerializer(many=True, read_only=True)
    profile_picture = ProfilePictureSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'is_active', 'is_staff', 'is_superuser', 'last_login', 'date_joined', 'country', 'email', 'groups', 'about', 'social_links', 'profile_picture']
        read_only_fields = ['id', 'is_active', 'is_staff', 'is_superuser', 'last_login', 'date_joined', 'email', 'groups']


class ProfilePictureUploadSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfilePictureJob
        fields = ["id", "original"]
        read_only_fields = ["id"]

    def validate_image(self, value):
        allowed_types = {'image/jpeg', 'image/png', 'image/webp'}
        max_mb = 10

        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                "Formato no permitido. Usa JPEG, PNG o WebP."
            )
        if value.size > max_mb * 1024 * 1024:
            raise serializers.ValidationError(
                f"El archivo no puede superar {max_mb}MB."
            )
        
        return value

    def create(self, validated_data):

        from apps.users.services.profile_picture import ProfilePictureService

        return ProfilePictureService.create_job(**validated_data)

class SocialLinkWriteSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserSocialLink
        fields = ("platform", "url")

class UserSocialLinksUpdateSerializer(serializers.Serializer):
    social_links = SocialLinkWriteSerializer(many=True)

    def validate_social_links(self, value):
        platforms = [item["platform"] for item in value]

        if len(platforms) != len(set(platforms)):
            raise serializers.ValidationError(
                "No puede haber plataformas repetidas."
            )

        return value