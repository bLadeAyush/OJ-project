from django.urls import path
from .views import SubmitCodeView

urlpatterns = [
    path('', SubmitCodeView.as_view(), name='submit-code'),
]
