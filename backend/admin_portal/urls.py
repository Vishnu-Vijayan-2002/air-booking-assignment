from django.urls import path
from admin_portal.views import (
    PendingUsersListView,
    UserApprovalView,
    UserRejectionView,
    AllUsersListView,
    AdminFlightListCreateView,
    AdminFlightDetailView,
    AdminFlightStatusUpdateView,
    AdminDashboardStatsView,
)

urlpatterns = [
    # User management
    path('users/pending/', PendingUsersListView.as_view(), name='admin_pending_users'),
    path('users/<int:pk>/approve/', UserApprovalView.as_view(), name='admin_approve_user'),
    path('users/<int:pk>/reject/', UserRejectionView.as_view(), name='admin_reject_user'),
    path('users/', AllUsersListView.as_view(), name='admin_all_users'),

    # Flight management
    path('flights/', AdminFlightListCreateView.as_view(), name='admin_flights_list_create'),
    path('flights/<int:pk>/', AdminFlightDetailView.as_view(), name='admin_flight_detail'),
    path('flights/<int:pk>/status/', AdminFlightStatusUpdateView.as_view(), name='admin_flight_status_update'),

    # Platform statistics
    path('stats/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
]

