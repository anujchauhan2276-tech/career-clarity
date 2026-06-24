from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('roadmaps.urls')), # Connects our roadmap APIs
]