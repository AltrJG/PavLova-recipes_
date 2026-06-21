from rest_framework import serializers
from apps.users.services.user_account import (
    confirm_email_change,
    request_email_change,
)

class EmailChangeRequestSerializer(serializers.Serializer):

    new_email = serializers.EmailField()
 
    def validate_new_email(self, value):
        return value.lower()
 
    def save(self, **kwargs):
        request = self.context["request"]
        user = request.user
 
        try:
            token = request_email_change(
                user,
                self.validated_data["new_email"],
                ip=request.META.get("REMOTE_ADDR"),
            )
        except ValueError as exc:
            raise serializers.ValidationError({"new_email": str(exc)})
        
        return token
    

class EmailChangeConfirmSerializer(serializers.Serializer):

    token = serializers.CharField(write_only=True)
 
    def save(self, **kwargs):
        try:
            return confirm_email_change(self.validated_data["token"])
        except ValueError as exc:
            raise serializers.ValidationError({"token": str(exc)})