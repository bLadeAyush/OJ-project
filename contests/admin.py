from django.contrib import admin
from .models import Contest, ContestProblem, ContestRegistration

admin.site.register(Contest)
admin.site.register(ContestProblem)
admin.site.register(ContestRegistration)
