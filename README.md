# AirBooking — Full Stack Flight Reservation & Real-Time Management Platform

**Company:** YUAI Soft Solutions Pvt. Ltd.  
**Position:** Full Stack Engineer (React + Django/DRF) Take-Home Assignment  
**Contact:** [yuaisoftsolutions@gmail.com](mailto:yuaisoftsolutions@gmail.com)  

---

## 1. Project Overview

**AirBooking** is a modern, enterprise-grade flight reservation and live tracking platform engineered to fulfill the requirements of the YUAI Soft Solutions take-home assignment.

### Core Value Proposition
- **User Registration with Admin Approval Flow:** New passenger registrations start in `PENDING` review status. Only approved users can authenticate and obtain JWT tokens.
- **Celery Email Activation Pipeline:** When an administrator approves a registration, a background Celery task (`send_account_approval_email`) is dispatched to notify the passenger with an HTML activation email.
- **Flight Search & Filtering:** Authenticated search with filtering by origin/destination airports, cities, departure dates, seat availability, airlines, operational status, and price thresholds.
- **Seat Allocation & Payment Simulation:** Interactive cabin seat picker, atomic database row locking to prevent race conditions, and simulated payment authorization with booking references.
- **Trip Management ("My Trips"):** Dedicated passenger portal displaying active/past trips, live flight telemetry, reservation cancellation with instant seat inventory restoration, and printable e-tickets / boarding passes.
- **Real-Time Flight Radar Telemetry:** Integration with OpenSky Network / AirLabs APIs plus a geospatial trajectory engine calculating altitude profiles, airspeed, heading, and great-circle coordinates.
- **Administrator Management Portal:** Real-time KPI dashboard, one-click passenger approval/rejection console with audit logging, flight scheduling, and live operational status toggles (`On-time`, `Delayed`, `Boarding`, `Cancelled`).

---

## 2. Tech Stack & Architecture

### Backend
- **Framework:** Python 3.10+ / Django 5.1 / Django REST Framework (DRF)
- **Authentication:** `djangorestframework-simplejwt` (JSON Web Tokens with access & refresh rotation)
- **Background Tasks:** `Celery` + `Redis` (with `CELERY_TASK_ALWAYS_EAGER=True` development fallback for zero-dependency instant testing)
- **Database:** SQLite (default for effortless local evaluation) / PostgreSQL-ready
- **CORS:** `django-cors-headers`
- **External Integrations:** OpenSky Network ADS-B transponder feed & AirLabs flight tracking API

### Frontend
- **Framework:** React 19 / Vite
- **Styling:** Tailwind CSS with custom travel glassmorphism & typography
- **Routing:** `react-router-dom` (with `ProtectedRoute` and `AdminRoute` guards)
- **HTTP Client:** `axios` with automatic JWT Bearer injection and 401 token refresh interceptors
- **Icons:** `lucide-react`

---

## 3. Demo Credentials for Evaluation

The database seeding command creates three pre-configured accounts for instant testing:

| Role | Username | Password | Email | Approval Status | Description |
|---|---|---|---|---|---|
| **Administrator** | `admin` | `AdminPassword123!` | `admin@airbooking.com` | `APPROVED` | Full access to Admin Portal, pending approvals, and flight status controls |
| **Approved Passenger** | `john_doe` | `UserPassword123!` | `john.doe@example.com` | `APPROVED` | Can log in, search flights, book seats, view trips, and download boarding passes |
| **Pending Passenger** | `sarah_connor` | `UserPassword123!` | `sarah.connor@example.com` | `PENDING` | Test login to verify that pending accounts are blocked until admin approval |

> **Evaluation Tip:** On the Login screen, click any of the "Demo Credentials" quick-fill buttons to auto-populate credentials instantly.

---

## 4. Quick-Start Setup Guide

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ and npm installed
- Git installed

---

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd assignment
```

---

### Step 2: Backend Setup (Django & DRF)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Apply database migrations:
   ```bash
   python manage.py migrate
   ```

5. Seed realistic demo data (Users, Flights, Bookings):
   ```bash
   python manage.py seed_db
   ```

6. *(Optional)* Run backend test suite to verify all 7 unit and integration tests:
   ```bash
   python manage.py test
   ```

7. Start the Django development server:
   ```bash
   python manage.py runserver 8000
   ```
   Backend will be running at: `http://127.0.0.1:8000/`

