from celery import shared_task
from django.utils.timezone import now
from contests.models import ContestProblem

@shared_task
def unlock_contest_problems():
    current_time = now()
    contest_problems = ContestProblem.objects.filter(contest__end_time__lte=current_time)

    for cp in contest_problems:
        problem = cp.problem
        if problem.is_contest_only:
            problem.is_contest_only = False
            problem.save()
