import logging
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from admin_portal.permissions import IsAdminUserOrStaff
from authentication.models import User, ApprovalStatus
from authentication.serializers import UserSerializer
from authentication.tasks import send_account_approval_email
from flights.models import Flight, FlightStatus
from flights.serializers import FlightSerializer, FlightStatusUpdateSerializer
from bookings.models import Booking, BookingStatus

logger = logging.getLogger(__name__)


class PendingUsersListView(APIView):
    """
    GET /api/admin/users/pending/
    Admin endpoint: Returns all user accounts currently awaiting approval.
    """
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        pending_users = User.objects.filter(approval_status=ApprovalStatus.PENDING).order_by('-created_at')
        serializer = UserSerializer(pending_users, many=True)
        return Response({
            "count": pending_users.count(),
            "results": serializer.data
        })


class UserApprovalView(APIView):
    """
    POST /api/admin/users/{id}/approve/
    Admin endpoint: Approves user registration and dispatches Celery email notification.
    """
    permission_classes = [IsAdminUserOrStaff]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user.approval_status = ApprovalStatus.APPROVED
        user.approved_at = timezone.now()
        user.approved_by = request.user
        user.rejection_reason = ''
        user.save(update_fields=['approval_status', 'approved_at', 'approved_by', 'rejection_reason', 'updated_at'])

        # Dispatch Celery background task for email notification
        celery_triggered = False
        try:
            task = send_account_approval_email.delay(user.id)
            celery_triggered = True
            logger.info(f"Dispatched Celery task {task.id} for user {user.id} approval email.")
        except Exception as exc:
            logger.warning(f"Celery broker unavailable ({exc}); executing activation email synchronously.")
            send_account_approval_email(user.id)

        return Response({
            "message": f"User {user.username} has been approved successfully. Activation email dispatched via Celery.",
            "celery_task_dispatched": celery_triggered,
            "user": UserSerializer(user).data
        })


class UserRejectionView(APIView):
    """
    POST /api/admin/users/{id}/reject/
    Admin endpoint: Declines user registration with an optional reason.
    """
    permission_classes = [IsAdminUserOrStaff]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason', 'Application did not meet security requirements.')
        user.approval_status = ApprovalStatus.REJECTED
        user.rejection_reason = reason
        user.save(update_fields=['approval_status', 'rejection_reason', 'updated_at'])

        return Response({
            "message": f"User {user.username} registration was rejected.",
            "user": UserSerializer(user).data
        })


class AllUsersListView(APIView):
    """
    GET /api/admin/users/
    Admin endpoint: Lists and filters all registered users.
    """
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = User.objects.all().order_by('-created_at')

        if status_filter:
            queryset = queryset.filter(approval_status__iexact=status_filter)

        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        serializer = UserSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })


class AdminFlightListCreateView(APIView):
    """
    GET /api/admin/flights/
      Lists all flights for administrative management.
    POST /api/admin/flights/
      Creates a new flight in the system.
    """
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        queryset = Flight.objects.all().order_by('-created_at')
        serializer = FlightSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })

    def post(self, request):
        serializer = FlightSerializer(data=request.data)
        if serializer.is_valid():
            flight = serializer.save()
            return Response(
                {
                    "message": "Flight created successfully.",
                    "flight": FlightSerializer(flight).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminFlightDetailView(APIView):
    """
    GET /api/admin/flights/{id}/
    PUT/PATCH /api/admin/flights/{id}/
    DELETE /api/admin/flights/{id}/
    """
    permission_classes = [IsAdminUserOrStaff]

    def get_object(self, pk):
        try:
            return Flight.objects.get(pk=pk)
        except Flight.DoesNotExist:
            return None

    def get(self, request, pk):
        flight = self.get_object(pk)
        if not flight:
            return Response({"detail": "Flight not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(FlightSerializer(flight).data)

    def put(self, request, pk):
        flight = self.get_object(pk)
        if not flight:
            return Response({"detail": "Flight not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = FlightSerializer(flight, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        flight = self.get_object(pk)
        if not flight:
            return Response({"detail": "Flight not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = FlightSerializer(flight, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        flight = self.get_object(pk)
        if not flight:
            return Response({"detail": "Flight not found."}, status=status.HTTP_404_NOT_FOUND)
        flight.delete()
        return Response({"message": "Flight deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class AdminFlightStatusUpdateView(APIView):
    """
    PUT /api/admin/flights/{id}/status/
    Admin endpoint: Updates flight status (e.g. On-time, Delayed, Cancelled) and gate/delay notes.
    """
    permission_classes = [IsAdminUserOrStaff]

    def put(self, request, pk):
        try:
            flight = Flight.objects.get(pk=pk)
        except Flight.DoesNotExist:
            return Response({"detail": "Flight not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = FlightStatusUpdateSerializer(flight, data=request.data, partial=True)
        if serializer.is_valid():
            flight = serializer.save()
            return Response({
                "message": f"Flight {flight.flight_number} status updated to {flight.get_status_display()}.",
                "flight": FlightSerializer(flight).data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminDashboardStatsView(APIView):
    """
    GET /api/admin/stats/
    Admin endpoint: Returns platform-wide KPI metrics and statistics.
    """
    permission_classes = [IsAdminUserOrStaff]

    def get(self, request):
        total_users = User.objects.count()
        pending_users = User.objects.filter(approval_status=ApprovalStatus.PENDING).count()
        approved_users = User.objects.filter(approval_status=ApprovalStatus.APPROVED).count()
        rejected_users = User.objects.filter(approval_status=ApprovalStatus.REJECTED).count()

        total_flights = Flight.objects.count()
        active_flights = Flight.objects.exclude(status=FlightStatus.CANCELLED).count()
        on_time_flights = Flight.objects.filter(status=FlightStatus.ON_TIME).count()
        delayed_flights = Flight.objects.filter(status=FlightStatus.DELAYED).count()

        total_bookings = Booking.objects.count()
        confirmed_bookings = Booking.objects.filter(booking_status=BookingStatus.CONFIRMED).count()
        total_revenue = Booking.objects.filter(booking_status=BookingStatus.CONFIRMED).aggregate(
            rev=Sum('total_price')
        )['rev'] or 0

        return Response({
            "users": {
                "total": total_users,
                "pending": pending_users,
                "approved": approved_users,
                "rejected": rejected_users,
            },
            "flights": {
                "total": total_flights,
                "active": active_flights,
                "on_time": on_time_flights,
                "delayed": delayed_flights,
            },
            "bookings": {
                "total": total_bookings,
                "confirmed": confirmed_bookings,
                "total_revenue": float(total_revenue),
            }
        })
