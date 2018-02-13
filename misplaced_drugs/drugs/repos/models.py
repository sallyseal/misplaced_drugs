import datetime
from django.db import models
from django.utils import timezone
# Create your models here.

class Drug(models.Model):
    #target = models.ForeignKey(Target, on_delete=models.CASCADE)
    drugbank_ID = models.CharField(max_length=200)
    def __str__(self):
        return self.drugbank_ID

class Target(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    uniprot_ID = models.CharField(max_length=200)
    def __str__(self):
        return self.uniprot_ID
