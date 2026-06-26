from django.db import models

class Roadmap(models.Model):
    # Core Details
    course_id = models.CharField(max_length=255, help_text="Exact match e.g., 'Software Engineering'")
    country_id = models.CharField(max_length=10, help_text="e.g., 'us', 'in', 'es'")
    language = models.CharField(max_length=50, default="English")
    
    # Overview & Text
    title = models.CharField(max_length=255)
    is_premium = models.BooleanField(default=False, help_text="Check this if this is a Premium roadmap")
    overview = models.TextField()
    future_outlook = models.TextField()
    opportunity = models.TextField()
    pro_tip = models.TextField()
    
    # TEXT FIELDS (Faster manual entry! Just type on new lines)
    pros = models.TextField(blank=True, default="", help_text="Type each pro on a new line (e.g. - High pay)")
    cons = models.TextField(blank=True, default="", help_text="Type each con on a new line")
    how_to = models.TextField(blank=True, default="", help_text="Type each step on a new line")
    
    # Links stays as JSON!
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
    
    # TEXT FIELDS (Faster manual entry)
    tools = models.TextField(blank=True, default="", help_text="Type each tool on a new line")
    milestones = models.TextField(blank=True, default="", help_text="Type each milestone on a new line")
    anti_patterns = models.TextField(blank=True, default="", help_text="Type each anti-pattern on a new line")

    class Meta:
        ordering = ['step_number']

    def __str__(self):
        return f"Step {self.step_number}: {self.title}"


class Feedback(models.Model):
    user_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    rating = models.IntegerField(default=5)
    text = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.name} - {self.rating} Stars"