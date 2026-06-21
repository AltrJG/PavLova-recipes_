from .context import request_context
import uuid

class RequestContextLogMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        trace_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
        
        user_id = "anonymous"
        if hasattr(request, 'user') and request.user.is_authenticated:
            user_id = request.user.id

        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')

        context_data = {
            'trace_id': trace_id,
            'user_id': user_id,
            'ip_address': ip,
            'http_method': request.method,
            'request_path': request.build_absolute_uri(),
        }

        token = request_context.set(context_data)

        try:
            response = self.get_response(request)
            response['X-Request-ID'] = trace_id
            return response
            
        finally:
            request_context.reset(token)