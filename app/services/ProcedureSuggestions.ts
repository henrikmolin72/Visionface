import { FacialMeasurements, ProcedureSuggestion, Ethnicity } from '../types/facial';
import { FACIAL_STANDARDS, scoreAgainstStandard } from '../data/facialProportions';
import { PROCEDURES } from '../data/procedures';

interface SuggestionRule {
  procedureId: string;
  area: string;
  reason: string;
  /** Returns 0–1 confidence based on how far the measurement deviates */
  evaluate: (m: FacialMeasurements, standard: ReturnType<typeof getStandard>) => number;
}

function getStandard(ethnicity: Ethnicity) {
  return FACIAL_STANDARDS[ethnicity];
}

const RULES: SuggestionRule[] = [
  {
    procedureId: 'lipFiller',
    area: 'Läppar',
    reason: 'Läpparna är tunnare än genomsnittet för din etnicitet.',
    evaluate: (m) => {
      // Thin lips correlate with smaller mouth width ratio
      const thinness = Math.max(0, 0.38 - m.eyeSpacingRatio) / 0.1;
      return Math.min(1, thinness);
    },
  },
  {
    procedureId: 'jawlineContouring',
    area: 'Käklinje',
    reason: 'Käklinjen saknar definition jämfört med optimala proportioner.',
    evaluate: (m, std) => {
      const gap = Math.max(0, std.jawlineScore - m.jawlineScore);
      return Math.min(1, gap / 25);
    },
  },
  {
    procedureId: 'chinAugmentation',
    area: 'Haka',
    reason: 'Hakans projektion är lägre än rekommenderat för balanserade ansiktsproporioner.',
    evaluate: (m, std) => {
      const gap = Math.max(0, std.chinProjection - m.chinProjection);
      return Math.min(1, gap / 5);
    },
  },
  {
    procedureId: 'rhinoplasty',
    area: 'Näsa',
    reason: 'Näsbredden avviker från optimala proportioner relativt ansiktsbredden.',
    evaluate: (m, std) => {
      const deviation = Math.abs(m.noseWidthRatio - std.noseWidthRatio) / std.noseWidthRatio;
      return Math.min(1, deviation / 0.2);
    },
  },
  {
    procedureId: 'cheekAugmentation',
    area: 'Kindben',
    reason: 'Kindbenens prominens är lägre än genomsnittet för din etniska bakgrund.',
    evaluate: (m, std) => {
      const gap = Math.max(0, std.cheekboneProminence - m.cheekboneProminence);
      return Math.min(1, gap / 20);
    },
  },
  {
    procedureId: 'botox',
    area: 'Käklinje / Masseter',
    reason: 'Käklinjen kan definieras ytterligare med masseterbehandling.',
    evaluate: (m, std) => {
      const score = scoreAgainstStandard(m.jawlineScore, std.jawlineScore, 25);
      return score < 60 ? (60 - score) / 60 : 0;
    },
  },
  {
    procedureId: 'dermalFiller',
    area: 'Kindben / Käklinje',
    reason: 'Generell volymförlust kan korrigeras med strategiskt placerad filler.',
    evaluate: (m) => {
      const avgScore = (m.jawlineScore + m.cheekboneProminence) / 2;
      return avgScore < 65 ? (65 - avgScore) / 65 : 0;
    },
  },
  {
    procedureId: 'browLift',
    area: 'Ögonbryn',
    reason: 'Ögonbrynsposition kan förbättra ansiktets uttryck och symmetri.',
    evaluate: (m) => {
      return m.symmetryScore < 75 ? (75 - m.symmetryScore) / 75 * 0.6 : 0;
    },
  },
];

function priorityFromConfidence(confidence: number): ProcedureSuggestion['priority'] {
  if (confidence >= 0.75) return 'critical';
  if (confidence >= 0.50) return 'high';
  if (confidence >= 0.25) return 'medium';
  return 'low';
}

export function generateSuggestions(
  measurements: FacialMeasurements,
  ethnicity: Ethnicity,
  maxResults = 5,
): ProcedureSuggestion[] {
  const standard = getStandard(ethnicity);

  const suggestions: ProcedureSuggestion[] = RULES
    .map((rule) => {
      const confidence = rule.evaluate(measurements, standard);
      if (confidence < 0.1) return null;

      const procedure = PROCEDURES[rule.procedureId];
      if (!procedure) return null;

      const improvementEstimate = Math.round(confidence * 30); // up to 30% improvement

      return {
        procedure,
        area: rule.area,
        priority: priorityFromConfidence(confidence),
        confidence: Math.round(confidence * 100) / 100,
        improvementEstimate,
        reason: rule.reason,
      } satisfies ProcedureSuggestion;
    })
    .filter((s): s is ProcedureSuggestion => s !== null)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxResults);

  return suggestions;
}
