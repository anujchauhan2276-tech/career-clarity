import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth as firebase_auth
from django.views.decorators.csrf import csrf_exempt
from .models import Roadmap, Feedback
from .serializers import RoadmapSerializer, FeedbackSerializer

# --- SECURITY HELPER FUNCTION ---
@csrf_exempt
def verify_firebase_token(request):
    """Extracts and verifies the token from the Authorization header."""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None

# --- ROADMAP API (MANUAL ONLY) ---
@csrf_exempt
@api_view(['POST'])
def get_roadmap(request):
    course_id = request.data.get('courseId')
    country_id = request.data.get('countryId')
    language = request.data.get('language', 'English') 

    if not course_id or not country_id:
        return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # STRICTLY checks the PostgreSQL database. No AI generation.
        roadmap = Roadmap.objects.get(course_id__iexact=course_id, country_id__iexact=country_id, language__iexact=language)
        
    except Roadmap.DoesNotExist:
        # If you haven't manually added it yet, return a 404 Not Found immediately.
        return Response({"error": f"The roadmap for '{course_id}' has not been added yet."}, status=status.HTTP_404_NOT_FOUND)

    # --- SECURE PREMIUM CHECK ---
    if roadmap.is_premium:
        user_data = verify_firebase_token(request)
        if not user_data or user_data.get('email', '').lower() not in ["anujchauhan2276@gmail.com", "anujchauhana2276@gmail.com"]:
            return Response({"error": "Premium access required.", "is_locked": True}, status=status.HTTP_403_FORBIDDEN)

    serializer = RoadmapSerializer(roadmap)
    return Response(serializer.data, status=status.HTTP_200_OK)


# --- FEEDBACK API ---
@csrf_exempt
@api_view(['GET', 'POST'])
def feedback_list_create(request):
    if request.method == 'GET':
        feedbacks = Feedback.objects.all()
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response({"feedbacks": serializer.data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        user_data = verify_firebase_token(request)
        if not user_data:
            return Response({"error": "Unauthorized. Please log in."}, status=status.HTTP_401_UNAUTHORIZED)

        data = request.data.copy()
        data['user_id'] = user_data.get('uid')

        serializer = FeedbackSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
@api_view(['DELETE'])
def feedback_delete(request, pk):
    user_data = verify_firebase_token(request)
    if not user_data:
        return Response({"error": "Unauthorized."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        feedback = Feedback.objects.get(pk=pk)
        is_admin = user_data.get('email', '').lower() in ["anujchauhan2276@gmail.com", "anujchauhana2276@gmail.com"]
        is_owner = feedback.user_id == user_data.get('uid')

        if not (is_admin or is_owner):
            return Response({"error": "You do not have permission to delete this."}, status=status.HTTP_403_FORBIDDEN)

        feedback.delete()
        return Response({"success": True}, status=status.HTTP_200_OK)
    except Feedback.DoesNotExist:
        return Response({"error": "Feedback not found"}, status=status.HTTP_404_NOT_FOUND)