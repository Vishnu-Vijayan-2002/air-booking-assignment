from datetime import datetime
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from flights.models import Flight, FlightStatus
from flights.serializers import FlightSerializer
from flights.services import FlightTrackingService


class FlightSearchView(APIView):
    """
    GET /api/flights/search/
    Authenticated endpoint: Searches flights with filtering options.
    Filters supported:
      - origin: airport code, airport name, or city
      - destination: airport code, airport name, or city
      - date: departure date in YYYY-MM-DD
      - min_price, max_price: price range
      - airline: airline name or code
      - available_only: bool (default True)
      - status: ON_TIME, DELAYED, etc.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Flight.objects.all()

        # Origin filter (code, city, or airport)
        origin = request.query_params.get('origin', '').strip()
        if origin:
            queryset = queryset.filter(
                Q(origin_code__iexact=origin) |
                Q(origin_city__icontains=origin) |
                Q(origin_airport__icontains=origin)
            )

        # Destination filter
        destination = request.query_params.get('destination', '').strip()
        if destination:
            queryset = queryset.filter(
                Q(destination_code__iexact=destination) |
                Q(destination_city__icontains=destination) |
                Q(destination_airport__icontains=destination)
            )

        # Date filter (YYYY-MM-DD)
        departure_date = request.query_params.get('date', '').strip()
        if departure_date:
            try:
                parsed_date = datetime.strptime(departure_date, '%Y-%m-%d').date()
                queryset = queryset.filter(departure_time__date=parsed_date)
            except ValueError:
                pass

        # Availability filter
        available_only = request.query_params.get('available_only', 'true').lower() in ('true', '1')
        if available_only:
            queryset = queryset.filter(available_seats__gt=0).exclude(status=FlightStatus.CANCELLED)

        # Price range filter
        min_price = request.query_params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # Airline filter
        airline = request.query_params.get('airline', '').strip()
        if airline:
            queryset = queryset.filter(
                Q(airline__icontains=airline) |
                Q(airline_code__iexact=airline)
            )

        # Status filter
        flight_status = request.query_params.get('status', '').strip()
        if flight_status:
            queryset = queryset.filter(status__iexact=flight_status)

        serializer = FlightSerializer(queryset, many=True)
        return Response({
            "count": queryset.count(),
            "results": serializer.data
        })


class FlightDetailView(APIView):
    """
    GET /api/flights/{id}/
    Authenticated endpoint: Returns complete flight details and seat layout.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            flight = Flight.objects.get(pk=pk)
        except Flight.DoesNotExist:
            return Response({"detail": "Flight not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = FlightSerializer(flight)
        telemetry = FlightTrackingService.get_live_flight_status(flight)

        return Response({
            **serializer.data,
            'live_telemetry': telemetry,
        })


class LiveFlightTrackingView(APIView):
    """
    GET /api/flights/{id}/live-tracking/
    Real-time flight status display with AirLabs / OpenSky Network live telemetry.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            flight = Flight.objects.get(pk=pk)
        except Flight.DoesNotExist:
            return Response({"detail": "Flight not found."}, status=status.HTTP_404_NOT_FOUND)

        telemetry = FlightTrackingService.get_live_flight_status(flight)
        return Response(telemetry)


class AirportListView(APIView):
    """
    GET /api/flights/airports/
    Helper endpoint returning available origin & destination airport lists.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        origins = Flight.objects.values('origin_city', 'origin_code', 'origin_airport').distinct()
        destinations = Flight.objects.values('destination_city', 'destination_code', 'destination_airport').distinct()
        airlines = Flight.objects.values('airline', 'airline_code').distinct()

        return Response({
            "origins": list(origins),
            "destinations": list(destinations),
            "airlines": list(airlines),
        })
