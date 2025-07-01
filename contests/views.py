from rest_framework import generics, permissions
from .models import Contest, ContestRegistration
from .serializers import ContestSerializer, ContestRegistrationSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

class ContestListView(generics.ListAPIView):
    queryset = Contest.objects.all()
    serializer_class = ContestSerializer
    permission_classes = [permissions.AllowAny]

class ContestRegisterView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, contest_id):
        contest = Contest.objects.get(id=contest_id)
        ContestRegistration.objects.get_or_create(user=request.user, contest=contest)
        return Response({"message": "Registered successfully."}, status=status.HTTP_201_CREATED)
