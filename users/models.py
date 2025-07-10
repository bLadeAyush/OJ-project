from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    streak = models.IntegerField(default=0)
    badges = models.JSONField(default=list)  
    joined_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
