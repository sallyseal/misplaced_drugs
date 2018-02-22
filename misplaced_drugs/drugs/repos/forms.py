from django import forms
from .models import Drug


class SearchForm(forms.Form):
    your_name = forms.CharField(label='Your name', max_length=100)
    your_name.widget = forms.TextInput(attrs={'id': 'myInput', 'type': 'text', 'name': 'mySearch', 'placeholder':'Drug Name', })
