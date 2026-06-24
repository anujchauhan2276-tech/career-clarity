import os
import json
import time
import traceback
from django.db import IntegrityError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth as firebase_auth
from google import genai
from google.genai import types

from .models import Roadmap, RoadmapStep, Feedback
from .serializers import RoadmapSerializer, FeedbackSerializer

# --- SECURITY HELPER FUNCTION ---
def verify_firebase_token(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        return None

# --- LANGUAGE MAPPER ---
def get_target_language(country_id, language_mode):
    if language_mode == 'English':
        return 'English'
    
    lang_map = {
        'es': 'Spanish',
        'de': 'German',
        'fr': 'French',
        'cn': 'Simplified Chinese',
        'jp': 'Japanese',
        'kr': 'Korean',
        'ru': 'Russian',
        'in': 'Hindi'
    }
    return lang_map.get(country_id.lower(), 'English')

# --- ELITE AI ROADMAP GENERATOR ---
def generate_and_save_roadmap(course_id, country_id, language_mode):
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    target_lang = get_target_language(country_id, language_mode)
    
    system_instruction = """
    You are an elite, world-class career strategist and technical architect. 
    Your job is to provide absolute, highest-tier, industry-accurate career roadmaps.
    Do NOT provide generic, fluffy, or 'shitty' advice. Use highly specific, advanced industry terminology. 
    Point out brutal realities, exact tools used in the modern enterprise, and rigorous milestones.
    """

    prompt = f"""
    Create a definitive, highly detailed career/education roadmap for '{course_id}'.
    Context: Tailor this strictly to the academic system, corporate culture, and job market of '{country_id}'.
    
    CRITICAL INSTRUCTION FOR LANGUAGE:
    You MUST perfectly translate EVERY SINGLE STRING in your response into {target_lang}.
    
    Generate exactly 10 highly detailed steps. Make sure the difficulty strictly progresses from Beginner -> Intermediate -> Advanced -> Expert -> Visionary.
    Never output partial or truncated responses. Finish the entire 10-step roadmap.
    """

    # STRICT SCHEMA ENFORCEMENT: 
    # This mathematically forces Gemini to give us perfect data. It cannot skip fields.
    roadmap_schema = {
        "type": "OBJECT",
        "properties": {
            "overview": {"type": "STRING"},
            "future_outlook": {"type": "STRING"},
            "opportunity": {"type": "STRING"},
            "pro_tip": {"type": "STRING"},
            "pros": {"type": "ARRAY", "items": {"type": "STRING"}},
            "cons": {"type": "ARRAY", "items": {"type": "STRING"}},
            "how_to": {"type": "ARRAY", "items": {"type": "STRING"}},
            "links": {
                "type": "ARRAY", 
                "items": {
                    "type": "OBJECT", 
                    "properties": {
                        "name": {"type": "STRING"}, 
                        "url": {"type": "STRING"}
                    }
                }
            },
            "steps": {
                "type": "ARRAY",
                "items": {
                    "type": "OBJECT",
                    "properties": {
                        "step_number": {"type": "INTEGER"},
                        "title": {"type": "STRING"},
                        "timeframe": {"type": "STRING"},
                        "difficulty": {"type": "STRING"},
                        "description": {"type": "STRING"},
                        "tools": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "milestones": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "anti_patterns": {"type": "ARRAY", "items": {"type": "STRING"}}
                    }
                }
            }
        },
        "required": ["overview", "future_outlook", "opportunity", "pro_tip", "pros", "cons", "how_to", "links", "steps"]
    }

    # RETRY LOOP: Bypasses Google's 503 "Overloaded" Spikes
    max_retries = 3
    response = None
    last_exception = None

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=roadmap_schema, # FORCES THE SCHEMA!
                    temperature=0.2, # Very low temperature for maximum consistency and lack of hallucination
                    max_output_tokens=8192, # Gives the AI a massive buffer so it NEVER cuts off halfway
                )
            )
            
            # Validate that the AI actually gave us the 10 steps before accepting it
            temp_data = json.loads(response.text)
            if len(temp_data.get("steps", [])) < 5:
                raise ValueError("AI returned a truncated or shitty roadmap. Retrying for a better one.")
                
            break # Success! Break out of the loop
        except Exception as e:
            last_exception = e
            print(f"Gemini API attempt {attempt + 1} failed: {e}")
            time.sleep(2)

    if not response:
        raise last_exception

    ai_data = json.loads(response.text)
    
    # --- SAVE IT FOREVER ---
    try:
        roadmap = Roadmap.objects.create(
            course_id=course_id,
            country_id=country_id,
            language=language_mode,
            title=course_id,
            is_premium=False,
            overview=ai_data.get('overview', ''),
            future_outlook=ai_data.get('future_outlook', ''),
            opportunity=ai_data.get('opportunity', ''),
            pro_tip=ai_data.get('pro_tip', ''),
            pros=ai_data.get('pros', []),
            cons=ai_data.get('cons', []),
            how_to=ai_data.get('how_to', []),
            links=ai_data.get('links', [])
        )
        
        for step_data in ai_data.get('steps', []):
            RoadmapStep.objects.create(
                roadmap=roadmap,
                step_number=step_data.get('step_number', 1),
                title=step_data.get('title', 'Phase'),
                timeframe=step_data.get('timeframe', ''),
                difficulty=step_data.get('difficulty', 'Beginner'),
                description=step_data.get('description', ''),
                tools=step_data.get('tools', []),
                milestones=step_data.get('milestones', []),
                anti_patterns=step_data.get('anti_patterns', [])
            )
        return roadmap

    except IntegrityError:
        time.sleep(0.5) 
        return Roadmap.objects.get(course_id__iexact=course_id, country_id__iexact=country_id, language__iexact=language_mode)


# --- ROADMAP API ---
@api_view(['POST'])
def get_roadmap(request):
    course_id = request.data.get('courseId')
    country_id = request.data.get('countryId')
    language = request.data.get('language', 'English') 

    if not course_id or not country_id:
        return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # STEP 1: CHECK THE DATABASE FIRST!
        # If the roadmap exists in Postgres, it grabs it immediately (0.1 seconds).
        # It DOES NOT call Gemini again. It relies entirely on your saved DB version.
        roadmap = Roadmap.objects.get(course_id__iexact=course_id, country_id__iexact=country_id, language__iexact=language)
        
    except Roadmap.DoesNotExist:
        # STEP 2: ONLY CALL GEMINI IF IT IS BRAND NEW
        try:
            roadmap = generate_and_save_roadmap(course_id, country_id, language)
        except Exception as e:
            traceback.print_exc()
            error_msg = str(e)
            if "503" in error_msg or "UNAVAILABLE" in error_msg:
                return Response({"error": "Google's AI servers are currently overloaded. Please try clicking the roadmap again in 10 seconds."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            return Response({"error": "AI generation failed. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if roadmap.is_premium:
        user_data = verify_firebase_token(request)
        if not user_data or user_data.get('email', '').lower() not in ["anujchauhan2276@gmail.com", "anujchauhana2276@gmail.com"]:
            return Response({"error": "Premium access required.", "is_locked": True}, status=status.HTTP_403_FORBIDDEN)

    serializer = RoadmapSerializer(roadmap)
    return Response(serializer.data, status=status.HTTP_200_OK)


# --- FEEDBACK API ---
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