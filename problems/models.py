from django.db import models

DIFFICULTY_CHOICES = (
    ('Easy', 'Easy'),
    ('Medium', 'Medium'),
    ('Hard', 'Hard'),
)

class Problem(models.Model):
    name = models.CharField(max_length=200)
    code = models.SlugField(unique=True) 
    statement = models.TextField()
    input_format = models.TextField()
    output_format = models.TextField()
    constraints = models.TextField()
    sample_input = models.TextField()
    sample_output = models.TextField()
    time_limit = models.FloatField(default=1.0)  
    memory_limit = models.IntegerField(default=256) 
    tags = models.JSONField(default=list)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    test_cases = models.JSONField(default=list)

    def __str__(self):
        return self.name
