from .settings import *

DEBUG = False

ENABLE_SWAGGER = False
ENABLE_DEBUG_TOOLBAR = False

ALLOWED_HOSTS = ['dominio.com', 'www.dominio.com']

SECURE_CONTENT_TYPE_NOSNIFF = True

SECURE_SSL_REDIRECT = True

CSRF_COOKIE_SECURE = True

CSRF_COOKIE_HTTPONLY = True