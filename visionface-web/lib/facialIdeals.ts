/**
 * facialIdeals.ts
 * Ethnic-specific facial beauty standards based on cephalometric research
 * (Farkas et al., Powell & Humphreys, Goode, Sim et al., Porter & Olson, Gu et al.)
 */

export type Ethnicity =
  | 'caucasian'
  | 'eastAsian'
  | 'southAsian'
  | 'african'
  | 'middleEastern'
  | 'hispanic';

export type Gender = 'male' | 'female';

export interface Range {
  min: number;
  max: number;
  ideal: number;
}

export interface GenderedRange {
  male: Range;
  female: Range;
}

export interface EthnicIdealValues {
  /** Face height / face width — golden ratio target */
  facialIndex: Range;
  /** Max % deviation from equal thirds */
  facialThirdsDeviation: Range;
  /** Interpupillary distance / bizygomatic width */
  ipdToFaceWidth: Range;
  /** Upper lip height / lower lip height */
  upperToLowerLipRatio: Range;
  /** Lip width / alar (nose) width */
  lipWidthToNoseWidth: Range;
  /** Nose tip projection / nasal length (Goode ratio) */
  noseGoodeRatio: Range;
  /** Jaw width / cheekbone width */
  bigonialToBizygomatic: GenderedRange;
  /** Facial width-to-height ratio */
  fWHR: GenderedRange;
  /** Gonial (jawline) angle in degrees */
  gonialAngle: GenderedRange;
  /** Nasolabial angle in degrees */
  nasolabialAngle: GenderedRange;
}

export interface EthnicProfile {
  ethnicity: Ethnicity;
  label: string;
  ideals: EthnicIdealValues;
  commonProcedures: string[];
}

