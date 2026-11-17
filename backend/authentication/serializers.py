from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from authentication.models import User, ApprovalStatus, UserRole, ActivationEmailLog


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'approval_status',
            'phone_number',
            'city',
            'country',
            'created_at',
            'approved_at',
            'rejection_reason',
        ]
        read_only_fields = ['id', 'role', 'approval_status', 'created_at', 'approved_at']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'city',
            'country',
            'password',
            'password_confirm',
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        # All newly registered users strictly start with PENDING approval status
        user = User.objects.create_user(
            password=password,
            approval_status=ApprovalStatus.PENDING,
            role=UserRole.USER,
            **validated_data
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        login_input = attrs.get('username_or_email')
        password = attrs.get('password')

        # Check if login_input is email or username
        user = None
        if '@' in login_input:
            try:
                user_obj = User.objects.get(email__iexact=login_input)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=login_input, password=password)

        if not user:
            raise serializers.ValidationError({
                "detail": "Invalid credentials. Please verify your username/email and password."
            })

        # Crucial check: User registration approval status workflow
        if user.approval_status == ApprovalStatus.PENDING:
            raise serializers.ValidationError({
                "approval_pending": True,
                "detail": "Your account registration is currently pending administrator approval. "
                          "You will receive an activation email once an admin approves your request."
            })

        if user.approval_status == ApprovalStatus.REJECTED:
            reason = user.rejection_reason or "Account application did not meet eligibility criteria."
            raise serializers.ValidationError({
                "account_rejected": True,
                "detail": f"Your account request was declined by an administrator. Reason: {reason}"
            })

        # User is APPROVED
        refresh = RefreshToken.for_user(user)
        # Custom claims embedded into token
        refresh['username'] = user.username
        refresh['email'] = user.email
        refresh['role'] = user.role
        refresh['approval_status'] = user.approval_status

        return {
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class ActivationEmailLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ActivationEmailLog
        fields = ['id', 'user', 'username', 'recipient_email', 'subject', 'body', 'sent_at', 'task_id', 'status']

