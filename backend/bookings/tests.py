from decimal import Decimal
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import User, ApprovalStatus, UserRole
from flights.models import Flight, FlightStatus
from bookings.models import Booking, BookingStatus, PaymentStatus


class FlightAndBookingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='flyer_john',
            email='flyer@test.com',
            password='Password123!',
            approval_status=ApprovalStatus.APPROVED,
        )
        self.admin = User.objects.create_superuser(
            username='admin_boss',
            email='adminboss@test.com',
            password='Password123!',
            role=UserRole.ADMIN,
            approval_status=ApprovalStatus.APPROVED,
        )
        now = timezone.now()
        self.flight = Flight.objects.create(
            flight_number='AI-999',
            airline='Air India',
            airline_code='AI',
            origin_city='New Delhi',
            origin_airport='Indira Gandhi International',
            origin_code='DEL',
            destination_city='London',
            destination_airport='Heathrow',
            destination_code='LHR',
            departure_time=now + timedelta(days=2),
            arrival_time=now + timedelta(days=2, hours=8),
            price=Decimal('45000.00'),
            total_seats=100,
            available_seats=10,
            status=FlightStatus.ON_TIME,
        )

        # Authenticate user client
        login_res = self.client.post(reverse('auth_login'), {
            "username_or_email": "flyer_john",
            "password": "Password123!"
        })
        self.user_token = login_res.data['access']

    def test_search_flights_authenticated(self):
        """Step 1: Authenticated user searches flights & filters by airport"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')

        # Search by origin
        res = self.client.get(reverse('flight_search') + '?origin=DEL')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 1)
        self.assertEqual(res.data['results'][0]['flight_number'], 'AI-999')

        # Flight details
        detail_res = self.client.get(reverse('flight_detail', kwargs={'pk': self.flight.id}))
        self.assertEqual(detail_res.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_res.data['flight_number'], 'AI-999')
        self.assertIn('live_telemetry', detail_res.data)

    def test_booking_creation_and_seat_deduction(self):
        """Step 3: Booking creation, seat reservation, payment simulation"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')

        payload = {
            "flight_id": self.flight.id,
            "passenger_name": "Flyer John",
            "passenger_email": "flyer@test.com",
            "passenger_phone": "+123456789",
            "seat_number": "12A",
            "seat_class": "ECONOMY",
            "seats_count": 2,
            "payment_method": "CREDIT_CARD",
        }
        res = self.client.post(reverse('booking_list_create'), payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('booking', res.data)
        self.assertEqual(res.data['booking']['payment_status'], 'PAID')

        # Check seats deducted
        self.flight.refresh_from_db()
        self.assertEqual(self.flight.available_seats, 8)

        # Step 4: My Trips
        trips_res = self.client.get(reverse('booking_list_create'))
        self.assertEqual(trips_res.status_code, status.HTTP_200_OK)
        self.assertEqual(trips_res.data['count'], 1)

    def test_admin_flight_status_update(self):
        """Admin updates flight status (On-time -> Delayed)"""
        # Login admin
        admin_login = self.client.post(reverse('auth_login'), {
            "username_or_email": "admin_boss",
            "password": "Password123!"
        })
        admin_token = admin_login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')

        update_res = self.client.put(
            reverse('admin_flight_status_update', kwargs={'pk': self.flight.id}),
            {"status": "DELAYED", "delay_minutes": 30}
        )
        self.assertEqual(update_res.status_code, status.HTTP_200_OK)
        self.flight.refresh_from_db()
        self.assertEqual(self.flight.status, FlightStatus.DELAYED)
        self.assertEqual(self.flight.delay_minutes, 30)
