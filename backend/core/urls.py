from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse # Import this

# Simple function for the health check
def home(request):
    return HttpResponse("Career Clarity API is Live.")

urlpatterns = [
    path('', home), # Add this line for the root URL
    path('admin/', admin.site.urls),
    path('', include('roadmaps.urls')),
]