from rest_framework import serializers
from apps.users.models import User, UserSocialLink, ProfilePicture

class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilePicture
        fields = ['id', 'image']
        read_only_fields = fields


class SocialLinkSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserSocialLink
        fields = ['id', 'platform', 'url']
        read_only_fields = fields


class PublicUserSerializer(serializers.ModelSerializer):

    profile_picture = ProfilePictureSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'country', 'profile_picture']
        read_only_fields = fields


class PublicUserDetailsSerializer(PublicUserSerializer):

    social_links = SocialLinkSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = PublicUserSerializer.Meta.fields + ['about', 'social_links']
        read_only_fields = ['id', 'username', 'country', 'about', 'social_links', 'profile_picture']