# Take input from RCSB database and interaction information (if available) to create a database that can be fed into the Django interaction model

# Need to define drug_id used by the database

# First define interaction pair:

rcsb = open('rcsb_combined.csv', 'r')
rlines = rcsb.readlines()

rcsb.close()

# Create dictionary of PDB, Uniprot, and DrugBank IDS and associates with a given drug-target interaction

drug_lst = []
id_lst = []
pdb_lst = []
interaction_no = []

id_count = 0

for l in rlines:

    if id_count == 0:
        id_count +=1
        continue

    l = l.split(',')

    id_no = id_count
    d = l[3]
    prot_id = l[4]
    pdb_id = l[5]

    drug_lst.append(d)
    id_lst.append(prot_id)
    pdb_lst.append(pdb_id)
    interaction_no.append(str(id_count))

    id_count += 1

uniprot_dict = dict(zip(interaction_no, id_lst))
pdb_dict = dict(zip(interaction_no, pdb_lst))
drug_dict = dict(zip(interaction_no, drug_lst))

# Create comparison pairs for input into database based on shared drugs

drug_lst = list(set(drug_lst))

comparison_pairs = []
filtered_pairs = []
reversed = []


for d in drug_lst:
    ids = []
    for k, v in drug_dict.items():
        if v == d:
            ids.append(k)


    ids = list(set(ids))

    for p1 in ids:
        for p2 in ids:
            if p1 != p2:
                pair = str(p1) + "-" + str(p2)
                comparison_pairs.append(pair)

comparison_pairs = list(set(comparison_pairs))

filtered_pairs = []
reversed = []

for pair in comparison_pairs:
    if pair not in reversed:
        pair = pair.split('-')

        id1 = pair[0]
        id2 = pair[1]

        old_pair = id1 + '-' + id2
        reverse = id2 + "-" + id1
        reversed.append(reverse)

        if old_pair not in filtered_pairs:
            filtered_pairs.append(old_pair)


filtered_pairs = list(set(filtered_pairs))
filtered_pairs.sort()

# Create a comparison pair/Uniprot-ID dictionary

uniprot_pairs = []

for pair in filtered_pairs:
	pair = pair.split('-')

	id1 = pair[0]
	id2 = pair[1]

	uniprot1 = uniprot_dict[id1]
	uniprot2 = uniprot_dict[id2]

	uniprot_pair = uniprot1 + "-" + uniprot2
	uniprot_pairs.append(uniprot_pair)

pair_uniprot_dict = dict(zip(filtered_pairs,uniprot_pairs))

# Create a drug-comparison pair dictionary

drug_list = []

for pair in filtered_pairs:
	pair = pair.split('-')

	id1 = pair[0]

	for k, v in drug_dict.items():
		if k == id1:
			d = v
			drug_list.append(d)

pair_drug_dict = dict(zip(filtered_pairs,drug_list))

# Create protein-pair pdb list and creates a dictionary associating the two

pdb_pairs = []

for pair in filtered_pairs:
	pair = pair.split('-')

	id1 = pair[0]
	id2 = pair[1]

	pdb1 = pdb_dict[id1]
	pdb2 = pdb_dict[id2]

	pdb_pair = pdb1 + "-" + pdb2

	pdb_pairs.append(pdb_pair)

pair_pdb_dict = dict(zip(filtered_pairs,pdb_pairs))

# Extract RMSD, Z-score and E-value information from probis input file

f_file = open('FilteredCSV.csv', 'r')
flines = f_file.readlines()

f_file.close()

probis_pairs = []

for l in flines:
    l = l.split(',')

    pdb_1 = l[0][0:4]
    pdb_2 = l[1][0:4]
    pdb_1 = str(pdb_1.upper())
    pdb_2 = str(pdb_2.upper())

    probis_pdb = pdb_1 + '-' + pdb_2
    probis_pairs.append(probis_pdb)

probis_pairs = list(set(probis_pairs))

probis_reversed = []
filtered_probis = []

for pair1 in probis_pairs:
    if pair1 not in probis_reversed:

        pdb1_1 = pair1[0:4]
        pdb1_2 = pair1[5:9]

        if pdb1_1 == 'QUER':
            continue

        reversed_pdb = pdb1_2 + "-" + pdb1_1
        probis_reversed.append(reversed_pdb)

        if pair1 not in filtered_probis:
            filtered_probis.append(pair1)

filtered_probis = list(set(filtered_probis))
filtered_probis.sort()

p_zscores = []
p_evalues = []
p_rmsds = []

