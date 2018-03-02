from django.core.management.base import BaseCommand
from repos.models import Drug, Target, Comparison, PDB

class Command(BaseCommand):
    help = 'Fills the Comparison database with info from the source CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('Source CSV file', nargs='+', type=str)

    def _create_entries(self, filename):
        infile = open(filename, 'r')
        for line in infile.readlines():
            sline = line.split(',')

            if sline[0] == 'Uniprot_Pair':
                continue

            target1 = sline[1][0:6]
            target2 = sline[1][7:14]
            pdb_pair = sline[2]
            db_id = sline[3]
            per_id = sline[4]
            p_rmsd = sline[5]
            p_zscore = sline[6]
            p_evalue = sline[7]
            a_pscore = sline[8]
            pf_stc = sline[9]
            pf_ps = sline[10]

            pdb1_id = sline[2][0:4]
            pdb2_id = sline[2][5:9]

            if pdb1_id == pdb2_id:
                continue

            # Reads database and find drugs, pdbs and targets that this pair belongs to
            for drug in Drug.objects.all():
                if drug.drugbank_ID == db_id:
                    d = drug

            for target in Target.objects.all():
                if target.uniprot_ID == target1:
                    t1 = target
                elif target.uniprot_ID == target2:
                    t2 = target
                else:
                    continue

            for pdb in PDB.objects.all():
                if pdb.PDB_ID == pdb1_id:
                    p1_id = pdb
            
            for pdb in PDB.objects.all():
                if pdb.PDB_ID == pdb2_id:
                    p2_id = pdb


            inter = Comparison(Target1_ID = t1,
                               Target2_ID = t2,
                               DrugBank_ID = d,
                               PDB1_ID = p1_id,
                               PDB2_ID = p2_id,
                               PDB_Pair = pdb_pair,
                               Percentage_Identity = per_id,
                               Probis_RMSD = p_rmsd,
                               Probis_ZScore = p_zscore,
                               Probis_EValue = p_evalue,
                               APoc_PScore = a_pscore,
                               PocketFEATURE_STc = pf_stc,
                               PocketFEATURE_Pocket_Similarity = pf_ps
            )

            inter.save()
            self.stdout.write(self.style.SUCCESS('Added new Comparison...'))


    def handle(self, *args, **options):
        self._create_entries(options['Source CSV file'][0])
