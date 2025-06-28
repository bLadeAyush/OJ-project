from rest_framework import generics
from .models import Problem
from .serializers import ProblemSerializer

class ProblemListView(generics.ListAPIView):
    serializer_class = ProblemSerializer

    def get_queryset(self):
        queryset = Problem.objects.all()
        difficulty = self.request.query_params.get("difficulty")
        tag = self.request.query_params.get("tag")

        if difficulty:
            queryset = queryset.filter(difficulty__iexact=difficulty)
        if tag:
            queryset = queryset.filter(tags__icontains=tag)

        return queryset

class ProblemDetailView(generics.RetrieveAPIView):
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    lookup_field = 'code'  
