import datetime
from django.db import models
from django.utils import timezone
# Create your models here.

class Drug(models.Model):
    targets = models.ManyToManyField('Target')
    drugbank_ID = models.CharField(max_length=10, primary_key=True)
    generic_name = models.CharField(max_length=100)
    brand_name = models.CharField(max_length=100)
    indication = models.CharField(max_length=1000)
    moa = models.CharField(max_length=1000)
    chembl_ID = models.CharField(max_length=20)
    approval = models.CharField(max_length=100)
    def __str__(self):
        return self.drugbank_ID

class Target(models.Model):
    uniprot_ID = models.CharField(max_length=20, primary_key=True)
    protein_name = models.CharField(max_length=100)
    PDB_ID = models.CharField(max_length=5)
    gene_name = models.CharField(max_length=20)
    def __str__(self):
        return self.uniprot_ID


# class Interaction(models.Model):
#     target = models.ForeignKey(Target, on_delete=models.CASCADE)
#     drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
#     uniprot_ID = models.CharField(max_length=200)
#     def __str__(self):
#         return self.uniprot_ID