---

### Step 3: Celery Background Worker (Optional)

By default, `CELERY_ALWAYS_EAGER=True` is enabled in `airbooking_core/settings.py`, which executes the email dispatch task immediately and logs it to `ActivationEmailLog` and the terminal console without needing a local Redis server.

To run with live Redis and Celery worker:
1. Start Redis:
   ```bash
   redis-server
   ```
2. Set in `backend/.env`:
   ```env
   CELERY_ALWAYS_EAGER=False
   CELERY_BROKER_URL=redis://127.0.0.1:6379/0
   ```
3. In a separate terminal with venv activated:
   ```bash
   celery -A airbooking_core worker -l info
   ```

---

### Step 4: Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will be running at: `http://localhost:3000/` (or `http://localhost:5173/`)

---

## 5. API Endpoints Specification

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register/` | User registration (creates account with `approval_status=PENDING`) | Public |
| `POST` | `/api/auth/login/` | User login (rejects pending accounts, issues JWT tokens for approved) | Public |
| `POST` | `/api/auth/token/refresh/` | Refresh expired access JWT token | Public |
| `GET` | `/api/auth/me/` | Retrieve current authenticated user profile | Authenticated |
| `PATCH` | `/api/auth/me/` | Update profile information | Authenticated |
| `GET` | `/api/auth/activation-emails/` | Audit dispatched Celery activation emails | Admin |

### Flight Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/flights/search/` | Search flights (filters: `origin`, `destination`, `date`, `airline`, `max_price`, `available_only`, `status`) | Authenticated |
| `GET` | `/api/flights/{id}/` | Flight details, aircraft layout, and live telemetry | Authenticated |
| `GET` | `/api/flights/{id}/live-tracking/` | OpenSky ADS-B live transponder telemetry feed | Authenticated |
| `GET` | `/api/flights/airports/` | List unique origin/destination airports & airlines | Authenticated |

### Booking Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/bookings/` | Create reservation, lock flight row, deduct seats, simulate payment | Authenticated |
| `GET` | `/api/bookings/` | Retrieve user bookings ("My Trips") | Authenticated |
| `GET` | `/api/bookings/{id}/` | Retrieve full booking record with e-ticket details | Authenticated |
| `POST` | `/api/bookings/{id}/cancel/` | Cancel booking, restore seat inventory, mark as `REFUNDED` | Authenticated |

### Admin Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/users/pending/` | List pending registrations awaiting approval | Admin |
| `POST` | `/api/admin/users/{id}/approve/` | Approve user & trigger Celery activation email | Admin |
| `POST` | `/api/admin/users/{id}/reject/` | Decline user registration with optional reason | Admin |
| `GET` | `/api/admin/users/` | List and search all user accounts | Admin |
| `GET` | `/api/admin/flights/` | Flight inventory management roster | Admin |
| `POST` | `/api/admin/flights/` | Schedule new flight with route and seating specs | Admin |
| `PUT` | `/api/admin/flights/{id}/status/` | Update flight status (`ON_TIME`, `DELAYED`, `BOARDING`, `CANCELLED`) | Admin |
| `GET` | `/api/admin/stats/` | Platform KPI statistics (revenue, users, active flights) | Admin |

---

## 6. User Flows & Verification Steps

### Flow 1: User Registration & Approval Workflow
1. Navigate to `/register` and submit the registration form.
2. The user account is saved with status `PENDING`.
3. Attempting to log in immediately with this account at `/login` displays an informative banner:
   *"Your account registration is currently pending administrator approval. An email notification will be sent once approved."*
4. Log in as **Admin** (`admin` / `AdminPassword123!`) and navigate to the **Admin Center**.
5. In the **Pending Approvals** tab, view the newly registered passenger and click **"Approve (Celery Email)"**.
6. The account is instantly activated, and a Celery background task executes to dispatch the notification.
7. Switch to the **"Sent Activation Emails Audit"** tab to view the exact HTML email content, recipient, timestamp, and task ID.
8. The passenger can now sign in successfully at `/login`.

