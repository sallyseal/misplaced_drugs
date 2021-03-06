from django.db import models

class Drug(models.Model):
    targets = models.ManyToManyField('Target')
    similar = models.ManyToManyField('self', symmetrical=True)
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
    gene_name = models.CharField(max_length=20)
    def __str__(self):
        return self.uniprot_ID

class PDB(models.Model):
    drug = models.ForeignKey(Drug, on_delete=models.CASCADE)
    target = models.ForeignKey(Target, on_delete=models.CASCADE)
    PDB_ID = models.CharField(max_length=5)
    ligand_code = models.CharField(max_length=20)
    bound = models.BooleanField()
    def __str__(self):
        return self.PDB_ID

class Comparison(models.Model):
    target_pair = models.CharField(max_length=20)
    Target1_ID = models.ForeignKey(Target, on_delete=models.CASCADE, related_name='inter_1')
    Target2_ID = models.ForeignKey(Target, on_delete=models.CASCADE, related_name='inter_2')
    DrugBank_ID = models.ForeignKey(Drug, on_delete=models.CASCADE)
    PDB_Pair = models.CharField(max_length=12)
    Percentage_Identity = models.CharField(max_length=50)
    Probis_RMSD = models.CharField(max_length=50)
    Probis_ZScore = models.CharField(max_length=50)
    Probis_EValue = models.CharField(max_length=50)
    APoc_PScore = models.CharField(max_length=50)
    PocketFEATURE_STc = models.CharField(max_length=50)
    PocketFEATURE_Pocket_Similarity = models.CharField(max_length=50)
