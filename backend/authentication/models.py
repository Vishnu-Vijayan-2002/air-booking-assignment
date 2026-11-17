from django.contrib.auth.models import AbstractUser
from django.db import models


class ApprovalStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'


class UserRole(models.TextChoices):
    USER = 'USER', 'Standard User'
    ADMIN = 'ADMIN', 'Administrator'


class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name='Email Address')
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        help_text='Account approval status managed by system administrators.'
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.USER,
        help_text='System authorization level.'
    )
    phone_number = models.CharField(max_length=20, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    country = models.CharField(max_length=100, blank=True, default='')
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_users'
    )
    rejection_reason = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.email}) - [{self.approval_status}]"

    @property
    def is_approved(self):
        return self.approval_status == ApprovalStatus.APPROVED

    @property
    def is_admin_user(self):
        return self.role == UserRole.ADMIN or self.is_staff or self.is_superuser


class ActivationEmailLog(models.Model):
    """
    Tracks all activation/welcome emails dispatched (via Celery/SMTP/Console)
    Allows admins to audit outgoing notification deliveries.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_logs')
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    body = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    task_id = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=50, default='SENT')

    class Meta:
        ordering = ['-sent_at']

    def __str__(self):
        return f"Email to {self.recipient_email} at {self.sent_at} [{self.status}]"
