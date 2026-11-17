from django.urls import path
from flights.views import (
    FlightSearchView,
    FlightDetailView,
    LiveFlightTrackingView,
    AirportListView
)

urlpatterns = [
    path('search/', FlightSearchView.as_view(), name='flight_search'),
    path('airports/', AirportListView.as_view(), name='flight_airports'),
    path('<int:pk>/', FlightDetailView.as_view(), name='flight_detail'),
    path('<int:pk>/live-tracking/', LiveFlightTrackingView.as_view(), name='flight_live_tracking'),
]

