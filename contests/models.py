from django.db import models
from django.conf import settings
from problems.models import Problem

class Contest(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ContestProblem(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE, related_name='contest_problems')
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    label = models.CharField(max_length=5) 
    class Meta:
        unique_together = ('contest', 'label')

class ContestRegistration(models.Model):
    contest = models.ForeignKey(Contest, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('contest', 'user')