---

### Flow 2: Flight Search & Booking Flow
1. Log in as `john_doe` / `UserPassword123!`.
2. Navigate to **Find Flights** (`/flights`).
3. Search for routes (e.g. `DEL` to `LHR`), apply filters (Price range, Airlines, Status).
4. Click **"Book Flight"** on a desired flight.
5. The **Interactive Cabin Seat Picker** opens:
   - Select your preferred seat (e.g. `12A - Window` or `01A - First Class`).
   - Notice the cabin layout and class pricing tier adjustments.
6. The **Payment Simulation Gateway** opens:
   - Review flight itinerary, passenger details, and total fare.
   - Click **"Authorize & Pay"**.
7. The simulated bank gateway processes the transaction, locks the flight record, deducts seat inventory, and displays the **Electronic Boarding Pass / E-Ticket Modal** with booking reference, barcode, terminal, gate, and printable layout.

---

### Flow 3: Trip Management ("My Trips")
1. Navigate to **My Trips** (`/my-trips`).
2. View all upcoming and past trips with booking references.
3. Click **"View Boarding Pass"** to inspect or print the electronic ticket.
4. Click **"Live Radar Status"** to track the aircraft in real time.
5. Click **"Cancel Reservation"** to cancel the trip: seats are instantly refunded and restored to the flight inventory.

---

### Flow 4: Real-Time Radar & OpenSky Network Telemetry
1. Navigate to **Live Radar** (`/live-radar`).
2. Select any active flight from the airspace roster.
3. View real-time altitude profile (cruising altitude ~36,000 ft), airspeed in knots (~480 kts), compass heading, current coordinates, and flight phase (Climbing, Cruising, Descending).

---

## 7. Creative Enhancements Beyond Base Requirements

While strictly implementing all assignment specifications, the following thoughtful enhancements were introduced:

1. **Interactive Cabin Seat Picker:** Visual airplane fuselage representation allowing passengers to select specific cabin seats across First Class, Business, and Economy with automatic class pricing multipliers.
2. **Electronic Boarding Pass (E-Ticket) Generator:** Realistic airline boarding pass component featuring perforated ticket styling, flight specifications, barcodes, and a native print/save trigger.
3. **OpenSky Network & ADS-B Geospatial Radar:** Real-time telemetry service that computes great-circle route interpolation, altitude profiles, speed, heading, and distance progress.
4. **Celery Activation Email Audit Viewer:** In-app inspection viewer inside the Admin Dashboard allowing evaluators to verify generated HTML emails and Celery task execution without needing external SMTP servers.
5. **Atomic Row-Level Database Locking:** `select_for_update()` inside `transaction.atomic()` during seat reservations to prevent double-booking race conditions during concurrent high load.
6. **Graceful Celery Eager Mode Fallback:** Intelligent auto-fallback (`CELERY_TASK_ALWAYS_EAGER=True`) that ensures Celery tasks execute without throwing connection errors if Redis is not running locally.
7. **One-Click Demo Credentials:** Helpful quick-fill buttons on the login screen enabling evaluators to test Admin, Approved User, and Pending User workflows with zero manual typing.
8. **Automated Seed Script (`seed_db`):** Rich seeding command generating realistic international and domestic routes, airports, demo passengers, and sample bookings out of the box.

---

## 8. Automated Tests

Run backend tests using:
```bash
python manage.py test
```

### Test Coverage Highlights:
- User registration strictly creates accounts with status `PENDING`.
- Unapproved users cannot obtain JWT tokens.
- Admin pending users list, approval workflow, and Celery email log recording.
- Approved user successful JWT token issuance.
- Authenticated flight search by airport and date.
- Booking creation, payment simulation, and seat inventory deduction.
- Admin flight status update (`ON_TIME` -> `DELAYED`).

---

## 9. Submission & Contact

- **Company:** YUAI Soft Solutions Pvt. Ltd.
- **Position:** Full Stack Engineer (React + Django/DRF)
- **Submission Email:** [yuaisoftsolutions@gmail.com](mailto:yuaisoftsolutions@gmail.com)
- **Engineered by:** Antigravity Full Stack AI Engineer
