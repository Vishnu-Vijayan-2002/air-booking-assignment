import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from authentication.models import User, ApprovalStatus, UserRole
from flights.models import Flight, FlightStatus
from bookings.models import Booking, BookingStatus, PaymentStatus, SeatClass


class Command(BaseCommand):
    help = 'Seeds realistic initial data for AirBooking platform (Users, Flights, Bookings)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("==> Seeding AirBooking database..."))

        # 1. Create Administrator
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@airbooking.com',
                'first_name': 'Chief',
                'last_name': 'Administrator',
                'role': UserRole.ADMIN,
                'approval_status': ApprovalStatus.APPROVED,
                'is_staff': True,
                'is_superuser': True,
                'approved_at': timezone.now(),
            }
        )
        if created:
            admin_user.set_password('AdminPassword123!')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("[+] Created Admin: admin / AdminPassword123!"))
        else:
            self.stdout.write(self.style.WARNING("[-] Admin user already exists."))

        # 2. Create Pre-Approved Standard User
        john_user, created = User.objects.get_or_create(
            username='john_doe',
            defaults={
                'email': 'john.doe@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': UserRole.USER,
                'approval_status': ApprovalStatus.APPROVED,
                'phone_number': '+1-555-0199',
                'city': 'San Francisco',
                'country': 'United States',
                'approved_at': timezone.now(),
            }
        )
        if created:
            john_user.set_password('UserPassword123!')
            john_user.save()
            self.stdout.write(self.style.SUCCESS("[+] Created Approved User: john_doe / UserPassword123!"))

        # 3. Create Pending User (to demonstrate admin approval workflow)
        sarah_user, created = User.objects.get_or_create(
            username='sarah_connor',
            defaults={
                'email': 'sarah.connor@example.com',
                'first_name': 'Sarah',
                'last_name': 'Connor',
                'role': UserRole.USER,
                'approval_status': ApprovalStatus.PENDING,
                'phone_number': '+1-555-0144',
                'city': 'Los Angeles',
                'country': 'United States',
            }
        )
        if created:
            sarah_user.set_password('UserPassword123!')
            sarah_user.save()
            self.stdout.write(self.style.SUCCESS("[+] Created Pending User: sarah_connor / UserPassword123!"))

        # 4. Create Another Pending User
        alex_user, created = User.objects.get_or_create(
            username='alex_smith',
            defaults={
                'email': 'alex.smith@example.com',
                'first_name': 'Alex',
                'last_name': 'Smith',
                'role': UserRole.USER,
                'approval_status': ApprovalStatus.PENDING,
                'phone_number': '+44-20-7946-0912',
                'city': 'London',
                'country': 'United Kingdom',
            }
        )
        if created:
            alex_user.set_password('UserPassword123!')
            alex_user.save()
            self.stdout.write(self.style.SUCCESS("[+] Created Pending User: alex_smith / UserPassword123!"))

        # 5. Seed Realistic Flights
        now = timezone.now()

        flight_data = [
            {
                'flight_number': 'AI-101',
                'airline': 'Air India',
                'airline_code': 'AI',
                'aircraft_type': 'Boeing 787-9 Dreamliner',
                'origin_city': 'New Delhi',
                'origin_airport': 'Indira Gandhi International Airport',
                'origin_code': 'DEL',
                'origin_latitude': 28.5562,
                'origin_longitude': 77.1000,
                'destination_city': 'London',
                'destination_airport': 'London Heathrow Airport',
                'destination_code': 'LHR',
                'destination_latitude': 51.4700,
                'destination_longitude': -0.4543,
                'departure_offset_hours': 2,
                'duration_hours': 8.5,
                'price': Decimal('54999.00'),
                'total_seats': 210,
                'available_seats': 42,
                'status': FlightStatus.ON_TIME,
                'gate': 'B14',
                'terminal': 'T3',
                'baggage_carousel': '4',
            },
            {
                'flight_number': 'EK-502',
                'airline': 'Emirates',
                'airline_code': 'EK',
                'aircraft_type': 'Boeing 777-300ER',
                'origin_city': 'Dubai',
                'origin_airport': 'Dubai International Airport',
                'origin_code': 'DXB',
                'origin_latitude': 25.2532,
                'origin_longitude': 55.3657,
                'destination_city': 'New York',
                'destination_airport': 'John F. Kennedy International Airport',
                'destination_code': 'JFK',
                'destination_latitude': 40.6413,
                'destination_longitude': -73.7781,
                'departure_offset_hours': -1.5, # Currently in flight!
                'duration_hours': 14.0,
                'price': Decimal('74500.00'),
                'total_seats': 304,
                'available_seats': 86,
                'status': FlightStatus.ON_TIME,
                'gate': 'A08',
                'terminal': 'T3',
                'baggage_carousel': '8',
            },
            {
                'flight_number': 'BA-178',
                'airline': 'British Airways',
                'airline_code': 'BA',
                'aircraft_type': 'Airbus A350-1000',
                'origin_city': 'London',
                'origin_airport': 'London Heathrow Airport',
                'origin_code': 'LHR',
                'origin_latitude': 51.4700,
                'origin_longitude': -0.4543,
                'destination_city': 'New York',
                'destination_airport': 'John F. Kennedy International Airport',
                'destination_code': 'JFK',
                'destination_latitude': 40.6413,
                'destination_longitude': -73.7781,
                'departure_offset_hours': 5,
                'duration_hours': 7.75,
                'price': Decimal('43200.00'),
                'total_seats': 250,
                'available_seats': 110,
                'status': FlightStatus.DELAYED,
                'delay_minutes': 45,
                'gate': 'C22',
                'terminal': 'T5',
                'baggage_carousel': '3',
            },
            {
                'flight_number': 'SQ-406',
                'airline': 'Singapore Airlines',
                'airline_code': 'SQ',
                'aircraft_type': 'Airbus A350-900',
                'origin_city': 'Singapore',
                'origin_airport': 'Singapore Changi Airport',
                'origin_code': 'SIN',
                'origin_latitude': 1.3644,
                'origin_longitude': 103.9915,
                'destination_city': 'New Delhi',
                'destination_airport': 'Indira Gandhi International Airport',
                'destination_code': 'DEL',
                'destination_latitude': 28.5562,
                'destination_longitude': 77.1000,
                'departure_offset_hours': -3.0, # Currently in flight!
                'duration_hours': 5.5,
                'price': Decimal('35800.00'),
                'total_seats': 253,
                'available_seats': 18,
                'status': FlightStatus.ON_TIME,
                'gate': 'E11',
                'terminal': 'T2',
                'baggage_carousel': '6',
            },
            {
                'flight_number': '6E-205',
                'airline': 'IndiGo',
                'airline_code': '6E',
                'aircraft_type': 'Airbus A321neo',
                'origin_city': 'New Delhi',
                'origin_airport': 'Indira Gandhi International Airport',
                'origin_code': 'DEL',
                'origin_latitude': 28.5562,
                'origin_longitude': 77.1000,
                'destination_city': 'Mumbai',
                'destination_airport': 'Chhatrapati Shivaji Maharaj International Airport',
                'destination_code': 'BOM',
                'destination_latitude': 19.0896,
                'destination_longitude': 72.8656,
                'departure_offset_hours': 1,
                'duration_hours': 2.2,
                'price': Decimal('6499.00'),
                'total_seats': 186,
                'available_seats': 31,
                'status': FlightStatus.BOARDING,
                'gate': 'D04',
                'terminal': 'T1',
                'baggage_carousel': '2',
            },
            {
                'flight_number': 'LH-760',
                'airline': 'Lufthansa',
                'airline_code': 'LH',
                'aircraft_type': 'Boeing 747-8 Intercontinental',
                'origin_city': 'Frankfurt',
                'origin_airport': 'Frankfurt Airport',
                'origin_code': 'FRA',
                'origin_latitude': 50.0379,
                'origin_longitude': 8.5622,
                'destination_city': 'New Delhi',
                'destination_airport': 'Indira Gandhi International Airport',
                'destination_code': 'DEL',
                'destination_latitude': 28.5562,
                'destination_longitude': 77.1000,
                'departure_offset_hours': 12,
                'duration_hours': 7.5,
                'price': Decimal('59200.00'),
                'total_seats': 364,
                'available_seats': 150,
                'status': FlightStatus.SCHEDULED,
                'gate': 'Z15',
                'terminal': 'T1',
                'baggage_carousel': '7',
            },
            {
                'flight_number': 'DL-408',
                'airline': 'Delta Air Lines',
                'airline_code': 'DL',
                'aircraft_type': 'Boeing 767-300',
                'origin_city': 'New York',
                'origin_airport': 'John F. Kennedy International Airport',
                'origin_code': 'JFK',
                'origin_latitude': 40.6413,
                'origin_longitude': -73.7781,
                'destination_city': 'Los Angeles',
                'destination_airport': 'Los Angeles International Airport',
                'destination_code': 'LAX',
                'destination_latitude': 33.9416,
                'destination_longitude': -118.4085,
                'departure_offset_hours': 4,
                'duration_hours': 5.8,
                'price': Decimal('23500.00'),
                'total_seats': 226,
                'available_seats': 62,
                'status': FlightStatus.ON_TIME,
                'gate': 'B28',
                'terminal': 'T4',
                'baggage_carousel': '5',
            },
            {
                'flight_number': 'QR-571',
                'airline': 'Qatar Airways',
                'airline_code': 'QR',
                'aircraft_type': 'Airbus A350-1000',
                'origin_city': 'Doha',
                'origin_airport': 'Hamad International Airport',
                'origin_code': 'DOH',
                'origin_latitude': 25.2731,
                'origin_longitude': 51.6081,
                'destination_city': 'New Delhi',
                'destination_airport': 'Indira Gandhi International Airport',
                'destination_code': 'DEL',
                'destination_latitude': 28.5562,
                'destination_longitude': 77.1000,
                'departure_offset_hours': 8,
                'duration_hours': 4.0,
                'price': Decimal('31800.00'),
                'total_seats': 327,
                'available_seats': 95,
                'status': FlightStatus.ON_TIME,
                'gate': 'C10',
                'terminal': 'Main',
                'baggage_carousel': '1',
            },
        ]

        created_flights = []
        for f in flight_data:
            dep_time = now + timedelta(hours=f['departure_offset_hours'])
            arr_time = dep_time + timedelta(hours=f['duration_hours'])

            flight_obj, created = Flight.objects.update_or_create(
                flight_number=f['flight_number'],
                defaults={
                    'airline': f['airline'],
                    'airline_code': f['airline_code'],
                    'aircraft_type': f['aircraft_type'],
                    'origin_city': f['origin_city'],
                    'origin_airport': f['origin_airport'],
                    'origin_code': f['origin_code'],
                    'origin_latitude': f['origin_latitude'],
                    'origin_longitude': f['origin_longitude'],
                    'destination_city': f['destination_city'],
                    'destination_airport': f['destination_airport'],
                    'destination_code': f['destination_code'],
                    'destination_latitude': f['destination_latitude'],
                    'destination_longitude': f['destination_longitude'],
                    'departure_time': dep_time,
                    'arrival_time': arr_time,
                    'price': f['price'],
                    'total_seats': f['total_seats'],
                    'available_seats': f['available_seats'],
                    'status': f['status'],
                    'delay_minutes': f.get('delay_minutes', 0),
                    'gate': f['gate'],
                    'terminal': f['terminal'],
                    'baggage_carousel': f['baggage_carousel'],
                }
            )
            created_flights.append(flight_obj)
            self.stdout.write(self.style.SUCCESS(f"[+] Synced Flight: {flight_obj.flight_number} ({flight_obj.origin_code} -> {flight_obj.destination_code})"))

        # 6. Seed Sample Bookings for john_doe
        if john_user and created_flights:
            f1 = created_flights[0] # AI-101
            f2 = created_flights[1] # EK-502

            b1, c1 = Booking.objects.get_or_create(
                booking_reference='AB-DEL101',
                defaults={
                    'user': john_user,
                    'flight': f1,
                    'passenger_name': 'John Doe',
                    'passenger_email': john_user.email,
                    'passenger_phone': '+1-555-0199',
                    'seat_number': '14A',
                    'seat_class': SeatClass.ECONOMY,
                    'seats_count': 1,
                    'total_price': f1.price,
                    'payment_status': PaymentStatus.PAID,
                    'payment_method': 'CREDIT_CARD',
                    'transaction_id': 'TXN-AIR-9482710492',
                    'booking_status': BookingStatus.CONFIRMED,
                }
            )
            if c1:
                self.stdout.write(self.style.SUCCESS(f"[+] Created Sample Booking: {b1.booking_reference} for {john_user.username}"))

            b2, c2 = Booking.objects.get_or_create(
                booking_reference='AB-DXB502',
                defaults={
                    'user': john_user,
                    'flight': f2,
                    'passenger_name': 'John Doe',
                    'passenger_email': john_user.email,
                    'passenger_phone': '+1-555-0199',
                    'seat_number': '03K',
                    'seat_class': SeatClass.BUSINESS,
                    'seats_count': 1,
                    'total_price': round(f2.price * Decimal('2.2'), 2),
                    'payment_status': PaymentStatus.PAID,
                    'payment_method': 'CREDIT_CARD',
                    'transaction_id': 'TXN-AIR-8371902847',
                    'booking_status': BookingStatus.CONFIRMED,
                }
            )
            if c2:
                self.stdout.write(self.style.SUCCESS(f"[+] Created Sample Booking: {b2.booking_reference} for {john_user.username}"))

        self.stdout.write(self.style.SUCCESS("\n==> Database seeding completed successfully!"))

