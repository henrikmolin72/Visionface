import { Procedure } from '../types/facial';

export const PROCEDURES: Record<string, Procedure> = {
  dermalFiller: {
    id: 'dermalFiller',
    name: 'Dermal Filler',
    medicalName: 'Hyaluronsyrainjektion',
    category: 'filler',
    areas: ['läppar', 'käklinje', 'kindben', 'näsa', 'haka'],
    description:
      'Injicering av hyaluronsyra för att bygga volym, skulptera konturer och fylla ut linjer.',
    expectedResult:
      'Omedelbar volymökning och förbättrade proportioner. Naturligt utseende vid rätt dos.',
    risks: [
      { label: 'Svullnad och blåmärken (1–7 dagar)', level: 'low' },
      { label: 'Klumpar eller ojämnheter', level: 'moderate' },
      { label: 'Vaskulär ocklusion (sällsynt)', level: 'high' },
      { label: 'Infektion', level: 'moderate' },
    ],
    recoveryDays: 3,
    durationMonths: 9,
    costRangeSEK: [2500, 6000],
    successRate: 0.94,
  },
  botox: {
    id: 'botox',
    name: 'Botulinumtoxin (Botox)',
    medicalName: 'Botulinumtoxin typ A-injektion',
    category: 'toxin',
    areas: ['panna', 'ögonbryn', 'käklinje', 'hals'],
    description:
      'Muskelavslappnande injektion som reducerar dynamiska rynkor och kan skulptera käklinjen.',
    expectedResult:
      'Slätare hy, lyft av ögonbryn, smalare käklinje vid masseterbehandling.',
    risks: [
      { label: 'Svullnad vid injektionsstället', level: 'low' },
      { label: 'Hängande ögonlock (ptosis, sällsynt)', level: 'moderate' },
      { label: 'Huvudvärk (övergående)', level: 'low' },
    ],
    recoveryDays: 1,
    durationMonths: 4,
    costRangeSEK: [2000, 5000],
    successRate: 0.96,
  },
  rhinoplasty: {
    id: 'rhinoplasty',
    name: 'Näsplastik',
    medicalName: 'Septorhinoplastik',
    category: 'surgical',
    areas: ['näsa'],
    description:
      'Kirurgisk omformning av näsan för att förbättra proportioner, symmetri och/eller andningsfunktion.',
    expectedResult:
      'Permanent förändring av näsform. Slutresultat synligt efter 6–12 månader när svullnad lagt sig.',
    risks: [
      { label: 'Svullnad och blåmärken (2–4 veckor)', level: 'low' },
      { label: 'Asymmetri eller revidering behövs', level: 'moderate' },
      { label: 'Andningsproblem (sällsynt)', level: 'moderate' },
      { label: 'Infektion', level: 'moderate' },
      { label: 'Narkosrisker', level: 'low' },
    ],
    recoveryDays: 14,
    durationMonths: null,
    costRangeSEK: [40000, 80000],
    successRate: 0.88,
  },
  chinAugmentation: {
    id: 'chinAugmentation',
    name: 'Hakförstärkning',
    medicalName: 'Genioplastik / Hakimplantat',
    category: 'surgical',
    areas: ['haka', 'käklinje'],
    description:
      'Kirurgisk placering av implantat eller benblockning för att förbättra hakans projektion och käklinjen.',
    expectedResult:
      'Starkare hakkontur och bättre ansiktsbalans. Permanent resultat.',
    risks: [
      { label: 'Nervskada (domningar i haka)', level: 'moderate' },
      { label: 'Implantatförflyttning', level: 'moderate' },
      { label: 'Infektion', level: 'moderate' },
      { label: 'Asymmetri', level: 'low' },
    ],
    recoveryDays: 7,
    durationMonths: null,
    costRangeSEK: [25000, 50000],
    successRate: 0.93,
  },
  cheekAugmentation: {
    id: 'cheekAugmentation',
    name: 'Kindförstärkning',
    medicalName: 'Malart Augmentation',
    category: 'surgical',
    areas: ['kindben'],
    description:
      'Implantat eller filler för att lyfta och definiera kindbenens struktur.',
    expectedResult:
      'Mer framträdande kindben och ungdomligare ansiktskontur.',
    risks: [
      { label: 'Svullnad (2–6 veckor)', level: 'low' },
      { label: 'Implantatförflyttning', level: 'moderate' },
      { label: 'Nervpåverkan', level: 'moderate' },
    ],
    recoveryDays: 10,
    durationMonths: null,
    costRangeSEK: [30000, 60000],
    successRate: 0.91,
  },
  lipFiller: {
    id: 'lipFiller',
    name: 'Läppfiller',
    medicalName: 'Labialt Hyaluronsyrainjektion',
    category: 'filler',
    areas: ['läppar'],
    description:
      'Riktad hyaluronsyrainjektion för att öka volym, definiera konturer och förbättra läpparnas form.',
    expectedResult:
      'Fylligare läppar med naturlig form. Omedelbart synbart resultat.',
    risks: [
      { label: 'Svullnad (3–5 dagar)', level: 'low' },
      { label: 'Blåmärken', level: 'low' },
      { label: 'Klumpar (löses med massage)', level: 'low' },
      { label: 'Vaskulär ocklusion (sällsynt)', level: 'high' },
    ],
    recoveryDays: 2,
    durationMonths: 8,
    costRangeSEK: [2500, 4500],
    successRate: 0.95,
  },
  jawlineContouring: {
    id: 'jawlineContouring',
    name: 'Käklinjekonturering',
    medicalName: 'Mandibulär Augmentation / Fillerbehandling',
    category: 'filler',
    areas: ['käklinje', 'haka'],
    description:
      'Filler eller botox längs käklinjen för att skapa en skarpare, mer definierad profil.',
    expectedResult:
      'Tydligare käklinje och förbättrad ansiktsbalans utan kirurgi.',
    risks: [
      { label: 'Svullnad (2–5 dagar)', level: 'low' },
      { label: 'Blåmärken', level: 'low' },
      { label: 'Ojämnheter', level: 'moderate' },
    ],
    recoveryDays: 2,
    durationMonths: 10,
    costRangeSEK: [4000, 8000],
    successRate: 0.93,
  },
  browLift: {
    id: 'browLift',
    name: 'Ögonbrynlyft',
    medicalName: 'Endobrow Lift / Botox Brow Lift',
    category: 'toxin',
    areas: ['ögonbryn', 'panna'],
    description:
      'Botox eller kirurgisk metod för att lyfta hängande ögonbryn och öppna upp blicken.',
    expectedResult:
      'Mer vaken och ungdomlig blick. Reducerade pannlinjer.',
    risks: [
      { label: 'Asymmetriska ögonbryn (övergående)', level: 'low' },
      { label: 'Hängande ögonlock (sällsynt)', level: 'moderate' },
    ],
    recoveryDays: 1,
    durationMonths: 4,
    costRangeSEK: [1500, 3500],
    successRate: 0.95,
  },
};

export const PROCEDURE_LIST = Object.values(PROCEDURES);
