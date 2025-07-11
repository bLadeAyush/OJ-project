from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

urlpatterns = [
    path('', lambda request: HttpResponse("Online Judge Backend Running")),
    path('admin/', admin.site.urls),
    path('api/problems/', include('problems.urls')),     
    path('api/', include('submissions.urls')),   
    path('api/users/', include('users.urls')), 
    path('api/contests/', include('contests.urls')),
          
]
