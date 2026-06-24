from django.db import models

class Roadmap(models.Model):
    # Core Details
    course_id = models.CharField(max_length=255, help_text="Exact match e.g., 'Software Engineering'")
    country_id = models.CharField(max_length=10, help_text="e.g., 'us', 'in', 'es'")
    language = models.CharField(max_length=50, default="English")
    is_premium = models.BooleanField(default=False, help_text="Check this if this is a Premium roadmap")
    
    # Overview & Text
    title = models.CharField(max_length=255)
    overview = models.TextField()
    future_outlook = models.TextField()
    opportunity = models.TextField()
    pro_tip = models.TextField()
    
    # Arrays/Lists (Stored as JSON in Postgres)
    pros = models.JSONField(default=list, help_text="List of strings")
    cons = models.JSONField(default=list, help_text="List of strings")
    how_to = models.JSONField(default=list, help_text="List of strings")
    links = models.JSONField(default=list, help_text="List of objects: [{'name': '...', 'url': '...'}]")

    class Meta:
        unique_together = ('course_id', 'country_id', 'language')

        def __str__(self):
            return f"{self.title} ({self.country_id.upper()} - {self.language})"

class RoadmapStep(models.Model):
    DIFFICULTY_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
        ('Expert', 'Expert'),
        ('Visionary', 'Visionary'),
    ]

    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='steps')
    step_number = models.IntegerField()
    title = models.CharField(max_length=255)
    timeframe = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=50, choices=DIFFICULTY_CHOICES)
    description = models.TextField()
    
    # Arrays/Lists
    tools = models.JSONField(default=list, help_text="List of strings")
    milestones = models.JSONField(default=list, help_text="List of strings")
    anti_patterns = models.JSONField(default=list, blank=True, null=True, help_text="List of strings")

    class Meta:
        ordering = ['step_number']

    def __str__(self):
        return f"Step {self.step_number}: {self.title}"
    
class Feedback(models.Model):
    user_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    rating = models.IntegerField(default=5)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True) # Automatically saves the exact time

    class Meta:
        ordering = ['-date'] # Always show the newest reviews first

    def __str__(self):
        return f"{self.name} - {self.rating} Stars"