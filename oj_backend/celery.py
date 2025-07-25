from celery import Celery
from django.conf import settings
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'oj_backend.settings')

app = Celery('your_project')
app.config_from_object('django.conf:settings', namespace='CELERY')


app.conf.task_default_priority = 5
app.conf.worker_prefetch_multiplier = 1 
app.conf.task_acks_late = True  
app.conf.task_reject_on_worker_lost = True  

app.autodiscover_tasks()