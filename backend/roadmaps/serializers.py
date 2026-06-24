from rest_framework import serializers
# FIX 4: Removed duplicate import line (Roadmap, RoadmapStep were imported twice)
from .models import Roadmap, RoadmapStep, Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['id', 'user_id', 'name', 'rating', 'text', 'date']

class RoadmapStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadmapStep
        fields = ['step_number', 'title', 'timeframe', 'difficulty', 'tools', 'description', 'milestones', 'anti_patterns']

class RoadmapSerializer(serializers.ModelSerializer):
    steps = RoadmapStepSerializer(many=True, read_only=True)

    class Meta:
        model = Roadmap
        fields = [
            'id', 'course_id', 'country_id', 'language', 'title', 'is_premium',
            'overview', 'future_outlook', 'opportunity', 'pro_tip',
            'pros', 'cons', 'how_to', 'links', 'steps'
        ]