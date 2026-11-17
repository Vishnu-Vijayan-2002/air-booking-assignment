from django.db import transaction
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from bookings.models import Booking, BookingStatus, PaymentStatus
from bookings.serializers import BookingCreateSerializer, BookingDetailSerializer
from flights.services import FlightTrackingService


class BookingListCreateView(APIView):
    """
    POST /api/bookings/
      Creates a new booking with seat allocation and payment simulation.
    GET /api/bookings/
      Returns bookings belonging to the authenticated user ("My Trips").
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = Booking.objects.filter(user=request.user).select_related('flight')

        if status_filter:
            queryset = queryset.filter(booking_status__iexact=status_filter)

        serializer = BookingDetailSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })

    def post(self, request):
        serializer = BookingCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            booking = serializer.save()
            return Response(
                {
                    "message": "Flight booked successfully! Payment simulated and seats reserved.",
                    "booking": BookingDetailSerializer(booking).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingDetailView(APIView):
    """
    GET /api/bookings/{id}/
      Authenticated endpoint: Retrieves detailed booking information including
      e-ticket details and live flight tracking telemetry.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            # Users can view their own bookings; admins can view any booking
            if request.user.is_staff or request.user.role == 'ADMIN':
                booking = Booking.objects.select_related('flight', 'user').get(pk=pk)
            else:
                booking = Booking.objects.select_related('flight', 'user').get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking record not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = BookingDetailSerializer(booking)
        live_telemetry = FlightTrackingService.get_live_flight_status(booking.flight)

        return Response({
            **serializer.data,
            'live_telemetry': live_telemetry,
        })


class BookingCancelView(APIView):
    """
    POST /api/bookings/{id}/cancel/
      Cancels a booking, releases seats back to the flight, and updates payment to REFUNDED.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            if request.user.is_staff or request.user.role == 'ADMIN':
                booking = Booking.objects.select_related('flight').get(pk=pk)
            else:
                booking = Booking.objects.select_related('flight').get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.booking_status == BookingStatus.CANCELLED:
            return Response({"detail": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            flight = booking.flight
            flight.available_seats += booking.seats_count
            flight.save(update_fields=['available_seats', 'updated_at'])

            booking.booking_status = BookingStatus.CANCELLED
            booking.payment_status = PaymentStatus.REFUNDED
            booking.save(update_fields=['booking_status', 'payment_status', 'updated_at'])

        return Response({
            "message": "Booking has been cancelled and seats have been restored. Simulated refund processed.",
            "booking": BookingDetailSerializer(booking).data
        })
