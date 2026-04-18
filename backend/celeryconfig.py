from app.core.config import settings

broker_url = settings.redis_url
result_backend = settings.redis_url

accept_content = ["json"]
task_serializer = "json"
result_serializer = "json"
timezone = "UTC"
enable_utc = True

worker_prefetch_multiplier = 1
task_acks_late = True
task_track_started = True
result_expires = 3600

broker_connection_retry_on_startup = True
broker_transport_options = {
    "visibility_timeout": 3600,
    "socket_timeout": 30,
    "socket_connect_timeout": 10,
}

worker_max_tasks_per_child = 100
worker_send_task_events = True
task_send_sent_event = True

# Timeout controls
soft_time_limit = 120
time_limit = 180

# Routing / pools
task_default_queue = "default_pool"
task_routes = {
    "app.tasks.extraction.*": {"queue": "extraction_pool"},
    "app.tasks.analysis.*": {"queue": "analysis_pool"},
    "app.tasks.communication.*": {"queue": "communication_pool"},
    "app.tasks.worker.*": {"queue": "default_pool"},
}

# Rate limits for external APIs
# Adjust based on provider quotas.
task_annotations = {
    "app.tasks.analysis.run_claim_analysis": {"rate_limit": "30/m"},
    "app.tasks.communication.generate_stakeholder_message": {"rate_limit": "60/m"},
}
