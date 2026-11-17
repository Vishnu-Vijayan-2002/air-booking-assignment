import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_account_approval_email(self, user_id):
    """
    Celery task: Dispatches an activation notification email when a user account
    is approved by an administrator.
    """
    from authentication.models import User, ActivationEmailLog

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error(f"[Celery] User with ID {user_id} not found.")
        return False

    subject = "Your AirBooking Account Has Been Activated!"
    greeting_name = user.get_full_name() or user.username

    message_body = f"""Hello {greeting_name},

Great news! Your AirBooking account registration has been reviewed and approved by our operations administration team.

Account Details:
- Username: {user.username}
- Registered Email: {user.email}
- Activation Date: {timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')}

You can now log in to the AirBooking portal to search flights, reserve seats, and manage your trips in real time.

Login URL: http://localhost:3000/login

Thank you for choosing AirBooking.
YUAI Soft Solutions Pvt. Ltd. / AirBooking Operations Team
"""

    html_message = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="background-color: #0284c7; padding: 16px; border-radius: 6px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">AirBooking</h1>
            <p style="color: #e0f2fe; margin: 4px 0 0 0; font-size: 14px;">Flight Booking & Live Status Management</p>
        </div>
        <div style="padding: 24px 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">Account Activated!</h2>
            <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                Hello <strong>{greeting_name}</strong>,
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">
                Your AirBooking account registration has been reviewed and <strong>approved</strong> by our administrative team.
            </p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 4px 0; color: #475569;"><strong>Username:</strong> {user.username}</p>
                <p style="margin: 4px 0; color: #475569;"><strong>Email:</strong> {user.email}</p>
                <p style="margin: 4px 0; color: #475569;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">APPROVED / ACTIVE</span></p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/login" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Log In to AirBooking
                </a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                If you did not request this account, please contact our support team at <a href="mailto:yuaisoftsolutions@gmail.com">yuaisoftsolutions@gmail.com</a>.
            </p>
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
            &copy; AirBooking Platform &bull; YUAI Soft Solutions Pvt. Ltd.
        </div>
    </div>
    """

    task_id = self.request.id if hasattr(self, 'request') and self.request else ''

    try:
        send_mail(
            subject=subject,
            message=message_body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'notifications@airbooking.com'),
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        email_status = 'SENT'
        logger.info(f"[Celery] Activation email sent successfully to {user.email}")
    except Exception as exc:
        logger.warning(f"[Celery] send_mail encountered error: {exc}. Logging failure.")
        email_status = f'FAILED: {str(exc)[:100]}'

    # Record in activation log for auditability and demo transparency
    try:
        ActivationEmailLog.objects.create(
            user=user,
            recipient_email=user.email,
            subject=subject,
            body=message_body,
            task_id=str(task_id),
            status=email_status,
        )
    except Exception as log_exc:
        logger.warning(f"Failed to record ActivationEmailLog: {log_exc}")

    return True

