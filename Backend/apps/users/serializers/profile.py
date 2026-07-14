from rest_framework import serializers
from apps.users.models import User, ProfilePicture, UserSocialLink
from .public import SocialLinkSerializer

class MeUserDetailsSerializer(serializers.ModelSerializer):

    social_links = SocialLinkSerializer(many=True, read_only=True)
    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'country', 'email', 'about', 'social_links', 'profile_picture']
        read_only_fields = ['id', 'email']

    def get_profile_picture(self, obj) -> dict | None:
        active = next(
            (p for p in obj.profile_pictures.all()
             if p.status == 'processed'),
            None,
        )
        if active:
            return ActiveProfilePictureSerializer(
                active, context=self.context
            ).data
        
        return None

class ProfilePictureUploadSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProfilePicture
        fields = ['id', 'status', 'image']
        read_only_fields = ['id', 'status']

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
        return ProfilePicture.objects.create(**validated_data)


class ActiveProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilePicture
        fields = ['id', 'image', 'status', 'processed_at']
        read_only_fields = fields

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