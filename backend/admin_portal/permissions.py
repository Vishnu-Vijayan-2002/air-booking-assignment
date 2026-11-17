from rest_framework.permissions import BasePermission
from authentication.models import UserRole


class IsAdminUserOrStaff(BasePermission):
    """
    Custom permission allowing access only to users who have role='ADMIN',
    or is_staff=True, or is_superuser=True.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == UserRole.ADMIN or request.user.is_staff or request.user.is_superuser)
        )

