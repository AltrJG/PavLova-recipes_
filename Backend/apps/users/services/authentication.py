from rest_framework_simplejwt.authentication import JWTAuthentication
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.exceptions import PermissionDenied

csrf_validator = CsrfViewMiddleware(get_response=lambda request: None)

class CookieJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        header_result = super().authenticate(request)
        if header_result is not None:
            return header_result

        raw_token = request.COOKIES.get('access')
        if raw_token is None:
            return None

        self.enforce_csrf(request)

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
    
    def enforce_csrf(self, request):

        safe_methods = ('GET', 'HEAD', 'OPTIONS', 'TRACE')
        if request.method in safe_methods:
            return
        
        if getattr(request, '_dont_enforce_csrf_checks', False):
            return
        
        check = csrf_validator.process_view(request, None, (), {})
        if check is not None:
            raise PermissionDenied('CSRF token inválido o ausente.')