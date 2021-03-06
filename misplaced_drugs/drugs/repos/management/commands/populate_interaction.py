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

            t_pair = sline[0]
            target1 = sline[0][0:6]
            target2 = sline[0][7:14]
            if [target2, target1] in seen_comparisons:
                self.stdout.write(self.style.SUCCESS('\r' + format((i/total) * 100, '.2f') + '% Complete...'))
                i += 1
                continue
            pdb_pair = sline[1]
            db_id = sline[2]
            if sline[3] != 'N/A':
                per_id = sline[3].split("(")[1][:-1]
            else:
                per_id = 'N/A'
            p_rmsd = sline[4]
            p_zscore = sline[5]
            p_evalue = sline[6]
            a_pscore = sline[7]
            pf_stc = sline[8]
            try:
                pf_ps = float(sline[9])
            except ValueError:
                pf_ps = 'N/A'

            # Reads database and find drugs and targets that this pair belongs to
            print (db_id)
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


            inter = Comparison(target_pair = t_pair,
                               Target1_ID = t1,
                               Target2_ID = t2,
                               DrugBank_ID = d,
                               PDB_Pair = pdb_pair,
                               Percentage_Identity = per_id,
                               Probis_RMSD = p_rmsd,
                               Probis_ZScore = p_zscore,
                               Probis_EValue = p_evalue,
                               APoc_PScore = a_pscore,
                               PocketFEATURE_STc = pf_stc,
                               PocketFEATURE_Pocket_Similarity = str(pf_ps * 100) + '%'
            )

            inter.save()
            seen_comparisons.append([target1, target2])
            self.stdout.write(self.style.SUCCESS('\r' + format((i/total) * 100, '.2f') + '% Complete...'))
            i += 1


    def handle(self, *args, **options):
        self._create_entries(options['Source CSV file'][0])