export const ETHNIC_PROFILES: Record<Ethnicity, EthnicProfile> = {
  caucasian: {
    ethnicity: 'caucasian',
    label: 'Europeisk / Kaukasisk',
    ideals: {
      facialIndex: { min: 1.55, max: 1.68, ideal: 1.618 },
      facialThirdsDeviation: { min: 0, max: 5, ideal: 0 },
      ipdToFaceWidth: { min: 0.42, max: 0.50, ideal: 0.46 },
      upperToLowerLipRatio: { min: 0.55, max: 0.70, ideal: 0.625 },
      lipWidthToNoseWidth: { min: 1.5, max: 1.7, ideal: 1.618 },
      noseGoodeRatio: { min: 0.55, max: 0.60, ideal: 0.57 },
      bigonialToBizygomatic: {
        male: { min: 0.78, max: 0.85, ideal: 0.82 },
        female: { min: 0.72, max: 0.78, ideal: 0.75 },
      },
      fWHR: {
        male: { min: 1.75, max: 1.90, ideal: 1.82 },
        female: { min: 1.80, max: 2.00, ideal: 1.90 },
      },
      gonialAngle: {
        male: { min: 110, max: 120, ideal: 115 },
        female: { min: 120, max: 130, ideal: 125 },
      },
      nasolabialAngle: {
        male: { min: 90, max: 95, ideal: 93 },
        female: { min: 95, max: 110, ideal: 103 },
      },
    },
    commonProcedures: ['rhinoplasty_dorsal_hump', 'blepharoplasty', 'chin_augmentation', 'lip_filler'],
  },

  eastAsian: {
    ethnicity: 'eastAsian',
    label: 'Östasiatisk',
    ideals: {
      facialIndex: { min: 1.45, max: 1.60, ideal: 1.52 },
      facialThirdsDeviation: { min: 0, max: 7, ideal: 0 },
      ipdToFaceWidth: { min: 0.40, max: 0.47, ideal: 0.44 },
      upperToLowerLipRatio: { min: 0.60, max: 0.75, ideal: 0.67 },
      lipWidthToNoseWidth: { min: 1.3, max: 1.6, ideal: 1.45 },
      noseGoodeRatio: { min: 0.45, max: 0.55, ideal: 0.50 },
      bigonialToBizygomatic: {
        male: { min: 0.78, max: 0.88, ideal: 0.83 },
        female: { min: 0.70, max: 0.78, ideal: 0.73 },
      },
      fWHR: {
        male: { min: 1.70, max: 1.88, ideal: 1.78 },
        female: { min: 1.75, max: 1.95, ideal: 1.85 },
      },
      gonialAngle: {
        male: { min: 115, max: 125, ideal: 118 },
        female: { min: 120, max: 130, ideal: 125 },
      },
      nasolabialAngle: {
        male: { min: 85, max: 100, ideal: 92 },
        female: { min: 90, max: 105, ideal: 97 },
      },
    },
    commonProcedures: ['augmentation_rhinoplasty', 'double_eyelid_surgery', 'v-line_jaw_reduction', 'chin_augmentation'],
  },

  southAsian: {
    ethnicity: 'southAsian',
    label: 'Sydasiatisk',
    ideals: {
      facialIndex: { min: 1.50, max: 1.65, ideal: 1.57 },
      facialThirdsDeviation: { min: 0, max: 6, ideal: 0 },
      ipdToFaceWidth: { min: 0.42, max: 0.48, ideal: 0.45 },
      upperToLowerLipRatio: { min: 0.53, max: 0.67, ideal: 0.60 },
      lipWidthToNoseWidth: { min: 1.3, max: 1.6, ideal: 1.50 },
      noseGoodeRatio: { min: 0.50, max: 0.58, ideal: 0.54 },
      bigonialToBizygomatic: {
        male: { min: 0.78, max: 0.85, ideal: 0.82 },
        female: { min: 0.73, max: 0.80, ideal: 0.76 },
      },
      fWHR: {
        male: { min: 1.73, max: 1.88, ideal: 1.80 },
        female: { min: 1.78, max: 1.95, ideal: 1.87 },
      },
      gonialAngle: {
        male: { min: 115, max: 125, ideal: 118 },
        female: { min: 120, max: 130, ideal: 125 },
      },
      nasolabialAngle: {
        male: { min: 88, max: 100, ideal: 93 },
        female: { min: 93, max: 105, ideal: 98 },
      },
    },
    commonProcedures: ['tip_rhinoplasty', 'alar_reduction', 'chin_augmentation', 'blepharoplasty'],
  },

  african: {
    ethnicity: 'african',
    label: 'Afrikansk',
    ideals: {
      facialIndex: { min: 1.45, max: 1.58, ideal: 1.50 },
      facialThirdsDeviation: { min: 0, max: 7, ideal: 0 },
      ipdToFaceWidth: { min: 0.42, max: 0.50, ideal: 0.46 },
      upperToLowerLipRatio: { min: 0.65, max: 0.85, ideal: 0.75 },
      lipWidthToNoseWidth: { min: 1.2, max: 1.5, ideal: 1.35 },
      noseGoodeRatio: { min: 0.40, max: 0.50, ideal: 0.45 },
      bigonialToBizygomatic: {
        male: { min: 0.80, max: 0.90, ideal: 0.85 },
        female: { min: 0.76, max: 0.85, ideal: 0.80 },
      },
      fWHR: {
        male: { min: 1.70, max: 1.85, ideal: 1.78 },
        female: { min: 1.75, max: 1.92, ideal: 1.83 },
      },
      gonialAngle: {
        male: { min: 115, max: 125, ideal: 120 },
        female: { min: 120, max: 130, ideal: 125 },
      },
      nasolabialAngle: {
        male: { min: 80, max: 92, ideal: 85 },
        female: { min: 83, max: 95, ideal: 90 },
      },
    },
    commonProcedures: ['tip_rhinoplasty', 'alar_base_reduction', 'chin_augmentation', 'cheek_augmentation'],
  },

  middleEastern: {
    ethnicity: 'middleEastern',
    label: 'Mellanöstern',
    ideals: {
      facialIndex: { min: 1.55, max: 1.68, ideal: 1.60 },
      facialThirdsDeviation: { min: 0, max: 5, ideal: 0 },
      ipdToFaceWidth: { min: 0.42, max: 0.48, ideal: 0.45 },
      upperToLowerLipRatio: { min: 0.55, max: 0.67, ideal: 0.60 },
      lipWidthToNoseWidth: { min: 1.4, max: 1.7, ideal: 1.55 },
      noseGoodeRatio: { min: 0.55, max: 0.65, ideal: 0.60 },
      bigonialToBizygomatic: {
        male: { min: 0.78, max: 0.86, ideal: 0.82 },
        female: { min: 0.72, max: 0.80, ideal: 0.76 },
      },
      fWHR: {
        male: { min: 1.75, max: 1.90, ideal: 1.82 },
        female: { min: 1.80, max: 2.00, ideal: 1.90 },
      },
      gonialAngle: {
        male: { min: 112, max: 122, ideal: 117 },
        female: { min: 118, max: 128, ideal: 123 },
      },
      nasolabialAngle: {
        male: { min: 85, max: 95, ideal: 90 },
        female: { min: 90, max: 100, ideal: 95 },
      },
    },
    commonProcedures: ['rhinoplasty_dorsal_hump_reduction', 'rhinoplasty_tip_rotation', 'chin_reduction', 'cheek_filler'],
  },

  hispanic: {
    ethnicity: 'hispanic',
    label: 'Latinamerikansk',
    ideals: {
      facialIndex: { min: 1.50, max: 1.65, ideal: 1.57 },
      facialThirdsDeviation: { min: 0, max: 6, ideal: 0 },
      ipdToFaceWidth: { min: 0.42, max: 0.48, ideal: 0.45 },
      upperToLowerLipRatio: { min: 0.55, max: 0.70, ideal: 0.625 },
      lipWidthToNoseWidth: { min: 1.3, max: 1.6, ideal: 1.50 },
      noseGoodeRatio: { min: 0.50, max: 0.58, ideal: 0.54 },
      bigonialToBizygomatic: {
        male: { min: 0.78, max: 0.86, ideal: 0.82 },
        female: { min: 0.73, max: 0.80, ideal: 0.76 },
      },
      fWHR: {
        male: { min: 1.73, max: 1.88, ideal: 1.80 },
        female: { min: 1.78, max: 1.95, ideal: 1.87 },
      },
      gonialAngle: {
        male: { min: 115, max: 125, ideal: 118 },
        female: { min: 120, max: 130, ideal: 125 },
      },
      nasolabialAngle: {
        male: { min: 88, max: 100, ideal: 93 },
        female: { min: 93, max: 105, ideal: 98 },
      },
    },
    commonProcedures: ['rhinoplasty_tip_and_dorsum', 'jawline_contouring', 'lip_augmentation', 'cheek_filler'],
  },
};

