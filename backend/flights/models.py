from django.db import models
from django.utils import timezone


class FlightStatus(models.TextChoices):
    ON_TIME = 'ON_TIME', 'On-time'
    DELAYED = 'DELAYED', 'Delayed'
    CANCELLED = 'CANCELLED', 'Cancelled'
    BOARDING = 'BOARDING', 'Boarding'
    DEPARTED = 'DEPARTED', 'Departed'
    SCHEDULED = 'SCHEDULED', 'Scheduled'


class Flight(models.Model):
    flight_number = models.CharField(max_length=20, unique=True, db_index=True)
    airline = models.CharField(max_length=100)
    airline_code = models.CharField(max_length=10)
    aircraft_type = models.CharField(max_length=100, default='Boeing 787-9')

    # Origin details
    origin_city = models.CharField(max_length=100, db_index=True)
    origin_airport = models.CharField(max_length=150)
    origin_code = models.CharField(max_length=10, db_index=True)
    origin_latitude = models.FloatField(default=28.5562)   # e.g., DEL
    origin_longitude = models.FloatField(default=77.1000)

    # Destination details
    destination_city = models.CharField(max_length=100, db_index=True)
    destination_airport = models.CharField(max_length=150)
    destination_code = models.CharField(max_length=10, db_index=True)
    destination_latitude = models.FloatField(default=51.4700) # e.g., LHR
    destination_longitude = models.FloatField(default=-0.4543)

    # Schedule & Seat details
    departure_time = models.DateTimeField(db_index=True)
    arrival_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_seats = models.PositiveIntegerField(default=180)
    available_seats = models.PositiveIntegerField(default=180)

    # Operational status
    status = models.CharField(
        max_length=20,
        choices=FlightStatus.choices,
        default=FlightStatus.ON_TIME,
        db_index=True
    )
    delay_minutes = models.PositiveIntegerField(default=0)
    gate = models.CharField(max_length=20, blank=True, default='B12')
    terminal = models.CharField(max_length=20, blank=True, default='T3')
    baggage_carousel = models.CharField(max_length=20, blank=True, default='5')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['departure_time']

    def __str__(self):
        return f"{self.flight_number}: {self.origin_code} -> {self.destination_code} [{self.get_status_display()}]"

    @property
    def duration_formatted(self):
        diff = self.arrival_time - self.departure_time
        total_seconds = int(diff.total_seconds())
        if total_seconds <= 0:
            return "0m"
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        return f"{hours}h {minutes}m"

    @property
    def is_available(self):
        return self.available_seats > 0 and self.status != FlightStatus.CANCELLED
