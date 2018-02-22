from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views import generic
from .models import Drug, Target
from dal import autocomplete
from .forms import SearchForm
try:
    from django.urls import reverse_lazy
except ImportError:
    from django.core.urlresolvers import reverse_lazy

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

class HomeView(generic.base.TemplateView):
    template_name = 'repos/home.html'

class AboutView(generic.base.TemplateView):
    template_name = 'repos/about.html'

def homeView(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = SearchForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            drug_name = form.cleaned_data['your_name']
            d = get_object_or_404(Drug, generic_name=drug_name)
            # redirect to a new URL:
            return HttpResponseRedirect('/repos/drug/' + d.drugbank_ID)

    # if a GET (or any other method) we'll create a blank form
    else:
        form = SearchForm()

    return render(request, 'repos/home.html', {'form': form})
