from rest_framework import serializers
from flights.models import Flight, FlightStatus


class FlightSerializer(serializers.ModelSerializer):
    duration = serializers.CharField(source='duration_formatted', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_available = serializers.BooleanField(read_only=True)

    class Meta:
        model = Flight
        fields = [
            'id',
            'flight_number',
            'airline',
            'airline_code',
            'aircraft_type',
            'origin_city',
            'origin_airport',
            'origin_code',
            'origin_latitude',
            'origin_longitude',
            'destination_city',
            'destination_airport',
            'destination_code',
            'destination_latitude',
            'destination_longitude',
            'departure_time',
            'arrival_time',
            'duration',
            'price',
            'total_seats',
            'available_seats',
            'status',
            'status_display',
            'delay_minutes',
            'gate',
            'terminal',
            'baggage_carousel',
            'is_available',
            'created_at',
            'updated_at',
        ]


class FlightStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = ['status', 'delay_minutes', 'gate', 'terminal']

    def validate_status(self, value):
        if value not in FlightStatus.values:
            raise serializers.ValidationError(f"Invalid status. Must be one of: {list(FlightStatus.values)}")
        return value

