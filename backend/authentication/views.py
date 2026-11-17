from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from authentication.serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserSerializer,
    ActivationEmailLogSerializer
)
from authentication.models import ActivationEmailLog


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Public endpoint: Registers a new user. The account is set to PENDING approval status.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "Registration successful! Your account is currently pending administrator approval.",
                    "user": UserSerializer(user).data,
                    "status": "PENDING"
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    POST /api/auth/login/
    Public endpoint: Authenticates the user and returns JWT access/refresh tokens.
    Only users with approval_status='APPROVED' are granted tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class CurrentUserProfileView(APIView):
    """
    GET /api/auth/me/
    PATCH /api/auth/me/
    Authenticated endpoint: Returns current user information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ActivationEmailAuditView(APIView):
    """
    GET /api/auth/activation-emails/
    Inspection endpoint: View dispatched activation emails (useful for evaluation/audit).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.role == 'ADMIN'):
            return Response({"detail": "Admin permission required."}, status=status.HTTP_403_FORBIDDEN)
        logs = ActivationEmailLog.objects.all()[:30]
        serializer = ActivationEmailLogSerializer(logs, many=True)
        return Response(serializer.data)
