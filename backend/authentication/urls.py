from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from authentication.views import (
    RegisterView,
    LoginView,
    CurrentUserProfileView,
    ActivationEmailAuditView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
    path('me/', CurrentUserProfileView.as_view(), name='auth_me'),
    path('activation-emails/', ActivationEmailAuditView.as_view(), name='auth_activation_emails'),
]

