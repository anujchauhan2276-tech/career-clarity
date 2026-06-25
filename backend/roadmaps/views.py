import os
import json
import time
import traceback
from django.db import IntegrityError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth as firebase_auth
from groq import Groq

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

# --- ELITE GROQ AI ROADMAP GENERATOR ---
def generate_and_save_roadmap(course_id, country_id, language_mode):
    # Initialize the Groq client
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    target_lang = get_target_language(country_id, language_mode)
    
    system_instruction = """
    You are an elite, world-class career strategist and technical architect. 
    Your job is to provide absolute, highest-tier, industry-accurate career roadmaps.
    Do NOT provide generic, fluffy advice. Use highly specific, advanced industry terminology. 
    Point out brutal realities, exact tools used in the modern enterprise, and rigorous milestones.
    You MUST output your response in valid JSON format.
    """

    prompt = f"""
    Create a definitive, highly detailed career/education roadmap for '{course_id}'.
    Context: Tailor this strictly to the academic system, corporate culture, and job market of '{country_id}'.
    
    CRITICAL INSTRUCTION FOR LANGUAGE:
    You MUST perfectly translate EVERY SINGLE STRING in your JSON response into {target_lang}.
    
    You MUST output exactly and ONLY a JSON object matching this schema:
    {{
      "overview": "A detailed 2-3 sentence overview of this exact path in this country.",
      "future_outlook": "A detailed paragraph on the 10-year future of this career in this specific country.",
      "opportunity": "A specific market gap or arbitrage opportunity.",
      "pro_tip": "One highly actionable, advanced insider tip.",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2", "Con 3"],
      "how_to": ["Step 1 to start", "Step 2", "Step 3"],
      "links": [
        {{"name": "Name of top certification/resource", "url": "https://example.com"}}
      ],
      "steps": [
        {{
          "step_number": 1,
          "title": "Phase 1: Deep Foundations",
          "timeframe": "Month 1-3",
          "difficulty": "Beginner", 
          "description": "Detailed description of this phase.",
          "tools": ["Specific Tool 1", "Specific Tool 2"],
          "milestones": ["Hard Milestone 1", "Hard Milestone 2"],
          "anti_patterns": ["Rookie Mistake 1", "Rookie Mistake 2"]
        }}
      ]
    }}
    
    Generate exactly 10 highly detailed steps in the "steps" array. 
    Make sure the difficulty strictly progresses from Beginner -> Intermediate -> Advanced -> Expert -> Visionary.
    """

    max_retries = 3
    response_content = None
    last_exception = None

    # Call Groq Llama 3.3 70B
    for attempt in range(max_retries):
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile", # The best all-around open-source model currently available
                temperature=0.2, # Keeps the AI factual and structured
                response_format={"type": "json_object"}, # Forces Groq to return perfect JSON
            )
            response_content = chat_completion.choices[0].message.content
            
            # Basic validation
            temp_data = json.loads(response_content)
            if len(temp_data.get("steps", [])) < 5:
                raise ValueError("AI returned a truncated roadmap. Retrying.")
                
            break
        except Exception as e:
            last_exception = e
            print(f"Groq API attempt {attempt + 1} failed: {e}")
            time.sleep(2)

    if not response_content:
        raise last_exception

    ai_data = json.loads(response_content)
    
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
        roadmap = Roadmap.objects.get(course_id__iexact=course_id, country_id__iexact=country_id, language__iexact=language)
        
    except Roadmap.DoesNotExist:
        try:
            roadmap = generate_and_save_roadmap(course_id, country_id, language)
        except Exception as e:
            traceback.print_exc()
            return Response({"error": "AI generation failed or Groq API key is missing. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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