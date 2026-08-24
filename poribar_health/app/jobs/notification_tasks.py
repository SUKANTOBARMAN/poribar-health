from app.jobs.celery_app import celery_app


@celery_app.task(name="jobs.send_sms_task")
def send_sms_task(phone: str, message: str) -> dict:
    from app.services.sms_service import send_sms

    return send_sms(phone, message)