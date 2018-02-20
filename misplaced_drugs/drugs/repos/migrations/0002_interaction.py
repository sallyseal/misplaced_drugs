# Generated by Django 2.0.2 on 2018-02-20 15:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('repos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Interaction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('PDB_Pair', models.CharField(max_length=12)),
                ('Percentage_Identity', models.CharField(max_length=50)),
                ('Probis_RMSD', models.CharField(max_length=50)),
                ('Probis_ZScore', models.CharField(max_length=50)),
                ('Probis_EValue', models.CharField(max_length=50)),
                ('APoc_PScore', models.CharField(max_length=50)),
                ('PocketFEATURE_STc', models.CharField(max_length=50)),
                ('PocketFEATURE_Pocket_Similarity', models.CharField(max_length=50)),
                ('DrugBank_ID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='repos.Drug')),
                ('Target1_ID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inter_1', to='repos.Target')),
                ('Target2_ID', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inter_2', to='repos.Target')),
            ],
        ),
    ]