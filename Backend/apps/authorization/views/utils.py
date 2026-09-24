from typing import TYPE_CHECKING
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status, serializers
from rest_framework.response import Response
from drf_spectacular.utils import inline_serializer

from apps.authorization.exceptions import (
    AuthorizationPermissionError,
    GroupAlreadyAssignedError,
    GroupNotAssignedError,
    SelfModificationError,
)

if TYPE_CHECKING:
    from apps.users.models import User
else:
    User = get_user_model()

DetailResponse = inline_serializer('DetailResponse', fields={'detail': serializers.CharField()})

def _handle_service_errors(exc: Exception) -> Response:
    if isinstance(exc, (SelfModificationError, AuthorizationPermissionError)):
        return Response({'detail': str(exc)}, status=status.HTTP_403_FORBIDDEN)
    
    if isinstance(exc, (GroupAlreadyAssignedError, GroupNotAssignedError)):
        return Response({'detail': str(exc)}, status=status.HTTP_409_CONFLICT)
    
    if isinstance(exc, ValueError):
        return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        
    raise exc


def _get_user(pk) -> "User":
    return get_object_or_404(User, pk=pk)