for pair in filtered_pairs:
	pair = pair.split('-')

	id1 = pair[0]
	id2 = pair[1]

	pdb1 = pdb_dict[id1]
	pdb2 = pdb_dict[id2]

	forward_pdb = pdb1 + "-" + pdb2
	reverse_pdb = pdb2 + "-" + pdb1

	pdb1 = str(pdb1.lower())
	pdb2 = str(pdb2.lower())

	if forward_pdb in filtered_probis:
		for l in flines:
			l = l.split(',')

			if l[0][0:4] == pdb1 and l[1][0:4] == pdb2:
				p_zscores.append(l[2])
				p_evalues.append(l[3])
				p_rmsds.append(l[4][:-1])

	elif reverse_pdb in filtered_probis:
		for l in flines:
			l = l.split(',')

			if l[0][0:4] == pdb2 and l[1][0:4] == pdb1:
				p_zscores.append(l[2])
				p_evalues.append(l[3])
				p_rmsds.append(l[4][:-1])

	else:
		p_zscores.append('N/A')
		p_evalues.append('N/A')
		p_rmsds.append('N/A')

#Create dictionaries for pair metrics from Probis:

pair_zscores = dict(zip(filtered_pairs, p_zscores))
pair_evalues = dict(zip(filtered_pairs, p_evalues))
pair_rmsds = dict(zip(filtered_pairs, p_rmsds))

#Extract identity information from needle comparison and associate with a comparison pair

identity_file = open('identities.csv', 'r')
ilines = identity_file.readlines()
identity_file.close()

unique_pdb_pair = []
seq_ids = []

for i in ilines:
	i = i.split(',')
	id1 = i[0]
	id2 = i[1]

	seqid = i[2][:-1]

	combined_id = id1 + "-" + id2
	reverse_id = id2 + "-" +id1

	if id1 != id2:
		if combined_id not in unique_pdb_pair:
			unique_pdb_pair.append(combined_id)
			seq_ids.append(seqid)


pair_perid = dict(zip(unique_pdb_pair, seq_ids))

list1 = []
list2 = []

for pair in filtered_pairs:
	pair = pair.split('-')

	id1 = pair[0]
	id2 = pair[1]

	pdb1 = pdb_dict[id1]
	pdb2 = pdb_dict[id2]

	new_pair = id1 + '-' + id2
	combined_pdb = pdb1 + '-' + pdb2
	r_pdb = pdb2 + '-' + pdb1

	for k, v in pair_perid.items():
		if k == combined_pdb:
			list1.append(new_pair)
			list2.append(v)
		elif k == r_pdb:
			list1.append(new_pair)
			list2.append(v)
		else:
			continue


new_perid = dict(zip(list1, list2))
print(new_perid)

#Extract PocketFEATURE and APoc information from bssim_seqsim.csv and associate with a PDB pair

bfile = open('bssim_seqsim.csv', 'r')
blines = bfile.readlines()
bfile.close()

pdb_pairs = []

for l in blines:
    l = l.split(',')

    pdb1 = l[1]
    pdb2 = l[2]

    combined_pdb = pdb1 + '-' + pdb2
    pdb_pairs.append(combined_pdb)

filtered_pdbpairs = []
reversed_pdbpairs = []

for pair in pdb_pairs:
    if pair not in reversed_pdbpairs:

        prot1_id = pair[0:4]
        prot2_id = pair[5:9]

        reverse = prot2_id + "-" + prot1_id
        reversed_pdbpairs.append(reverse)

        if pair not in filtered_pdbpairs:
            filtered_pdbpairs.append(pair)

a_pscore = []
f_psimilarity = []
f_stc = []


for pair in filtered_pairs:
	pair = pair.split('-')

	id1 = pair[0]
	id2 = pair[1]

	pdb_1 = pdb_dict[id1]
	pdb_2 = pdb_dict[id2]

	forward_pdb = pdb_1 + "-" + pdb_2
	reverse_pdb = pdb_2 + "-" + pdb_1

	if forward_pdb in filtered_pdbpairs:
		for l in blines:
			l = l.split(',')

			if l[1] == pdb_1 and l[2] == pdb_2:
				a_pscore.append(l[6][:-1])
				f_psimilarity.append(l[4])
				f_stc.append(l[5])

	elif reverse_pdb in filtered_pdbpairs:
		for l in blines:
			l = l.split(',')

			if l[1] == pdb_2 and l[2] == pdb_1:
				a_pscore.append(l[6][:-1])
				f_psimilarity.append(l[4])
				f_stc.append(l[5])

	else:
		a_pscore.append('N/A')
		f_psimilarity.append('N/A')
		f_stc.append('N/A')

pair_pscore = dict(zip(filtered_pairs, a_pscore))
pair_psimilarity = dict(zip(filtered_pairs, f_psimilarity))
pair_f_stc = dict(zip(filtered_pairs, f_stc))

# Create output CSV and write dictionary information to this file

out_file = open('database_input.csv','w')

for pair in filtered_pairs:
	try:
		sequence_id = new_perid[pair]
	except KeyError:
		sequence_id = "N/A"

	out_file.write(pair +
		   ',' + pair_uniprot_dict[pair] +
           ',' + pair_pdb_dict[pair] +
           ',' + pair_drug_dict[pair] +
           ',' + sequence_id +
           ',' + pair_rmsds[pair] +
           ',' + pair_zscores[pair] +
           ',' + pair_evalues[pair] +
           ',' + pair_pscore[pair] +
           ',' + pair_f_stc[pair] +
',' + pair_psimilarity[pair] + '\n')
