import { Ethnicity } from '../types/facial';

export interface FacialStandard {
  faceWidthHeightRatio: number;
  eyeSpacingRatio: number;
  noseWidthRatio: number;
  jawlineScore: number;
  goldenRatioScore: number;
  chinProjection: number;
  cheekboneProminence: number;
  description: string;
}

export const FACIAL_STANDARDS: Record<Ethnicity, FacialStandard> = {
  european: {
    faceWidthHeightRatio: 1.32,
    eyeSpacingRatio: 0.46,
    noseWidthRatio: 0.28,
    jawlineScore: 82,
    goldenRatioScore: 85,
    chinProjection: 12,
    cheekboneProminence: 72,
    description: 'Europeiska proportioner med markerade käklinjer och hög näsbrygga.',
  },
  asian: {
    faceWidthHeightRatio: 1.25,
    eyeSpacingRatio: 0.44,
    noseWidthRatio: 0.30,
    jawlineScore: 78,
    goldenRatioScore: 83,
    chinProjection: 10,
    cheekboneProminence: 76,
    description: 'Asiatiska proportioner med framträdande kindben och jämnare drag.',
  },
  african: {
    faceWidthHeightRatio: 1.35,
    eyeSpacingRatio: 0.48,
    noseWidthRatio: 0.34,
    jawlineScore: 85,
    goldenRatioScore: 82,
    chinProjection: 14,
    cheekboneProminence: 80,
    description: 'Afrikanska proportioner med bredare ansiktsstruktur och markerade drag.',
  },
  middleEastern: {
    faceWidthHeightRatio: 1.31,
    eyeSpacingRatio: 0.45,
    noseWidthRatio: 0.29,
    jawlineScore: 83,
    goldenRatioScore: 84,
    chinProjection: 13,
    cheekboneProminence: 74,
    description: 'Mellanösternproportioner med distinkt näsform och stark käklinje.',
  },
  latinAmerican: {
    faceWidthHeightRatio: 1.30,
    eyeSpacingRatio: 0.46,
    noseWidthRatio: 0.31,
    jawlineScore: 81,
    goldenRatioScore: 83,
    chinProjection: 12,
    cheekboneProminence: 75,
    description: 'Latinamerikanska proportioner med varierade drag och expressiva konturer.',
  },
};

export const ETHNICITY_LABELS: Record<Ethnicity, string> = {
  european: 'Europeisk',
  asian: 'Asiatisk',
  african: 'Afrikansk',
  middleEastern: 'Mellanöstern',
  latinAmerican: 'Latinamerikansk',
};

/** Returns a 0–100 gap score for each measurement (100 = perfect match). */
export function scoreAgainstStandard(
  value: number,
  target: number,
  tolerance: number = 0.15,
): number {
  const diff = Math.abs(value - target) / target;
  const score = Math.max(0, 1 - diff / tolerance) * 100;
  return Math.round(score);
}
