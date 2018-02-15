# Generated by Django 2.0.1 on 2018-02-15 14:40

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Drug',
            fields=[
                ('drugbank_ID', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('generic_name', models.CharField(max_length=200)),
                ('brand_name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Target',
            fields=[
                ('uniprot_ID', models.CharField(max_length=20, primary_key=True, serialize=False)),
                ('protein_name', models.CharField(max_length=200)),
                ('PDB_ID', models.CharField(max_length=10)),
            ],
        ),
        migrations.AddField(
            model_name='drug',
            name='targets',
            field=models.ManyToManyField(to='repos.Target'),
        ),
    ]
