from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from problems.models import Problem


class Verdict(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    ACCEPTED = 'AC', _('Accepted')
    WRONG_ANSWER = 'WA', _('Wrong Answer')
    TIME_LIMIT_EXCEEDED = 'TLE', _('Time Limit Exceeded')
    RUNTIME_ERROR = 'RE', _('Runtime Error')
    COMPILATION_ERROR = 'CE', _('Compilation Error')

class Language(models.TextChoices):
    PYTHON = 'python', _('Python')
    CPP = 'cpp', _('C++')
    JAVA = 'java', _('Java')

class Submission(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    problem = models.ForeignKey(
        Problem,
        on_delete=models.CASCADE,
        related_name='submissions'
    )
    code = models.TextField()
    language = models.CharField(
        max_length=20,
        choices=Language.choices
    )
    verdict = models.CharField(
        max_length=10,
        choices=Verdict.choices,
        default=Verdict.PENDING,
        db_index=True
    )
    time_taken = models.FloatField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True, db_index=True)
    output = models.TextField(blank=True, null=True)
    error = models.TextField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-submitted_at']
        indexes = [
            models.Index(fields=['user', 'problem']),
        ]

    def __str__(self):
        return f"{self.user.username} → {self.problem.code} → {self.get_verdict_display()}"
