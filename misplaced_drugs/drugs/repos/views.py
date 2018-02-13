from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views import generic
from .models import Drug, Target

# Create your views here.
class DrugView(generic.DetailView):
    model = Drug
    template_name = 'repos/drug.html'
    context_object_name = 'this_drug'

    # def get_queryset(self):
    #     """
    #     Excludes any questions that aren't published yet.
    #     """
    #     return Drug.objects.all()

class TargetView(generic.DetailView):
    model = Target
    template_name = 'repos/target.html'
    context_object_name = 'this_target'

    # def get_queryset(self):
    #     """
    #     Excludes any questions that aren't published yet.
    #     """
    #     return Target.objects.all()
