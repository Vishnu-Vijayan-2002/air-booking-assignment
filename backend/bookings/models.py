import uuid
from django.db import models
from django.conf import settings
from flights.models import Flight


class PaymentStatus(models.TextChoices):
    PAID = 'PAID', 'Paid'
    PENDING = 'PENDING', 'Pending'
    FAILED = 'FAILED', 'Failed'
    REFUNDED = 'REFUNDED', 'Refunded'


class BookingStatus(models.TextChoices):
    CONFIRMED = 'CONFIRMED', 'Confirmed'
    CANCELLED = 'CANCELLED', 'Cancelled'


class SeatClass(models.TextChoices):
    ECONOMY = 'ECONOMY', 'Economy'
    PREMIUM_ECONOMY = 'PREMIUM_ECONOMY', 'Premium Economy'
    BUSINESS = 'BUSINESS', 'Business Class'
    FIRST = 'FIRST', 'First Class'


def generate_booking_reference():
    return f"AB-{uuid.uuid4().hex[:6].upper()}"


class Booking(models.Model):
    booking_reference = models.CharField(
        max_length=20,
        unique=True,
        default=generate_booking_reference,
        db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    flight = models.ForeignKey(
        Flight,
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    # Passenger details
    passenger_name = models.CharField(max_length=150)
    passenger_email = models.EmailField()
    passenger_phone = models.CharField(max_length=25, blank=True, default='')

    # Seat details
    seat_number = models.CharField(max_length=10, default='12A')
    seat_class = models.CharField(
        max_length=20,
        choices=SeatClass.choices,
        default=SeatClass.ECONOMY
    )
    seats_count = models.PositiveIntegerField(default=1)

    # Payment simulation details
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PAID
    )
    payment_method = models.CharField(max_length=50, default='CREDIT_CARD')
    transaction_id = models.CharField(max_length=100, blank=True, default='')

    # Booking operational status
    booking_status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.CONFIRMED
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.booking_reference} - {self.passenger_name} ({self.flight.flight_number})"
