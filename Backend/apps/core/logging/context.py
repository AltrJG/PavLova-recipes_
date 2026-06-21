import logging
from contextvars import ContextVar

request_context = ContextVar('request_context', default={})

class RequestContextFilter(logging.Filter):
    def filter(self, record):
        context_data = request_context.get()

        for key, value in context_data.items():
            setattr(record, key, value)
            
        return True