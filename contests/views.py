from rest_framework import generics, permissions
from .models import Contest, ContestRegistration
from .serializers import ContestSerializer, ContestRegistrationSerializer, ContestProblemSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied, NotFound
from django.utils.timezone import now
from .models import Contest, ContestProblem, ContestRegistration
from rest_framework.generics import ListAPIView
from submissions.models import Submission


class ContestListView(generics.ListAPIView):
    serializer_class = ContestSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Contest.objects.all()

    def get_serializer_context(self):
        return {'request': self.request}


class ContestRegisterView(APIView):
    serializer_class = ContestRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, contest_id):
        contest = get_object_or_404(Contest, id=contest_id)
        ContestRegistration.objects.get_or_create(user=request.user, contest=contest)
        obj, created = ContestRegistration.objects.get_or_create(user=request.user, contest=contest)
        if created:
            return Response({"message": "Registered successfully."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Already registered."}, status=status.HTTP_200_OK)



class ContestProblemsView(ListAPIView):
    serializer_class = ContestProblemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        contest_id = self.kwargs['contest_id']
        contest = get_object_or_404(Contest, id=contest_id)


        if not ContestRegistration.objects.filter(contest=contest, user=self.request.user).exists():
            raise PermissionDenied("You are not registered for this contest.")

        
        current_time = now()
        if not (contest.start_time <= current_time <= contest.end_time):
            raise PermissionDenied("Contest is not currently active.")

        return ContestProblem.objects.filter(contest=contest).select_related('problem')



# class ContestProblemLeaderboardView(ListAPIView):
#     serializer_class = LeaderboardEntrySerializer
#     permission_classes = [permissions.AllowAny]  # Or IsAuthenticated if needed

#     def get_queryset(self):
#         contest_id = self.kwargs['contest_id']
#         problem_id = self.kwargs['problem_id']
        
#         return Submission.objects.filter(
#             contest_id=contest_id,
#             problem_id=problem_id,
#             verdict='AC'
#         ).order_by('created_at').select_related('user')