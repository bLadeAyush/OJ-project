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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import Min
from users.models import User  


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



class ContestLeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

   
    def get(self,request, contest_id):
        try:
            contest = Contest.objects.get(id=contest_id)
        except Contest.DoesNotExist:
            return Response({"error": "Contest not found"}, status=404)

        if now() < contest.start_time:
            return Response({"error": "Contest has not started"}, status=403)

        
        contest_problem_ids = ContestProblem.objects.filter(contest=contest).values_list("problem_id", flat=True)

        
        ac_subs = (
            Submission.objects
            .filter(problem_id__in=contest_problem_ids, verdict="AC", submitted_at__lte=contest.end_time)
            .values("user", "problem")
            .annotate(first_ac=Min("submitted_at"))
        )

    
        leaderboard = {}
        for sub in ac_subs:
            user_id = sub["user"]
            if user_id not in leaderboard:
                leaderboard[user_id] = {"solved": 0, "time": 0}
            leaderboard[user_id]["solved"] += 1
            leaderboard[user_id]["time"] += int((sub["first_ac"] - contest.start_time).total_seconds())

        
        users = User.objects.in_bulk(leaderboard.keys())
        result = []
        for user_id, stats in leaderboard.items():
            result.append({
                "user_id": user_id,
                "username": users[user_id].username,
                "solved": stats["solved"],
                "time": stats["time"]
            })

        
        result.sort(key=lambda x: (-x["solved"], x["time"]))

        return Response(result)