export interface Recommendation {
  procedure: string;
  label: string;
  description: string;
  zone: 'forehead' | 'eyes' | 'nose' | 'lips' | 'jaw' | 'symmetry' | 'cheeks';
  triggerMetric: string;
  condition: 'above_range' | 'below_range';
  severity: 'mild' | 'moderate' | 'significant';
}

export const PROCEDURE_LABELS: Record<string, { label: string; description: string; zone: Recommendation['zone'] }> = {
  rhinoplasty_straighten: {
    label: 'Näskorrigering',
    description: 'Räta upp näsryggen för bättre symmetri och profil',
    zone: 'nose',
  },
  rhinoplasty_tip_rotation: {
    label: 'Nässpets rotation',
    description: 'Rotera nässpetsen uppåt för öppnare nasolabial vinkel',
    zone: 'nose',
  },
  rhinoplasty_tip_refinement: {
    label: 'Nässpets förfining',
    description: 'Förfina nässpetsens projektion för bättre proportioner',
    zone: 'nose',
  },
  alar_base_reduction: {
    label: 'Näsvingereduktion',
    description: 'Minska näsvingarna för bättre proportion mot läppbredd',
    zone: 'nose',
  },
  augmentation_rhinoplasty: {
    label: 'Näsförhöjning',
    description: 'Förhöj näsryggen med implantat eller brosk',
    zone: 'nose',
  },
  thread_lift_jawline: {
    label: 'Trådlyft käklinje',
    description: 'Definiera käklinjen med resorberbara trådar',
    zone: 'jaw',
  },
  jaw_reduction: {
    label: 'Käkreduktion',
    description: 'Minska käkbredden för slankare ansiktsprofil',
    zone: 'jaw',
  },
  buccal_fat_removal: {
    label: 'Buccal fettborttagning',
    description: 'Ta bort kindpåsar för markerade kindhålor',
    zone: 'jaw',
  },
  chin_augmentation: {
    label: 'Hakförstoring',
    description: 'Förstärk hakprojektionen med implantat eller genioplastik',
    zone: 'jaw',
  },
  chin_reduction: {
    label: 'Hakreduktion',
    description: 'Minska hakprojektionen för balanserad profil',
    zone: 'jaw',
  },
  lip_augmentation: {
    label: 'Läppförstoring',
    description: 'Öka läppvolym med filler för bättre proportioner',
    zone: 'lips',
  },
  lip_reduction: {
    label: 'Läppreduktion',
    description: 'Minska läppvolym för proportionell balans',
    zone: 'lips',
  },
  brow_lift: {
    label: 'Ögonbrynslyft',
    description: 'Lyft ögonbrynen till idealposition ovanför orbitalranden',
    zone: 'eyes',
  },
  blepharoplasty: {
    label: 'Ögonlockskirurgi',
    description: 'Korrigera hängande ögonlock för fräschare utseende',
    zone: 'eyes',
  },
  cheek_filler: {
    label: 'Kindfiller',
    description: 'Volymökning av kindben för bättre midansiktsprojektion',
    zone: 'cheeks',
  },
  cheekbone_reduction: {
    label: 'Kindbenreduktion',
    description: 'Minska kindbenens bredd för smalare mittansikte',
    zone: 'cheeks',
  },
  forehead_contouring: {
    label: 'Pannakonturering',
    description: 'Korrigera pannans proportioner i förhållande till ansiktshöjden',
    zone: 'forehead',
  },
  asymmetry_correction: {
    label: 'Symmetrikorrigering',
    description: 'Korrigera asymmetri med filler eller fetttransplantation',
    zone: 'symmetry',
  },
};

