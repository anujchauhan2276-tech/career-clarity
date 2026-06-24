from django.urls import path
from . import views

urlpatterns = [
    path('api/roadmap/get/', views.get_roadmap, name='get_roadmap'),
    path('api/feedbacks/', views.feedback_list_create, name='feedback_list'),
    path('api/feedbacks/<int:pk>/', views.feedback_delete, name='feedback_delete'),
]