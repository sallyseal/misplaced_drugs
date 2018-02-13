from django.urls import path

from . import views

app_name = 'repos'
urlpatterns = [
    path('drug/<int:pk>/', views.DrugView.as_view(), name='drug'),
    path('target/<int:pk>/', views.TargetView.as_view(), name='target'),
]
