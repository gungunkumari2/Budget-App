from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Create a test user for authentication'

    def handle(self, *args, **options):
        # Create test user
        username = 'testuser'
        email = 'test@example.com'
        password = 'testpass123'
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User {username} already exists')
            )
            return
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name='Test',
            last_name='User'
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created user: {username}')
        )
        self.stdout.write(f'Email: {email}')
        self.stdout.write(f'Password: {password}')
        
        # Also create the Bhumi user if it doesn't exist
        bhumi_username = 'bhumi'
        bhumi_email = 'bhumi@example.com'
        bhumi_password = 'testpass123'
        
        if not User.objects.filter(username=bhumi_username).exists():
            bhumi_user = User.objects.create_user(
                username=bhumi_username,
                email=bhumi_email,
                password=bhumi_password,
                first_name='Bhumi',
                last_name='Jaiswal'
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created user: {bhumi_username}')
            )
            self.stdout.write(f'Email: {bhumi_email}')
            self.stdout.write(f'Password: {bhumi_password}')
        
        self.stdout.write(
            self.style.SUCCESS('Test users created successfully!')
        ) 