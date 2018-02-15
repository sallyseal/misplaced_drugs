import datetime
from django.db import models
from django.utils import timezone
# Create your models here.

class Drug(models.Model):
    targets = models.ManyToManyField('Target')
    drugbank_ID = models.CharField(max_length=10, primary_key=True)
    generic_name = models.CharField()
    brand_name = models.CharField()
    # indication = models.CharField()
    # moa = models.CharField()
    # chembl_ID = models.CharField()
    # approval = models.CharField()
    def __str__(self):
        return self.drugbank_ID

class Target(models.Model):
    uniprot_ID = models.CharField(max_length=20, primary_key=True)
    protein_name = models.CharField()
    PDB_ID = models.CharField(max_length=5)
    def __str__(self):
        return self.uniprot_ID


# class Interaction(models.Model):
#     target = models.ForeignKey(Target, on_delete=models.CASCADE)
#     drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
#     uniprot_ID = models.CharField(max_length=200)
#     def __str__(self):
#         return self.uniprot_ID
