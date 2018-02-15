from django.core.management.base import BaseCommand
from repos.models import Drug, Target, Interaction

class Command(BaseCommand):
    help = 'Fills the database with info from the source CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('Source CSV file', nargs='+', type=str)

    def _create_entries(self, filename):
        seen_drugs = []
        seen_targets = []
        infile = open(filename, 'r')
        for line in infile.readlines():
            sline = line.split(',')
            if len(sline[4]) > 7:
                continue
            dbid = sline[4]
            gen_name = sline[2]
            brand_name = sline[3].split('#')[0]
            uniprot = sline[8]
            prot_name = sline[7]
            pdb = sline[9]

            if dbid in seen_drugs:
                known_drug = True
            else:
                known_drug = False
            if uniprot in seen_targets:
                known_target = True
            else:
                known_target = False

            if known_drug and known_target:
                # Just add interaction
                for drug in Drug.objects.all():
                    if drug.drugbank_ID == dbid:
                        d = drug
                for target in Target.objects.all():
                    if target.uniprot_ID == uniprot:
                        t = target
                inter = Interaction(drug=d, target=t)
                inter.save()
                self.stdout.write(self.style.SUCCESS('Added new interaction...'))
            elif known_drug:
                # Add new target to existing drug, add interaction
                for drug in Drug.objects.all():
                    if drug.drugbank_ID == dbid:
                        d = drug
                targ = Target(uniprot_ID=uniprot, protein_name=prot_name, PDB_ID=pdb)
                targ.save()
                inter = Interaction(drug=d, target=targ)
                inter.save()
                seen_targets.append(uniprot)
                self.stdout.write(self.style.SUCCESS('Added new target...'))
            elif known_target:
                # Add new drug to existing target, add interaction
                for target in Target.objects.all():
                    if target.uniprot_ID == uniprot:
                        t = target
                drug = Drug(drugbank_ID=dbid, generic_name=gen_name, brand_name=brand_name)
                drug.save()
                inter = Interaction(drug=drug, target=t)
                inter.save()
                seen_drugs.append(dbid)
                self.stdout.write(self.style.SUCCESS('Added new drug...'))
            else:
                # Both drug and target are new, add all three
                targ = Target(uniprot_ID=uniprot, protein_name=prot_name, PDB_ID=pdb)
                targ.save()
                drug = Drug(drugbank_ID=dbid, generic_name=gen_name, brand_name=brand_name)
                drug.save()
                inter = Interaction(drug=drug, target=targ)
                inter.save()
                seen_drugs.append(dbid)
                seen_targets.append(uniprot)
                self.stdout.write(self.style.SUCCESS('Added new drug and target...'))

    def handle(self, *args, **options):
        self._create_entries(options['Source CSV file'][0])
