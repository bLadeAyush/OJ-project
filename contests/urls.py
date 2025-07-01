from django.urls import path
from .views import ContestListView, ContestRegisterView

urlpatterns = [
    path('', ContestListView.as_view(), name='contest-list'),
    path('<int:contest_id>/register/', ContestRegisterView.as_view(), name='contest-register'),
]
