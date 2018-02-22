from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views import generic
from .models import Drug, Target, Comparison

# Create your views here.
class DrugView(generic.DetailView):
    model = Drug
    template_name = 'repos/drug.html'
    context_object_name = 'this_drug'

class TargetView(generic.DetailView):
    model = Target
    template_name = 'repos/target.html'
    context_object_name = 'this_target'

class HomeView(generic.base.TemplateView):
    template_name = 'repos/home.html'

class AboutView(generic.base.TemplateView):
    template_name = 'repos/about.html'

class ComparisonView(generic.base.TemplateView):
    model = Comparison
    template_name = 'repos/comparison.html'
    context_object_name = 'this_comparison'
