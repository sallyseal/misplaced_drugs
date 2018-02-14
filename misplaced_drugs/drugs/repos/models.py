import datetime
from django.db import models
from django.utils import timezone
# Create your models here.

class Drug(models.Model):
    #target = models.ForeignKey(Target, on_delete=models.CASCADE)
    drugbank_ID = models.CharField(max_length=10)
    generic_name = models.CharField(max_length=200)
    brand_name = models.CharField(max_length=200)
    def __str__(self):
        return ('%S - %S' % self.drugbank_ID, self.generic_name)

class Target(models.Model):
    uniprot_ID = models.CharField(max_length=20)
    protein_name = models.CharField(max_length=200)
    PDB_ID = models.CharField(max_length=10)
    def __str__(self):
        return ('%S - %S' % self.uniprot_ID, self.protein_name)

class Interaction(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    target = models.ForeignKey(Target, on_delete=models.CASCADE)
    # uniprot_ID = models.CharField(max_length=200)
    # def __str__(self):
    #     return self.uniprot_ID
