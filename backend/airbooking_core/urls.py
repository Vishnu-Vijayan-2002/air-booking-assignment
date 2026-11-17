from django.contrib import admin
from django.urls import path, include
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "project": "AirBooking Flight Reservation & Real-Time Management API",
        "company": "YUAI Soft Solutions Pvt. Ltd.",
        "version": "1.0.0",
        "documentation": {
            "auth": {
                "register": "POST /api/auth/register/",
                "login": "POST /api/auth/login/",
                "refresh": "POST /api/auth/token/refresh/",
                "me": "GET/PATCH /api/auth/me/",
            },
            "flights": {
                "search": "GET /api/flights/search/",
                "detail": "GET /api/flights/{id}/",
                "live_tracking": "GET /api/flights/{id}/live-tracking/",
                "airports": "GET /api/flights/airports/",
            },
            "bookings": {
                "create": "POST /api/bookings/",
                "list": "GET /api/bookings/",
                "detail": "GET /api/bookings/{id}/",
                "cancel": "POST /api/bookings/{id}/cancel/",
            },
            "admin": {
                "pending_users": "GET /api/admin/users/pending/",
                "approve_user": "POST /api/admin/users/{id}/approve/",
                "reject_user": "POST /api/admin/users/{id}/reject/",
                "all_users": "GET /api/admin/users/",
                "flights": "GET/POST /api/admin/flights/",
                "flight_detail": "GET/PUT/PATCH/DELETE /api/admin/flights/{id}/",
                "update_status": "PUT /api/admin/flights/{id}/status/",
                "stats": "GET /api/admin/stats/",
            }
        }
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api_root'),
    path('api/auth/', include('authentication.urls')),
    path('api/flights/', include('flights.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/admin/', include('admin_portal.urls')),
]
