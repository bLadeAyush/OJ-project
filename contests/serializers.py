from rest_framework import serializers
from .models import Contest, ContestProblem, ContestRegistration

class ContestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contest
        fields = '__all__'

class ContestRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestRegistration
        fields = '__all__'
