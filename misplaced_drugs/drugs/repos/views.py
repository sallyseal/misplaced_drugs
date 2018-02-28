from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views import generic
from django.templatetags.static import static

from .models import Drug, Target, Comparison
from .forms import SearchForm


# Create your views here.
class DrugView(generic.DetailView):
    model = Drug
    template_name = 'repos/drug.html'
    context_object_name = 'this_drug'

class TargetView(generic.DetailView):
    model = Target
    template_name = 'repos/target.html'
    context_object_name = 'this_target'

class AboutView(generic.base.TemplateView):
    template_name = 'repos/about.html'

class ContactView(generic.base.TemplateView):
    template_name = 'repos/contact.html'

def homeView(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = SearchForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            term = form.cleaned_data['your_name']
            try:
                o = Drug.objects.get(generic_name=term)
            except:
                try:
                    o = Drug.objects.get(drugbank_ID=term)
                except:
                    try:
                        o = Target.objects.get(protein_name=term)
                    except:
                        try:
                            o = Target.objects.get(uniprot_ID=term)
                        except:
                            return HttpResponseRedirect('/repos/')

            if type(o) is Target:
                return HttpResponseRedirect('/repos/target/' + o.uniprot_ID)
            # redirect to a new URL:
            return HttpResponseRedirect('/repos/drug/' + o.drugbank_ID)

    # if a GET (or any other method) we'll create a blank form
    else:
        form = SearchForm()

    return render(request, 'repos/home.html', {'form': form})

class ComparisonView(generic.base.TemplateView):
    model = Comparison
    template_name = 'repos/comparison.html'
    context_object_name = 'this_comparison'
