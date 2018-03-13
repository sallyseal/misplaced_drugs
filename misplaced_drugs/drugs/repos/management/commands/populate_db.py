from django.core.management.base import BaseCommand
from repos.models import Drug, Target, PDB

class Command(BaseCommand):
    help = 'Fills the database with info from the source CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('Source CSV file', nargs='+', type=str)

    def _create_entries(self, filename):
        seen_drugs = []
        seen_targets = []
        seen_pdbs = []
        infile = open(filename, 'r')
        linelist = infile.readlines()
        total = float(len(linelist))
        i = 0
        for line in linelist:
            sline = line.split('\t')
            if len(sline[1]) > 7:
                continue    # Skip the first line
            dbid = sline[1]
            gen_name = sline[2]
            brand_name = sline[3].split('#')[0]
            approval = sline[19]
            indication = sline[16]
            moa = sline[17]                # Gather all the data from the line
            chembl = sline[18]
            uniprot = sline[9]
            prot_name = sline[7]
            pdb = sline[10]
            ligand = sline[6]
            gene = sline[8]
            if sline[4] == 'bound':
                bound = True
            else:
                bound = False

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
                if pdb not in seen_pdbs:
                    new_pdb = PDB(PDB_ID=pdb, ligand_code=ligand, target=t, drug=d, bound=bound)
                    new_pdb.save()
                    seen_pdbs.append(pdb)
                    self.stdout.write(self.style.SUCCESS('Added new PDB...'))
                self.stdout.write(self.style.SUCCESS('Added new interaction...' + format((i/total) * 100, '.2f') + '% Complete...'))
            elif known_drug:
                # Add new target to existing drug
                for drug in Drug.objects.all():
                    if drug.drugbank_ID == dbid:
                        d = drug
                targ = Target(uniprot_ID=uniprot, protein_name=prot_name, gene_name=gene)
                targ.save()
                d.targets.add(targ)
                seen_targets.append(uniprot)
                new_pdb = PDB(PDB_ID=pdb, ligand_code=ligand, target=targ, drug=d, bound=bound)
                new_pdb.save()
                seen_pdbs.append(pdb)
                self.stdout.write(self.style.SUCCESS('Added new PDB...'))
                self.stdout.write(self.style.SUCCESS('Added new target...' + format((i/total) * 100, '.2f') + '% Complete...'))
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
                if pdb not in seen_pdbs:
                    new_pdb = PDB(PDB_ID=pdb, ligand_code=ligand, target=t, drug=drug, bound=bound)
                    new_pdb.save()
                    seen_pdbs.append(pdb)
                    self.stdout.write(self.style.SUCCESS('Added new PDB...'))

                self.stdout.write(self.style.SUCCESS('Added new drug...' + format((i/total) * 100, '.2f') + '% Complete...'))
            else:
                # Both drug and target are new, add both
                targ = Target(uniprot_ID=uniprot, protein_name=prot_name, gene_name=gene)
                targ.save()
                drug = Drug(drugbank_ID=dbid, generic_name=gen_name, brand_name=brand_name, approval=approval, indication=indication, moa=moa, chembl_ID=chembl)
                drug.save()
                drug.targets.add(targ)
                drug.save()
                seen_drugs.append(dbid)
                seen_targets.append(uniprot)
                new_pdb = PDB(PDB_ID=pdb, ligand_code=ligand, target=targ, drug=drug, bound=bound)
                new_pdb.save()
                seen_pdbs.append(pdb)
                self.stdout.write(self.style.SUCCESS('Added new PDB...'))
                self.stdout.write(self.style.SUCCESS('Added new drug and target...' + format((i/total) * 100, '.2f') + '% Complete...'))
            i += 1

        for line in linelist: # Go back through and add similar drugs - has to happen after database is complete
            sline = line.split('\t')
            if len(sline[1]) > 7:
                continue    # Skip the first line
            dbid = sline[1]
            d = Drug.objects.get(drugbank_ID=dbid)
            similar = []
            for i in range(20,26):
                if len(sline[i]) == 7:
                    print ("Drug: " + sline[i].rstrip())
                    try:
                        d.similar.add(Drug.objects.get(drugbank_ID=sline[i].rstrip()))
                        d.save()
                        self.stdout.write(self.style.SUCCESS('Similarity added...'))
                    except:
                        self.stdout.write(self.style.ERROR('Drug not found...'))


    def handle(self, *args, **options):
        self._create_entries(options['Source CSV file'][0])
