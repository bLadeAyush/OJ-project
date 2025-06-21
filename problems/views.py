from rest_framework import viewsets
from .models import Problem
from .serializers import ProblemSerializer

class ProblemViewSet(viewsets.ModelViewSet):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
