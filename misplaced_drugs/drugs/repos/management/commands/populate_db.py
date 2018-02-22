from django.core.management.base import BaseCommand
from repos.models import Drug, Target

class Command(BaseCommand):
    help = 'Fills the database with info from the source CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('Source CSV file', nargs='+', type=str)

    def _create_entries(self, filename):
        seen_drugs = []
        seen_targets = []
        infile = open(filename, 'r')
        for line in infile.readlines():
            sline = line.split('\t')
            if len(sline[6]) > 7:
                continue    # Skip the first line
            dbid = sline[6]
            gen_name = sline[4]
            brand_name = sline[4].split('#')[0]
            approval = sline[17]
            indication = sline[18]
            moa = sline[19]                # Gather all the data from the line
            chembl = sline[20]
            uniprot = sline[10]
            prot_name = sline[9]
            pdb = sline[11]
            gene = sline[22].rstrip()

            if dbid in seen_drugs:  # Determine if this drug or target has already been added
                known_drug = True
            else:
                known_drug = False
            if uniprot in seen_targets:
                known_target = True
            else:
                known_target = False

            if known_drug and known_target:
                # Just add an interaction link between a drug and target
                for drug in Drug.objects.all():
                    if drug.drugbank_ID == dbid:
                        d = drug
                for target in Target.objects.all():
                    if target.uniprot_ID == uniprot:
                        t = target
                d.targets.add(t)
                d.save()
                self.stdout.write(self.style.SUCCESS('Added new interaction...'))
            elif known_drug:
                # Add new target to existing drug
                for drug in Drug.objects.all():
                    if drug.drugbank_ID == dbid:
                        d = drug
                targ = Target(uniprot_ID=uniprot, protein_name=prot_name, PDB_ID=pdb, gene_name=gene)
                targ.save()
                d.targets.add(targ)
                seen_targets.append(uniprot)
                self.stdout.write(self.style.SUCCESS('Added new target...'))
            elif known_target:
                # Add new drug to existing target
                for target in Target.objects.all():
                    if target.uniprot_ID == uniprot:
                        t = target
                drug = Drug(drugbank_ID=dbid, generic_name=gen_name, brand_name=brand_name, approval=approval, indication=indication, moa=moa, chembl_ID=chembl)
                drug.save()
                drug.targets.add(t)
                drug.save()
                seen_drugs.append(dbid)
                self.stdout.write(self.style.SUCCESS('Added new drug...'))
            else:
                # Both drug and target are new, add both
                targ = Target(uniprot_ID=uniprot, protein_name=prot_name, PDB_ID=pdb, gene_name=gene)
                targ.save()
                drug = Drug(drugbank_ID=dbid, generic_name=gen_name, brand_name=brand_name, approval=approval, indication=indication, moa=moa, chembl_ID=chembl)
                drug.save()
                drug.targets.add(targ)
                drug.save()
                seen_drugs.append(dbid)
                seen_targets.append(uniprot)
                self.stdout.write(self.style.SUCCESS('Added new drug and target...'))

    def handle(self, *args, **options):
        self._create_entries(options['Source CSV file'][0])
