export interface GlossaryTerm {
  id: string;
  term: string;
  pronunciation?: string;
  definition: string;
  relatedProcedures: string[];
  category: 'anatomy' | 'procedure' | 'substance' | 'condition';
}

export const MEDICAL_GLOSSARY: GlossaryTerm[] = [
  {
    id: 'hyaluronicAcid',
    term: 'Hyaluronsyra',
    pronunciation: 'hya-lu-ron-sy-ra',
    definition:
      'Naturligt förekommande ämne i kroppen som binder fukt och ger vävnader volym. Används i filler-injektioner.',
    relatedProcedures: ['dermalFiller', 'lipFiller', 'jawlineContouring'],
    category: 'substance',
  },
  {
    id: 'botulinumToxin',
    term: 'Botulinumtoxin',
    pronunciation: 'bo-tu-li-num-tok-sin',
    definition:
      'Protein som tillfälligt blockerar nervimpulser till muskler, vilket minskar muskelaktivitet och rynkor.',
    relatedProcedures: ['botox', 'browLift'],
    category: 'substance',
  },
  {
    id: 'septorhinoplasty',
    term: 'Septorhinoplastik',
    pronunciation: 'sep-to-ri-no-plas-tik',
    definition:
      'Kirurgisk procedur som omformar näsans yttre struktur och/eller rättar till avvikande nässkiljevägg.',
    relatedProcedures: ['rhinoplasty'],
    category: 'procedure',
  },
  {
    id: 'genioplasty',
    term: 'Genioplastik',
    pronunciation: 'je-ni-o-plas-tik',
    definition:
      'Kirurgisk förändring av hakans form och projektion, antingen med implantat eller benblockning.',
    relatedProcedures: ['chinAugmentation'],
    category: 'procedure',
  },
  {
    id: 'malarAugmentation',
    term: 'Malart Augmentation',
    pronunciation: 'ma-lart aug-men-ta-shon',
    definition:
      'Förstärkning av kindbenens struktur med implantat eller filler för ökad prominens.',
    relatedProcedures: ['cheekAugmentation'],
    category: 'procedure',
  },
  {
    id: 'goldenRatio',
    term: 'Gyllene snittet',
    pronunciation: 'gyl-le-ne snit-tet',
    definition:
      'Matematiskt förhållande (1:1.618) som återfinns i estetiskt tilltalande ansiktsstrukturer. Används som referens i ansiktsanalys.',
    relatedProcedures: [],
    category: 'anatomy',
  },
  {
    id: 'nasofacialAngle',
    term: 'Nasolabialt Vinkel',
    pronunciation: 'na-so-la-bi-alt ving-kel',
    definition:
      'Vinkeln mellan näsans underdel och läppens ovandel. Idealt 90–95° för kvinnor, 90° för män.',
    relatedProcedures: ['rhinoplasty'],
    category: 'anatomy',
  },
  {
    id: 'ptosis',
    term: 'Ptosis',
    pronunciation: 'to-sis',
    definition:
      'Hängande ögonlock, kan uppstå som biverkning vid felaktigt placerad botulinumtoxin-injektion. Oftast övergående.',
    relatedProcedures: ['botox', 'browLift'],
    category: 'condition',
  },
  {
    id: 'vascularOcclusion',
    term: 'Vaskulär Ocklusion',
    pronunciation: 'vas-ku-lär ok-lu-sion',
    definition:
      'Allvarlig komplikation där filler blockerar ett blodkärl. Kräver omedelbar medicinsk behandling med hyaluronidas.',
    relatedProcedures: ['dermalFiller', 'lipFiller'],
    category: 'condition',
  },
  {
    id: 'masseter',
    term: 'Masseter',
    pronunciation: 'mas-se-ter',
    definition:
      'Tuggmuskeln längs käklinjen. Kan behandlas med botox för att smala av käkens nedre del och skapa ett V-format ansikte.',
    relatedProcedures: ['botox', 'jawlineContouring'],
    category: 'anatomy',
  },
  {
    id: 'cannula',
    term: 'Kanyl',
    pronunciation: 'ka-nyl',
    definition:
      'Trubbig nål som används vid filler-injektioner för lägre risk för kärlskada jämfört med skarp nål.',
    relatedProcedures: ['dermalFiller', 'lipFiller', 'jawlineContouring'],
    category: 'procedure',
  },
  {
    id: 'hyaluronidase',
    term: 'Hyaluronidas',
    pronunciation: 'hya-lu-ro-ni-das',
    definition:
      'Enzym som löser upp hyaluronsyrafiller. Används för att korrigera felaktigt placerad filler eller vid komplikationer.',
    relatedProcedures: ['dermalFiller', 'lipFiller'],
    category: 'substance',
  },
  {
    id: 'symmetry',
    term: 'Facial Symmetri',
    pronunciation: 'fa-ci-al sy-me-tri',
    definition:
      'Graden av likhet mellan ansiktets vänstra och högra sida. Hög symmetri associeras med skönhetsideal men inget ansikte är perfekt symmetriskt.',
    relatedProcedures: ['botox', 'dermalFiller'],
    category: 'anatomy',
  },
];

export const GLOSSARY_CATEGORIES = {
  anatomy: 'Anatomi',
  procedure: 'Procedur',
  substance: 'Substans',
  condition: 'Tillstånd',
};
