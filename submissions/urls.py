from django.urls import path
from .views import SubmitCodeView , SubmissionListView
from .views import RunCodeView , SubmissionStatusView


urlpatterns = [
    path('submit/', SubmitCodeView.as_view(), name='submit-code'),
    path("run/", RunCodeView.as_view(), name="run-code"),
    path('submission/<int:submission_id>/', SubmissionStatusView.as_view()),
    path("submissions/", SubmissionListView.as_view(), name="submission-list"),
]
