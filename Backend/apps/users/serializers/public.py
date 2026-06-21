from rest_framework import serializers
from apps.users.models import User, UserSocialLink

class SocialLinkSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserSocialLink
        fields = ['id', 'platform', 'url']
        read_only_fields = fields


class PublicUserSerializer(serializers.ModelSerializer):

    profile_picture = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'country', 'profile_picture']
        read_only_fields = fields

    def get_profile_picture(self, obj) -> dict | None:

        active = next(
            (p for p in obj.profile_pictures.all() if p.status == 'processed'),
            None,
        )
        if active:
            from .profile import ActiveProfilePictureSerializer
            return ActiveProfilePictureSerializer(active, context=self.context).data
        
        return None


class PublicUserDetailsSerializer(PublicUserSerializer):

    social_links = SocialLinkSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = PublicUserSerializer.Meta.fields + ['about', 'social_links']
        read_only_fields = ['id', 'username', 'country', 'about', 'social_links', 'profile_picture']