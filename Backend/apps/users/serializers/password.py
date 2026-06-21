from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.users.services.user_account import change_user_password


class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(
        write_only=True, trim_whitespace=False, validators=[validate_password]
    )
 
    def validate(self, attrs):
        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "La nueva contraseña debe ser diferente a la actual."}
            )
        return attrs
 
    def save(self, **kwargs):
        user = self.context["request"].user
        try:
            change_user_password(
                user,
                current_password=self.validated_data["current_password"],
                new_password=self.validated_data["new_password"],
            )
        except ValueError as exc:
            raise serializers.ValidationError({"current_password": str(exc)})
        return user