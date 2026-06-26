"""
Django settings for core project.
Optimized for Production & Local Development.
"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env
load_dotenv(os.path.join(BASE_DIR, '.env'))

# ==========================================
# CORE SECURITY SETTINGS
# ==========================================

SECRET_KEY = os.getenv('SECRET_KEY')

# Safely parses "true" or "false" from env
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# Allows all hosts in production for maximum connectivity
ALLOWED_HOSTS = ['*']

# ==========================================
# APPLICATION DEFINITION
# ==========================================

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'roadmaps',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # MUST BE FIRST
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ==========================================
# CORS & CSRF SETTINGS
# ==========================================

# Use the nuclear option for CORS during deployment to ensure it works
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Add your Vercel URL here for CSRF protection
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://getcareerclarity.vercel.app")
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "https://getcareerclarity.vercel.app"
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ==========================================
# DATABASE SETTINGS (Postgres / Neon)
# ==========================================

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        # Neon requires SSL in production. Locally we disable it if DEBUG is True.
        ssl_require=True if not DEBUG else False
    )
}

# ==========================================
# STATIC FILES (WhiteNoise)
# ==========================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==========================================
# FIREBASE ADMIN SDK
# ==========================================

firebase_env_creds = os.getenv('FIREBASE_JSON_CREDS')

if firebase_env_creds:
    try:
        cred_dict = json.loads(firebase_env_creds)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized via Environment Variable.")
    except Exception as e:
        print(f"Failed to load Firebase: {e}")
else:
    FIREBASE_KEY_PATH = os.path.join(BASE_DIR, 'firebase-service-account.json')
    if os.path.exists(FIREBASE_KEY_PATH):
        cred = credentials.Certificate(FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized via local JSON file.")
    else:
        print("WARNING: Firebase credentials missing!")

# ==========================================
# PRODUCTION SECURITY
# ==========================================
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    # CRITICAL: Keep this False on Render!
    SECURE_SSL_REDIRECT = False 
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True