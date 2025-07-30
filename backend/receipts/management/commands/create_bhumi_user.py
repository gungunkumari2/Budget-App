from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create Bhumi user with correct email'

    def handle(self, *args, **options):
        # Bhumi's actual email
        username = 'bhumi'
        email = 'jaiswalbhumi89@gmail.com'
        password = 'testpass123'
        first_name = 'Bhumi'
        last_name = 'Jaiswal'
        
        # Check if user already exists by username
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            # Update email if different
            if user.email != email:
                user.email = email
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated existing user {username} with email: {email}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User {username} already exists with email: {email}')
                )
            return user
        
        # Check if email already exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            self.stdout.write(
                self.style.WARNING(f'Email {email} already exists for user: {user.username}')
            )
            return user
        
        # Create new user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created Bhumi user!')
            )
            self.stdout.write(f'Username: {username}')
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: {password}')
            
            return user
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Failed to create Bhumi user: {e}')
            )
            return None 