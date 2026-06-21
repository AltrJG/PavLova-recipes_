from celery.signals import before_task_publish, task_prerun
from .context import request_context

@before_task_publish.connect
def add_trace_id_to_task(headers=None, body=None, **kwargs):
    context = request_context.get()
    if headers is None:
        headers = {}
    headers['trace_id'] = context.get('trace_id', 'no-trace-id')

@task_prerun.connect
def load_trace_id_into_context(task_id, task, **kwargs):
    trace_id = task.request.headers.get('trace_id', 'no-trace-id')
    request_context.set({'trace_id': trace_id})