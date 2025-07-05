from rest_framework import serializers
from .models import Contest, ContestProblem, ContestRegistration
from rest_framework import serializers
from .models import ContestProblem
from problems.models import Problem


class ContestSerializer(serializers.ModelSerializer):
    is_registered = serializers.SerializerMethodField()

    class Meta:
        model = Contest
        fields = ['id', 'title', 'description', 'start_time', 'end_time', 'is_public', 'created_at', 'is_registered']

    def get_is_registered(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return ContestRegistration.objects.filter(user=user, contest=obj).exists()
        return False



class ContestRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContestRegistration
        fields = '__all__'


class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'

class ContestProblemSerializer(serializers.ModelSerializer):
    problem = ProblemSerializer()

    class Meta:
        model = ContestProblem
        fields = ['label', 'problem']

