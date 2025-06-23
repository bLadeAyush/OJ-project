from django.db import models
from django.conf import settings
from users.models import User
from problems.models import Problem

class Submission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=20)

    # Replace verdict with these:
    if_error = models.BooleanField(default=False)  
    error_message = models.TextField(blank=True, null=True)  

    test_cases_passed = models.IntegerField(default=0)  
    total_test_cases = models.IntegerField(default=0)  

    time_taken = models.FloatField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.problem.code} - Passed: {self.test_cases_passed}/{self.total_test_cases}"
