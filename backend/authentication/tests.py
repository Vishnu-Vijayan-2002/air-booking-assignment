from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from authentication.models import User, ApprovalStatus, UserRole, ActivationEmailLog


class AuthenticationAndApprovalTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='Password123!',
            role=UserRole.ADMIN,
            approval_status=ApprovalStatus.APPROVED,
        )
        self.approved_user = User.objects.create_user(
            username='user_approved',
            email='approved@test.com',
            password='Password123!',
            role=UserRole.USER,
            approval_status=ApprovalStatus.APPROVED,
        )

    def test_user_registration_creates_pending_account(self):
        """Step 1: User fills registration form -> Account created with status=PENDING"""
        payload = {
            "username": "new_traveler",
            "email": "traveler@example.com",
            "password": "SecretPassword123!",
            "password_confirm": "SecretPassword123!",
            "first_name": "Traveler",
            "last_name": "One",
            "phone_number": "+1234567890",
        }
        response = self.client.post(reverse('auth_register'), payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'PENDING')

        user = User.objects.get(username="new_traveler")
        self.assertEqual(user.approval_status, ApprovalStatus.PENDING)

    def test_pending_user_cannot_login(self):
        """Step 3: Only approved users can log in"""
        User.objects.create_user(
            username='pending_guy',
            email='pending@test.com',
            password='Password123!',
            approval_status=ApprovalStatus.PENDING,
        )
        response = self.client.post(reverse('auth_login'), {
            "username_or_email": "pending_guy",
            "password": "Password123!"
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertTrue(response.data.get('approval_pending', False))

    def test_approved_user_can_login(self):
        """Approved user gets JWT tokens"""
        response = self.client.post(reverse('auth_login'), {
            "username_or_email": "user_approved",
            "password": "Password123!"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_with_username_containing_at_symbol(self):
        """Login works when username itself contains an '@' character (e.g. demo@12122)"""
        User.objects.create_user(
            username='demo@12122',
            email='demo1@gmail.com',
            password='UserPassword123!',
            approval_status=ApprovalStatus.APPROVED,
        )
        # Login using the username with '@'
        res_username = self.client.post(reverse('auth_login'), {
            "username_or_email": "demo@12122",
            "password": "UserPassword123!"
        })
        self.assertEqual(res_username.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_username.data)

        # Login using the email
        res_email = self.client.post(reverse('auth_login'), {
            "username_or_email": "demo1@gmail.com",
            "password": "UserPassword123!"
        })
        self.assertEqual(res_email.status_code, status.HTTP_200_OK)
        self.assertIn('access', res_email.data)

    def test_admin_pending_users_and_approval_flow(self):
        """Step 2: Admin reviews pending users & approves with email notification"""
        pending_user = User.objects.create_user(
            username='awaiting_approval',
            email='awaiting@test.com',
            password='Password123!',
            approval_status=ApprovalStatus.PENDING,
        )

        # Login as admin
        admin_login = self.client.post(reverse('auth_login'), {
            "username_or_email": "admin_test",
            "password": "Password123!"
        })
        token = admin_login.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

        # View pending users
        pending_resp = self.client.get(reverse('admin_pending_users'))
        self.assertEqual(pending_resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(pending_resp.data['count'], 1)

        # Approve user
        approve_resp = self.client.post(reverse('admin_approve_user', kwargs={'pk': pending_user.id}))
        self.assertEqual(approve_resp.status_code, status.HTTP_200_OK)

        pending_user.refresh_from_db()
        self.assertEqual(pending_user.approval_status, ApprovalStatus.APPROVED)

        # Verify email was logged
        email_log = ActivationEmailLog.objects.filter(user=pending_user).first()
        self.assertIsNotNone(email_log)
        self.assertEqual(email_log.recipient_email, pending_user.email)

        # Now previously pending user can log in
        self.client.credentials() # clear admin token
        user_login = self.client.post(reverse('auth_login'), {
            "username_or_email": "awaiting_approval",
            "password": "Password123!"
        })
        self.assertEqual(user_login.status_code, status.HTTP_200_OK)
        self.assertIn('access', user_login.data)
