import uuid
from decimal import Decimal
from django.db import transaction
from rest_framework import serializers
from bookings.models import Booking, PaymentStatus, BookingStatus, SeatClass
from flights.models import Flight, FlightStatus
from flights.serializers import FlightSerializer


class BookingDetailSerializer(serializers.ModelSerializer):
    flight = FlightSerializer(read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    payment_status_display = serializers.CharField(source='get_payment_status_display', read_only=True)
    booking_status_display = serializers.CharField(source='get_booking_status_display', read_only=True)
    seat_class_display = serializers.CharField(source='get_seat_class_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'booking_reference',
            'username',
            'flight',
            'passenger_name',
            'passenger_email',
            'passenger_phone',
            'seat_number',
            'seat_class',
            'seat_class_display',
            'seats_count',
            'total_price',
            'payment_status',
            'payment_status_display',
            'payment_method',
            'transaction_id',
            'booking_status',
            'booking_status_display',
            'created_at',
            'updated_at',
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    flight_id = serializers.IntegerField(write_only=True)
    seats_count = serializers.IntegerField(default=1, min_value=1, max_value=9)

    class Meta:
        model = Booking
        fields = [
            'flight_id',
            'passenger_name',
            'passenger_email',
            'passenger_phone',
            'seat_number',
            'seat_class',
            'seats_count',
            'payment_method',
        ]

    def validate_flight_id(self, value):
        try:
            flight = Flight.objects.get(id=value)
        except Flight.DoesNotExist:
            raise serializers.ValidationError("Selected flight does not exist.")

        if flight.status == FlightStatus.CANCELLED:
            raise serializers.ValidationError("Cannot book seats on a cancelled flight.")

        if flight.available_seats <= 0:
            raise serializers.ValidationError("No seats available on this flight.")

        return value

    def validate(self, attrs):
        flight = Flight.objects.get(id=attrs['flight_id'])
        seats_count = attrs.get('seats_count', 1)

        if flight.available_seats < seats_count:
            raise serializers.ValidationError({
                "seats_count": f"Only {flight.available_seats} seat(s) remaining on this flight."
            })

        return attrs

    def create(self, validated_data):
        flight_id = validated_data.pop('flight_id')
        seats_count = validated_data.get('seats_count', 1)
        seat_class = validated_data.get('seat_class', SeatClass.ECONOMY)
        user = self.context['request'].user

        # Atomic transaction with row-level lock on Flight to prevent race conditions
        with transaction.atomic():
            flight = Flight.objects.select_for_update().get(id=flight_id)

            if flight.available_seats < seats_count:
                raise serializers.ValidationError("Selected seats are no longer available. Please try another flight.")

            # Calculate price with class multiplier
            multiplier = Decimal('1.0')
            if seat_class == SeatClass.PREMIUM_ECONOMY:
                multiplier = Decimal('1.35')
            elif seat_class == SeatClass.BUSINESS:
                multiplier = Decimal('2.20')
            elif seat_class == SeatClass.FIRST:
                multiplier = Decimal('3.50')

            base_price = flight.price * Decimal(str(seats_count))
            total_price = round(base_price * multiplier, 2)

            # Deduct seats
            flight.available_seats -= seats_count
            flight.save(update_fields=['available_seats', 'updated_at'])

            # Simulate payment confirmation
            txn_id = f"TXN-AIR-{uuid.uuid4().hex[:10].upper()}"

            booking = Booking.objects.create(
                user=user,
                flight=flight,
                total_price=total_price,
                payment_status=PaymentStatus.PAID,
                booking_status=BookingStatus.CONFIRMED,
                transaction_id=txn_id,
                **validated_data
            )

        return booking
