from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.users.models import User

class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password']
        read_only_fields = ['id']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)