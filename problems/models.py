from django.db import models

class Problem(models.Model):
    title = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    statement = models.TextField()
    difficulty = models.CharField(max_length=20)
    time_limit = models.FloatField()
    memory_limit = models.IntegerField()
    tags = models.CharField(max_length=200)

    def __str__(self):
        return self.title