export function getRecommendations(
  scores: {
    facialIndex: number;
    foreheadRatio: number;
    eyeSpacing: number;
    noseProjection: number;
    lipRatio: number;
    jawRatio: number;
    symmetry: number;
    cheekboneRatio: number;
  },
  ethnicity: Ethnicity,
  gender: Gender
): Recommendation[] {
  const profile = ETHNIC_PROFILES[ethnicity];
  const ideals = profile.ideals;
  const recs: Recommendation[] = [];

  const getSeverity = (value: number, range: Range): 'mild' | 'moderate' | 'significant' => {
    const rangeWidth = range.max - range.min;
    const dist = value < range.min
      ? (range.min - value) / rangeWidth
      : (value - range.max) / rangeWidth;
    if (dist < 0.3) return 'mild';
    if (dist < 0.7) return 'moderate';
    return 'significant';
  };

  // Nose projection
  if (scores.noseProjection < ideals.noseGoodeRatio.min) {
    const proc = PROCEDURE_LABELS['augmentation_rhinoplasty'];
    recs.push({
      procedure: 'augmentation_rhinoplasty',
      ...proc,
      triggerMetric: 'noseGoodeRatio',
      condition: 'below_range',
      severity: getSeverity(scores.noseProjection, ideals.noseGoodeRatio),
    });
  } else if (scores.noseProjection > ideals.noseGoodeRatio.max) {
    const proc = PROCEDURE_LABELS['rhinoplasty_tip_refinement'];
    recs.push({
      procedure: 'rhinoplasty_tip_refinement',
      ...proc,
      triggerMetric: 'noseGoodeRatio',
      condition: 'above_range',
      severity: getSeverity(scores.noseProjection, ideals.noseGoodeRatio),
    });
  }

  // Lip proportions
  if (scores.lipRatio < ideals.upperToLowerLipRatio.min) {
    const proc = PROCEDURE_LABELS['lip_augmentation'];
    recs.push({
      procedure: 'lip_augmentation',
      ...proc,
      triggerMetric: 'upperToLowerLipRatio',
      condition: 'below_range',
      severity: getSeverity(scores.lipRatio, ideals.upperToLowerLipRatio),
    });
  } else if (scores.lipRatio > ideals.upperToLowerLipRatio.max) {
    const proc = PROCEDURE_LABELS['lip_reduction'];
    recs.push({
      procedure: 'lip_reduction',
      ...proc,
      triggerMetric: 'upperToLowerLipRatio',
      condition: 'above_range',
      severity: getSeverity(scores.lipRatio, ideals.upperToLowerLipRatio),
    });
  }

  // Jaw ratio
  const jawRange = ideals.bigonialToBizygomatic[gender];
  if (scores.jawRatio > jawRange.max) {
    const proc = PROCEDURE_LABELS['jaw_reduction'];
    recs.push({
      procedure: 'jaw_reduction',
      ...proc,
      triggerMetric: 'bigonialToBizygomatic',
      condition: 'above_range',
      severity: getSeverity(scores.jawRatio, jawRange),
    });
  } else if (scores.jawRatio < jawRange.min) {
    const proc = PROCEDURE_LABELS['thread_lift_jawline'];
    recs.push({
      procedure: 'thread_lift_jawline',
      ...proc,
      triggerMetric: 'bigonialToBizygomatic',
      condition: 'below_range',
      severity: getSeverity(scores.jawRatio, jawRange),
    });
  }

  // Facial index (height/width)
  if (scores.facialIndex < ideals.facialIndex.min) {
    const proc = PROCEDURE_LABELS['forehead_contouring'];
    recs.push({
      procedure: 'forehead_contouring',
      ...proc,
      triggerMetric: 'facialIndex',
      condition: 'below_range',
      severity: getSeverity(scores.facialIndex, ideals.facialIndex),
    });
  }

  // Cheekbone ratio (using fWHR)
  const fwhrRange = ideals.fWHR[gender];
  if (scores.cheekboneRatio < fwhrRange.min) {
    const proc = PROCEDURE_LABELS['cheek_filler'];
    recs.push({
      procedure: 'cheek_filler',
      ...proc,
      triggerMetric: 'fWHR',
      condition: 'below_range',
      severity: getSeverity(scores.cheekboneRatio, fwhrRange),
    });
  } else if (scores.cheekboneRatio > fwhrRange.max) {
    const proc = PROCEDURE_LABELS['cheekbone_reduction'];
    recs.push({
      procedure: 'cheekbone_reduction',
      ...proc,
      triggerMetric: 'fWHR',
      condition: 'above_range',
      severity: getSeverity(scores.cheekboneRatio, fwhrRange),
    });
  }

  // Eye spacing
  if (scores.eyeSpacing < ideals.ipdToFaceWidth.min || scores.eyeSpacing > ideals.ipdToFaceWidth.max) {
    const proc = PROCEDURE_LABELS['brow_lift'];
    recs.push({
      procedure: 'brow_lift',
      ...proc,
      triggerMetric: 'ipdToFaceWidth',
      condition: scores.eyeSpacing < ideals.ipdToFaceWidth.min ? 'below_range' : 'above_range',
      severity: getSeverity(scores.eyeSpacing, ideals.ipdToFaceWidth),
    });
  }

  // Symmetry
  if (scores.symmetry > 3) {
    const proc = PROCEDURE_LABELS['asymmetry_correction'];
    recs.push({
      procedure: 'asymmetry_correction',
      ...proc,
      triggerMetric: 'symmetry',
      condition: 'above_range',
      severity: scores.symmetry > 6 ? 'significant' : scores.symmetry > 4 ? 'moderate' : 'mild',
    });
  }

  return recs;
}
