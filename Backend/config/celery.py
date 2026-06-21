import os
from celery import Celery


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.dev')

app = Celery('pavlova')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()