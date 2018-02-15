from django.urls import path

from . import views

app_name = 'repos'
urlpatterns = [
    path('drug/<str:pk>/', views.DrugView.as_view(), name='drug'),
    path('target/<str:pk>/', views.TargetView.as_view(), name='target'),
    # path('interaction/<int:pk>/', views.InteractionView.as_view(), name='interaction'),
]
