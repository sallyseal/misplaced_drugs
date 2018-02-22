var drug_names = ['Imatinib', 'Hexachlorophene', 'Icosapent', 'Vorinostat', 'Acarbose', 'Miglitol', 'Diclofenac', 'Suvorexant', 'Acamprosate', 'Orphenadrine', 'Tenocyclidine', 'Nimodipine', 'Cinnarizine', 'Verapamil', 'Mibefradil', 'Zonisamide', 'Marimastat', 'Dofetilide', 'Sapropterin', 'Dasatinib', 'Lapatinib', 'Afatinib', 'Imipenem', 'Agmatine', 'Gallium nitrate', 'Cefmetazole', 'Ertapenem', 'Cefpiramide', 'Ceftazidime', 'Cefoperazone', 'Cefoxitin', 'Ceftizoxime', 'Doripenem', 'Raloxifene', 'Sorafenib', 'Dabrafenib', 'Niflumic Acid', 'Mifepristone', 'Penciclovir', 'Valaciclovir', 'Urokinase', 'Clodronate', 'Dipivefrin', 'Nitrofural', 'Creatine', 'Zanamivir', 'Vinblastine', 'Podofilox', 'Colchicine', 'Norepinephrine', 'Timolol', 'Sotalol', 'Carteolol', 'Labetalol', 'Epinephrine', 'Alprenolol', 'Isoprenaline', 'Levobunolol', 'Metipranolol', 'Penbutolol', 'Ephedra', 'Celiprolol', 'Droxidopa', 'Regorafenib', 'Ipratropium bromide', 'Oxyphencyclimine', 'Procyclidine', 'Carbachol', 'Hyoscyamine', 'Methylscopolamine bromide', 'Tridihexethyl', 'Triflupromazine', 'Anisotropine Methylbromide', 'Atropine', 'Homatropine Methylbromide', 'Benzquinamide', 'Cryptenamine', 'Tolterodine', 'Oxybutynin', 'Pilocarpine', 'Doxepin', 'Flavoxate', 'Diphenidol', 'Dimetindene', 'Aclidinium', 'Umeclidinium', 'Metixene', 'Methysergide', 'Zolmitriptan', 'Chlorpromazine', 'Trazodone', 'Sumatriptan', 'Naratriptan', 'Nefazodone', 'Flibanserin', 'Cariprazine', 'Vortioxetine', 'Brexpiprazole', 'Sunitinib', 'Pazopanib', 'Mesalazine', 'Sulfasalazine', 'Meclofenamic acid', 'Balsalazide', 'Cloxacillin', 'Cefprozil', 'Piperacillin', 'Ampicillin', 'Cefalotin', 'Dicloxacillin', 'Cefotaxime', 'Cephalexin', 'Nafcillin', 'Oxacillin', 'Hetacillin', 'Cefadroxil', 'Amdinocillin', 'Meticillin', 'Cephalosporin C', 'Azidocillin', 'Cycloserine', 'Cerulenin', 'Dapsone', 'Alitretinoin', 'Griseofulvin', 'Paclitaxel', 'Docetaxel', 'Cevimeline', 'Succinylcholine', 'Buclizine', 'Ethopropazine', 'Mepenzolate', 'Irinotecan', 'Lucanthone', 'Daunorubicin', 'Levofloxacin', 'Sparfloxacin', 'Fleroxacin', 'Finafloxacin', 'Oseltamivir', 'Mycophenolic acid', 'Immune Globulin Human', 'Adapalene', 'Acitretin', 'Tretinoin', 'Tazarotene', 'Etretinate', 'Indomethacin', 'Temazepam', 'Butalbital', 'Topiramate', 'Etomidate', 'Talbutal', 'Pentobarbital', 'Meprobamate', 'Eszopiclone', 'Secobarbital', 'Metharbital', 'Adinazolam', 'Thiopental', 'Midazolam', 'Flurazepam', 'Isoflurane', 'Primidone', 'Halazepam', 'Diazepam', 'Oxazepam', 'Methylphenobarbital', 'Triazolam', 'Ethanol', 'Zaleplon', 'Methoxyflurane', 'Methyprylon', 'Thiamylal', 'Zopiclone', 'Flumazenil', 'Estazolam', 'Sevoflurane', 'Quinidine barbiturate', 'Amobarbital', 'Aprobarbital', 'Butethal', 'Heptabarbital', 'Hexobarbital', 'Glutethimide', 'Barbital', 'Barbituric acid derivative', 'Bromazepam', 'Clotiazepam', 'Fludiazepam', 'Ketazolam', 'Prazepam', 'Quazepam', 'Cinolazepam', 'Nitrazepam', 'Dalfampridine', 'Axitinib', 'Lenvatinib', 'Nintedanib', 'Brimonidine', 'Clonidine', 'Tizanidine', 'Yohimbine', 'Methamphetamine', 'Ecabet', 'Tiapride', 'Phentermine', 'Tranylcypromine', 'Phenelzine', 'Minaprine', 'Isocarboxazid', 'MMDA', 'Pramipexole', 'Lisuride', 'Apomorphine', 'Dopamine', 'Levodopa', 'Paliperidone', 'Rotigotine', 'Cyanocobalamin', 'Hydroxocobalamin', 'Dihomo-gamma-linolenic acid', 'Acetaminophen', 'Naproxen', 'Phenylbutazone', 'Suprofen', 'Salicylic acid', 'Acetylsalicylic acid', 'Oxaprozin', 'Ibuprofen', 'Lumiracoxib', 'Magnesium salicylate', 'Salsalate', 'Tiaprofenic acid', 'Lornoxicam', 'Tofacitinib', 'Botulinum Toxin Type B', 'Arsenic trioxide', 'Bosentan', 'Macitentan', 'Amphetamine', 'Theophylline', 'Dyphylline', 'Pentoxifylline', 'Enprofylline', 'Oxtriphylline', 'Ibudilast', 'Apremilast', 'Carfilzomib', 'Propofol', 'Fospropofol', 'Bexarotene', 'Adenosine', 'Ustekinumab', 'Riboflavin', 'Flunitrazepam', 'Aminophylline', 'Telmisartan', 'Pentolinium', 'Cladribine', 'Tramadol', 'Fenfluramine', 'Clomipramine', 'Butriptyline', 'Morphine', 'Codeine', 'Hydromorphone', 'Methadone', 'Oxycodone', 'Butorphanol', 'Dextropropoxyphene', 'Pentazocine', 'Naltrexone', 'Fentanyl', 'Loperamide', 'Nalbuphine', 'Buprenorphine', 'Hydrocodone', 'Naloxone', 'Dezocine', '3-Methylthiofentanyl', 'Etorphine', 'Carfentanil', 'Diprenorphine', '3-Methylfentanyl', 'Ketobemidone', 'Eluxadoline', 'Propoxyphene napsylate', 'Chlorprothixene', 'Captodiame', 'Trametinib', 'Niacin', 'Enflurane', 'Moxifloxacin', 'Grepafloxacin', 'Enoxacin', 'Pefloxacin', 'Ciprofloxacin', 'Trovafloxacin', 'Lomefloxacin', 'Norfloxacin', 'Gemifloxacin', 'Ofloxacin', 'Temafloxacin', 'Besifloxacin', 'Procaine', 'Itraconazole', 'Isradipine', 'Amlodipine', 'Nisoldipine', 'Nicardipine', 'Felodipine', 'Nitrendipine', 'Nifedipine', 'Cabazitaxel', 'Mebendazole', 'Gatifloxacin', 'Valproic Acid', 'Ifenprodil', 'Cilomilast', 'Glimepiride', 'Gliquidone', 'Felbamate', 'Memantine', 'Romidepsin', 'Levosimendan', 'Glyburide', 'Lidocaine', 'Cyclacillin', 'Menthol', 'Dextromethorphan', 'Hydroxychloroquine']

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
              b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}
