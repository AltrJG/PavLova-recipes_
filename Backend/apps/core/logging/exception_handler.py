import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from .context import request_context 

logger = logging.getLogger(__name__)

def global_exception_handler(exc, context):

    response = exception_handler(exc, context)

    context_data = request_context.get()
    trace_id = context_data.get('trace_id', 'No disponible')

    if response is None:

        logger.exception("Error crítico no manejado en el servidor.")

        data = {
            "error": "Error Interno del Servidor",
            "message": "Ha ocurrido un problema inesperado. Nuestro equipo ha sido notificado.",
            "trace_id": trace_id
        }
        return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if isinstance(response.data, dict):
        response.data['trace_id'] = trace_id
    elif isinstance(response.data, list):
        response.data = {
            "errores": response.data,
            "trace_id": trace_id
        }
    
    return response