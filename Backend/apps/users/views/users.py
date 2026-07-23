from rest_framework import viewsets, status
from rest_framework.decorators import action
from apps.users.tasks import send_email_change_confirmation
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from apps.users.models import User
from apps.users.serializers import (
    PublicUserSerializer,
    PublicUserDetailsSerializer,
    MeUserDetailsSerializer,
    AdminMeUserDetailsSerializer,
    MeUserContextSerializer,
    AdminUserSerializer,
    AdminUserDetailSerializer,
    UserRegistrationSerializer,
    ChangePasswordSerializer,
    EmailChangeRequestSerializer,
    EmailChangeConfirmSerializer,
    UserGroupAssignSerializer,
    ProfilePictureUploadSerializer,
    SocialLinkSerializer,
    UserSocialLinksUpdateSerializer,
)
from apps.users.permissions import (
    CanManageGroups,
    IsSelfOrHasUserPermission,
)

from apps.core.permissions import StrictDjangoModelPermissions

from apps.core.filters import GenericTrigramSearchFilter
from apps.users.services.social_links import sync_social_links
from apps.core.pagination import DefaultCursorPagination, SearchPageNumberPagination
from apps.core.mixins import SelectiveCsrfExemptMixin
import logging

logger = logging.getLogger(__name__)

class UserViewSet(SelectiveCsrfExemptMixin, viewsets.ModelViewSet):

    csrf_exempt_actions = frozenset({
        'create',
        'confirm_email_change',
    })

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, GenericTrigramSearchFilter]
    filterset_fields = ['is_active', 'is_staff', 'is_superuser']
    search_fields = ['username']
    search_similarity_threshold = 0.30

    @property
    def pagination_class(self):
        if not hasattr(self, 'request') or self.request is None:
            return DefaultCursorPagination

        if 'search' in self.request.query_params:
            return SearchPageNumberPagination

        return DefaultCursorPagination

    def get_queryset(self):
        user = self.request.user
        
        qs = User.objects.prefetch_related('profile_picture', 'groups')

        if not (user.is_staff or user.is_superuser):
            qs = qs.filter(is_active=True)

        if self.action in ('me', 'set_password', 'request_email_change', 'upload_picture'):
            return (
                User.objects
                .filter(pk=self.request.user.pk)
                .prefetch_related('profile_picture', 'groups')
            )

        return qs
    
    def get_permissions(self):
        match self.action:
            case 'create' | 'confirm_email_change':
                return [AllowAny()]

            case 'list':
                return [IsAuthenticated()]

            case 'retrieve':
                return [AllowAny()]

            case 'update' | 'partial_update':
                return [IsSelfOrHasUserPermission()]

            case 'destroy':
                return [StrictDjangoModelPermissions()]
            
            case 'assign_groups':
                return [CanManageGroups()]

            case _:
                return [IsAuthenticated()]

    def get_serializer_class(self):
        user = self.request.user
        can_view_admin_fields = (
            user.is_authenticated and (
                user.has_perm('users.view_admin_fields') or
                user.is_superuser
            )
        )

        match self.action:
            case 'create':
                return UserRegistrationSerializer

            case 'me':
                return AdminMeUserDetailsSerializer if can_view_admin_fields else MeUserDetailsSerializer

            case 'me_context':
                return MeUserContextSerializer

            case 'set_password':
                return ChangePasswordSerializer

            case 'request_email_change':
                return EmailChangeRequestSerializer

            case 'confirm_email_change':
                return EmailChangeConfirmSerializer

            case 'assign_groups':
                return UserGroupAssignSerializer
            
            case 'social_links':
                return UserSocialLinksUpdateSerializer

            case 'list':
                return AdminUserSerializer if can_view_admin_fields else PublicUserSerializer

            case 'retrieve':
                return AdminUserDetailSerializer if can_view_admin_fields else PublicUserDetailsSerializer

            case 'update' | 'partial_update':
                return AdminUserDetailSerializer if can_view_admin_fields else MeUserDetailsSerializer

            case 'destroy':
                return AdminUserSerializer

            case _:
                return PublicUserSerializer
            
    @action(detail=False, methods=['get', 'patch'], url_path='me', url_name='me', permission_classes=[IsAuthenticated])
    def me(self, request):

        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='me/password', url_name='me-password', permission_classes=[IsAuthenticated])
    def set_password(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], url_path='me/email', url_name='me-email', permission_classes=[IsAuthenticated])
    def request_email_change(self, request):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.save()

        logger.info("Solicitud de cambio de email iniciada para usuario %s", request.user.pk)

        send_email_change_confirmation(
            user_id=str(request.user.pk),
            new_email=serializer.validated_data['new_email'],
            token=token,
        )

        return Response(
            {'detail': 'Si los datos son válidos, recibirás un correo de confirmación.'},
            status=status.HTTP_202_ACCEPTED,
        )
    
    @action(detail=False, methods=['post'], url_path='email/confirm', url_name='email-confirm', permission_classes=[AllowAny])
    def confirm_email_change(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Correo actualizado correctamente.'})
    
    @action(detail=True, methods=['patch'], url_path='groups', url_name='assign-groups', permission_classes=[CanManageGroups])
    def assign_groups(self, request, pk=None):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        logger.warning("Usuario %s modificó grupos del usuario %s", request.user.pk, pk)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='me/picture', url_name='me-picture', permission_classes=[IsAuthenticated])
    def upload_picture(self, request):

        serializer = ProfilePictureUploadSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)

        serializer.save(user=request.user)

        logger.info("Imagen subida por usuario %s. Tarea Celery encolada.", request.user.pk)

        return Response(
            status=status.HTTP_202_ACCEPTED,
        )
    
    @action(detail=False, methods=["put"], url_path="me/social-links", permission_classes=[IsAuthenticated])
    def social_links(self, request):

        serializer = UserSocialLinksUpdateSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        sync_social_links(
            request.user,
            serializer.validated_data["social_links"]
        )

        output = SocialLinkSerializer(
            request.user.social_links.all(),
            many=True
        )

        return Response(output.data)

    @action(detail=False, methods=["get"], url_path="me/context", permission_classes=[IsAuthenticated])
    def me_context(self, request):

        serializer = self.get_serializer(request.user)
        return Response(serializer.data)