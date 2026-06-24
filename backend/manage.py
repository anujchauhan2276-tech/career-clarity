#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    
    # Default runserver to 127.0.0.2:8000 to avoid Chrome HSTS on 127.0.0.1
    if len(sys.argv) == 2 and sys.argv[1] == 'runserver':
        sys.argv.append('127.0.0.2:8000')

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you on the right virtualenv?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()