CSRF_EXEMPT_ACTIONS = frozenset()

class SelectiveCsrfExemptMixin:
    csrf_exempt_actions: frozenset = CSRF_EXEMPT_ACTIONS

    def initialize_request(self, request, *args, **kwargs):
        drf_request = super().initialize_request(request, *args, **kwargs)
        return drf_request

    def initial(self, request, *args, **kwargs):
        if self.action in self.csrf_exempt_actions:
            setattr(request, '_dont_enforce_csrf_checks', True)
        super().initial(request, *args, **kwargs)