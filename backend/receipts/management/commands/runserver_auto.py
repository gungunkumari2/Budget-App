import socket
import subprocess
import sys
from django.core.management.base import BaseCommand
from django.core.management import execute_from_command_line


class Command(BaseCommand):
    help = 'Run the development server on the first available port starting from 8000'

    def add_arguments(self, parser):
        parser.add_argument(
            '--port',
            type=int,
            default=8000,
            help='Starting port number (default: 8000)'
        )
        parser.add_argument(
            '--max-attempts',
            type=int,
            default=10,
            help='Maximum number of ports to try (default: 10)'
        )

    def is_port_in_use(self, port):
        """Check if a port is in use"""
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('localhost', port))
                return False
            except OSError:
                return True

    def find_available_port(self, start_port, max_attempts):
        """Find the first available port starting from start_port"""
        for port in range(start_port, start_port + max_attempts):
            if not self.is_port_in_use(port):
                return port
        return None

    def handle(self, *args, **options):
        start_port = options['port']
        max_attempts = options['max_attempts']
        
        # Find available port
        available_port = self.find_available_port(start_port, max_attempts)
        
        if available_port is None:
            self.stdout.write(
                self.style.ERROR(
                    f'No available ports found in range {start_port}-{start_port + max_attempts - 1}'
                )
            )
            sys.exit(1)
        
        if available_port != start_port:
            self.stdout.write(
                self.style.WARNING(
                    f'Port {start_port} is in use. Using port {available_port} instead.'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Starting server on port {available_port}')
            )
        
        # Run the standard runserver command with the available port
        sys.argv = [sys.argv[0], 'runserver', f'127.0.0.1:{available_port}']
        execute_from_command_line(sys.argv) 