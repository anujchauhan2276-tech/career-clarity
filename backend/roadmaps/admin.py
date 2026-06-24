from django.contrib import admin
# FIX 3: Removed duplicate import line (Roadmap, RoadmapStep were imported twice)
from .models import Roadmap, RoadmapStep, Feedback

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'rating', 'date', 'text')
    search_fields = ('name', 'text')

# This makes steps editable on the same page as the main Roadmap!
class RoadmapStepInline(admin.StackedInline):
    model = RoadmapStep
    extra = 1

@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ('title', 'course_id', 'country_id', 'language')
    list_filter = ('country_id', 'language')
    search_fields = ('title', 'course_id')
    inlines = [RoadmapStepInline]