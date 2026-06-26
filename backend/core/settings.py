"""
Django settings for core project.
Optimized for Production & Local Development.
"""
import os
import json
import firebase_admin
from pathlib import Path
from dotenv import load_dotenv
from firebase_admin import credentials
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env
load_dotenv(os.path.join(BASE_DIR, '.env'))

# ==========================================
# CORE SECURITY SETTINGS
# ==========================================

SECRET_KEY = os.environ.get('SECRET_KEY')

# FIX 1: Was `"False".lower() == "False"` which is always False.
# Correct logic: compare lowercased value to the string "true".
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1,127.0.0.2"
).split(",")

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
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Allow React to talk to Django safely during local development
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")

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
# DATABASE SETTINGS
# ==========================================

# Add this at the VERY top of settings.py!

import dj_database_url # Add this at the VERY top of settings.py

# Replace your current DATABASES block with this:
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=True # Neon requires SSL for security
    )
}

# ==========================================
# PASSWORD VALIDATION
# ==========================================

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ==========================================
# INTERNATIONALIZATION & STATIC FILES
# ==========================================

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# FIX 2: Use WhiteNoise compressed manifest storage so admin CSS/JS loads correctly.
# The old config set StaticFilesStorage which bypassed WhiteNoise entirely.
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ==========================================
# FIREBASE ADMIN SDK INITIALIZATION
# ==========================================

firebase_env_creds = os.getenv('FIREBASE_JSON_CREDS')

if firebase_env_creds:
    try:
        cred_dict = json.loads(firebase_env_creds)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized via Environment Variable.")
    except Exception as e:
        print(f"Failed to load Firebase from Environment Variable: {e}")
else:
    FIREBASE_KEY_PATH = os.path.join(BASE_DIR, 'firebase-service-account.json')
    if os.path.exists(FIREBASE_KEY_PATH):
        cred = credentials.Certificate(FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)
        print("Firebase initialized via local JSON file.")
    else:
        print("WARNING: Firebase credentials missing! Auth will fail.")