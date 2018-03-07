from django.core.management.base import BaseCommand
from repos.models import Drug, Target, Comparison

class Command(BaseCommand):
    help = 'Fills the interaction database with info from the source CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('Source CSV file', nargs='+', type=str)

    def _create_entries(self, filename):
        seen_comparisons = []
        infile = open(filename, 'r')
        linelist = infile.readlines()
        total = float(len(linelist))
        i = 0
        for line in linelist:
            sline = line.split(',')

            if sline[0] == 'Uniprot_Pair':
                continue

            target1 = sline[0][0:6]
            target2 = sline[0][7:14]
            pdb_pair = sline[1]
            db_id = sline[2]
            per_id = sline[3]
            p_rmsd = sline[4]
            p_zscore = sline[5]
            p_evalue = sline[6]
            a_pscore = sline[7]
            pf_stc = sline[8]
            pf_ps = sline[9]

            # Reads database and find drugs and targets that this pair belongs to
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


            inter = Comparison(Target1_ID = t1,
                               Target2_ID = t2,
                               DrugBank_ID = d,
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
            self.stdout.write(self.style.SUCCESS('\r' + format((i/total) * 100, '.2f') + '% Complete...'))
            i += 1


    def handle(self, *args, **options):
        self._create_entries(options['Source CSV file'][0])
