export type Ethnicity =
  | 'european'
  | 'asian'
  | 'african'
  | 'middleEastern'
  | 'latinAmerican';

export interface FaceLandmarks {
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  leftMouth: { x: number; y: number };
  rightMouth: { x: number; y: number };
  leftEar?: { x: number; y: number };
  rightEar?: { x: number; y: number };
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
}

export interface FacialMeasurements {
  faceWidthHeightRatio: number;
  eyeSpacingRatio: number;      // inter-eye distance / face width
  noseWidthRatio: number;       // nose width / face width
  jawlineScore: number;         // 0–100
  symmetryScore: number;        // 0–100
  goldenRatioScore: number;     // 0–100
  chinProjection: number;       // mm equivalent (normalized)
  cheekboneProminence: number;  // 0–100
}

export interface ScanResult {
  measurements: FacialMeasurements;
  ethnicity: Ethnicity;
  overallScore: number;         // 0–100
  capturedAt: string;           // ISO date
}

export type RiskLevel = 'low' | 'moderate' | 'high';
export type ProcedureCategory =
  | 'filler'
  | 'toxin'
  | 'surgical'
  | 'laser'
  | 'skincare';

export interface Procedure {
  id: string;
  name: string;
  medicalName: string;
  category: ProcedureCategory;
  areas: string[];
  description: string;
  expectedResult: string;
  risks: { label: string; level: RiskLevel }[];
  recoveryDays: number;
  durationMonths: number | null; // null = permanent
  costRangeSEK: [number, number];
  successRate: number; // 0–1
}

export interface ProcedureSuggestion {
  procedure: Procedure;
  area: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: number; // 0–1
  improvementEstimate: number; // % improvement
  reason: string;
}
