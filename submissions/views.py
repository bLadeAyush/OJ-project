from rest_framework import viewsets
from .models import Submission
from .serializers import SubmissionSerializer

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all().order_by('-submitted_at')
    serializer_class = SubmissionSerializer
