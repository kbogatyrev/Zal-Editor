export const subParadigmToHash = new Map<string, string>();
subParadigmToHash.set('LongAdj', 'AdjL');
subParadigmToHash.set('ShortAdj', 'AdjS');
subParadigmToHash.set('PronounAdj', 'PronAdj');
subParadigmToHash.set('NumeralAdj', 'NumAdj');
subParadigmToHash.set('PartPresAct', 'PPresA');
subParadigmToHash.set('PartPastAct', 'PPastA');
subParadigmToHash.set('PartPresPassLong', 'PPresPL');
subParadigmToHash.set('PartPresPassShort', 'PPresPS');
subParadigmToHash.set('PartPastPassLong', 'PPastPL');
subParadigmToHash.set('PartPastPassShort', 'PPastPS');

export const caseToDisplay = new Map<string, string>();
caseToDisplay.set('Nominative', 'И');
caseToDisplay.set('Accusative', 'В');
caseToDisplay.set('Dative', 'Д');
caseToDisplay.set('Genitive', 'Р');
caseToDisplay.set('Prepositional', 'П');
caseToDisplay.set('Instrumental', 'Т');
caseToDisplay.set('Locative', 'П2');
caseToDisplay.set('Partitive', 'Р2');

export const displayToHash = new Map<string, string>();
displayToHash.set('И', 'N');
displayToHash.set('В', 'A');
displayToHash.set('В (одуш.)', 'A');
displayToHash.set('В (неод.)', 'A');
displayToHash.set('Д', 'D');
displayToHash.set('Р', 'G');
displayToHash.set('П', 'P');
displayToHash.set('Т', 'I');
displayToHash.set('П2', 'L');
displayToHash.set('м', 'M');
displayToHash.set('ж', 'F');
displayToHash.set('с', 'N');
displayToHash.set('ед.', 'Sg');
displayToHash.set('мн.', 'Pl');
displayToHash.set('одуш.', 'Anim');
displayToHash.set('неод.', 'Inanim');

export const caseToHash = new Map<string, string>();
caseToHash.set('Nominative', 'N');
caseToHash.set('Accusative', 'A');
caseToHash.set('Dative', 'D');
caseToHash.set('Genitive', 'G');
caseToHash.set('Prepositional', 'P');
caseToHash.set('Instrumental', 'I');
caseToHash.set('Locative', 'P2');
caseToHash.set('Partitive', 'G2');

export const numberToDisplay = new Map<string, string>();
numberToDisplay.set('Singular', 'ед.');
numberToDisplay.set('Plural', 'мн.');

export const numberToHash = new Map<string, string>();
numberToHash.set('Singular', 'Sg');
numberToHash.set('Plural', 'Pl');

export const genderToDisplay = new Map<string, string>();
genderToDisplay.set('Masculine', 'м');
genderToDisplay.set('Feminine', 'ж');
genderToDisplay.set('Neuter', 'с');

export const genderToHash = new Map<string, string>();
genderToHash.set('Masculine', 'M');
genderToHash.set('Feminine', 'F');
genderToHash.set('Neuter', 'N');

// Some numerals only
export const genderToHash2 = new Map<string, string>();
genderToHash2.set('Masculine', 'м, с');
genderToHash2.set('Feminine', 'ж');

export const animacyToHash = new Map<string, string>();
animacyToHash.set('Animate', 'одуш.');
animacyToHash.set('Feminine', 'неод.');

export const presentTenseToPerson = new Map<string, string>();
presentTenseToPerson.set('1stPerson', '1');
presentTenseToPerson.set('2ndPerson', '2');
presentTenseToPerson.set('3rdPerson', '3');

/*
export const AdjHashes = [
  "AdjL_M_Sg_N",
  "AdjL_M_Sg_A_Inanim",
  "AdjL_M_Sg_A_Anim",
  "AdjL_M_Sg_G",
  "AdjL_M_Sg_P",
  "AdjL_M_Sg_D",
  "AdjL_M_Sg_I",
  "AdjL_F_Sg_N",
  "AdjL_F_Sg_A",
  "AdjL_F_Sg_G",
  "AdjL_F_Sg_P",
  "AdjL_F_Sg_D",
  "AdjL_F_Sg_I",
  "AdjL_N_Sg_N",
  "AdjL_N_Sg_A",
  "AdjL_N_Sg_G",
  "AdjL_N_Sg_P",
  "AdjL_N_Sg_D",
  "AdjL_N_Sg_I",
  "AdjL_Pl_N",
  "AdjL_Pl_A_Inanim",
  "AdjL_Pl_A_Anim",
  "AdjL_Pl_G",
  "AdjL_Pl_P",
  "AdjL_Pl_D",
  "AdjL_Pl_I",
  "AdjS_M",
  "AdjS_F",
  "AdjS_N",
  "AdjS_Pl",
  "AdjComp",
];
*/