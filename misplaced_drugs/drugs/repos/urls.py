from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

app_name = 'repos'
urlpatterns = [
    path('drug/<str:pk>/', views.DrugView.as_view(), name='drug'),
    path('target/<str:pk>/', views.TargetView.as_view(), name='target'),
    path('comparison/<str:pk>/', views.ComparisonView.as_view(), name='comparison'),
    path('', views.homeView, name='home'),
    path('about/', views.AboutView.as_view(), name='about'),
    path('contact/', views.ContactView.as_view(), name='contact'),
]
