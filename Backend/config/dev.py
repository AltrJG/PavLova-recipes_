from .settings import *
import socket

DEBUG = True

ENABLE_SWAGGER = True
ENABLE_DEBUG_TOOLBAR = True

ALLOWED_HOSTS = ['*']

INSTALLED_APPS += [
    'drf_spectacular',
    'debug_toolbar',
]

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
] + MIDDLEWARE

REST_FRAMEWORK['DEFAULT_SCHEMA_CLASS'] = 'drf_spectacular.openapi.AutoSchema'

REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] += [
    'rest_framework.authentication.SessionAuthentication',
]

SPECTACULAR_SETTINGS = {
    'TITLE': 'Pavlova Recipes',
    'DESCRIPTION': 'Documentación de la API para Pavlova Recipes.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True
}

INTERNAL_IPS = ["127.0.0.1", "10.0.2.2"]

try:
    hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
    for ip in ips:
        INTERNAL_IPS.append(ip[:-1] + '1')
except Exception:
    pass