/**
 * faceAnalysis.ts
 * Ethnic-aware facial proportion analysis using MediaPipe landmarks.
 * Computes raw ratios and scores them against ethnic-specific ideal ranges.
 */

import { ETHNIC_PROFILES, getRecommendations, type Ethnicity, type Gender, type Range, type Recommendation } from './facialIdeals';

export interface FaceLandmark {
    x: number;
    y: number;
    z: number;
}

export interface ProportionScores {
    forehead: number;
    eyes: number;
    nose: number;
    lips: number;
    jaw: number;
    cheeks: number;
    symmetry: number;
    overall: number;
}

export interface RawMeasurements {
    facialIndex: number;
    foreheadRatio: number;
    eyeSpacing: number;
    noseProjection: number;
    lipRatio: number;
    jawRatio: number;
    symmetry: number;
    cheekboneRatio: number;
}

export interface AnalysisResult {
    scores: ProportionScores;
    measurements: RawMeasurements;
    recommendations: Recommendation[];
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function scoreFromRange(value: number, range: Range): number {
    if (value >= range.min && value <= range.max) {
        const distFromIdeal = Math.abs(value - range.ideal);
        const maxDist = Math.max(range.ideal - range.min, range.max - range.ideal);
        return Math.round(85 + 15 * (1 - distFromIdeal / (maxDist || 1)));
    }
    const rangeWidth = range.max - range.min;
    const overshoot = value < range.min
        ? (range.min - value) / rangeWidth
        : (value - range.max) / rangeWidth;
    return Math.round(Math.max(30, 85 - overshoot * 60));
}

function computeSymmetry(landmarks: FaceLandmark[]): number {
    const pairs: [number, number][] = [
        [33, 263],   // outer eye corners
        [70, 300],   // brow ends
        [234, 454],  // jaw angles
        [61, 291],   // mouth corners
        [105, 334],  // brow peaks
    ];

    let totalDev = 0;
    const noseTip = landmarks[4];

    for (const [l, r] of pairs) {
        const lp = landmarks[l];
        const rp = landmarks[r];
        if (!lp || !rp) continue;
        const distL = dist(lp, noseTip);
        const distR = dist(rp, noseTip);
        const avg = (distL + distR) / 2;
        if (avg > 0) totalDev += Math.abs(distL - distR) / avg;
    }

    return (totalDev / pairs.length) * 100; // percentage deviation
}

export function analyzeface(
    landmarks: FaceLandmark[],
    ethnicity: Ethnicity,
    gender: Gender
): AnalysisResult {
    const profile = ETHNIC_PROFILES[ethnicity];
    const ideals = profile.ideals;

    if (!landmarks || landmarks.length < 468) {
        const emptyScores: ProportionScores = { forehead: 0, eyes: 0, nose: 0, lips: 0, jaw: 0, cheeks: 0, symmetry: 0, overall: 0 };
        return { scores: emptyScores, measurements: { facialIndex: 0, foreheadRatio: 0, eyeSpacing: 0, noseProjection: 0, lipRatio: 0, jawRatio: 0, symmetry: 0, cheekboneRatio: 0 }, recommendations: [] };
    }

    const CHIN = landmarks[152];
    const FOREHEAD = landmarks[10];
    const LEFT_EYE_OUT = landmarks[33];
    const RIGHT_EYE_OUT = landmarks[263];
    const LEFT_EYE_IN = landmarks[133];
    const RIGHT_EYE_IN = landmarks[362];
    const NOSE_TIP = landmarks[4];
    const NOSE_BRIDGE = landmarks[168];
    const LEFT_LIP = landmarks[61];
    const RIGHT_LIP = landmarks[291];
    const UPPER_LIP = landmarks[13];
    const LOWER_LIP = landmarks[14];
    const LEFT_JAW = landmarks[234];
    const RIGHT_JAW = landmarks[454];
    const LEFT_CHEEK = landmarks[116];
    const RIGHT_CHEEK = landmarks[345];
    const LEFT_BROW = landmarks[105];
    const RIGHT_BROW = landmarks[334];

    const faceHeight = dist(FOREHEAD, CHIN) || 1;
    const faceWidth = dist(LEFT_JAW, RIGHT_JAW) || 1;

    // Facial index (height/width)
    const facialIndex = faceHeight / faceWidth;

    // Forehead ratio (forehead height / face height, ideal ~0.33)
    const eyeCenter = { x: (LEFT_EYE_OUT.x + RIGHT_EYE_OUT.x) / 2, y: (LEFT_EYE_OUT.y + RIGHT_EYE_OUT.y) / 2 };
    const foreheadHeight = dist(FOREHEAD, eyeCenter);
    const foreheadRatio = foreheadHeight / faceHeight;

    // Eye spacing (IPD / face width)
    const ipd = dist(LEFT_EYE_OUT, RIGHT_EYE_OUT);
    const eyeSpacing = ipd / faceWidth;

    // Nose projection (Goode ratio approx: tip projection / nasal length)
    const noseLength = dist(NOSE_BRIDGE, NOSE_TIP);
    const noseTipProjection = Math.abs(NOSE_TIP.z - NOSE_BRIDGE.z) || noseLength * 0.55;
    const noseProjection = noseTipProjection / (noseLength || 1);

    // Lip ratio (upper lip height / lower lip height)
    const upperLipHeight = dist(UPPER_LIP, { x: (LEFT_LIP.x + RIGHT_LIP.x) / 2, y: Math.min(UPPER_LIP.y, LEFT_LIP.y) });
    const lowerLipHeight = dist(LOWER_LIP, { x: (LEFT_LIP.x + RIGHT_LIP.x) / 2, y: Math.max(LOWER_LIP.y, LEFT_LIP.y) });
    const lipRatio = upperLipHeight / (lowerLipHeight || 1);

    // Jaw ratio (bigonial / bizygomatic)
    const cheekWidth = dist(LEFT_CHEEK, RIGHT_CHEEK);
    const jawWidth = dist(LEFT_JAW, RIGHT_JAW);
    const jawRatio = jawWidth / (cheekWidth || 1);

    // Cheekbone ratio (fWHR: cheek width / upper face height)
    const upperFaceHeight = dist(LEFT_BROW, LEFT_CHEEK);
    const cheekboneRatio = cheekWidth / (upperFaceHeight || 1);

    // Symmetry
    const symmetry = computeSymmetry(landmarks);

    const measurements: RawMeasurements = {
        facialIndex,
        foreheadRatio,
        eyeSpacing,
        noseProjection,
        lipRatio,
        jawRatio,
        symmetry,
        cheekboneRatio,
    };

    // Score each zone against ethnic ideals
    const foreheadScore = scoreFromRange(foreheadRatio, { min: 0.30, max: 0.36, ideal: 0.33 });
    const eyeScore = scoreFromRange(eyeSpacing, ideals.ipdToFaceWidth);
    const noseScore = scoreFromRange(noseProjection, ideals.noseGoodeRatio);
    const lipScore = scoreFromRange(lipRatio, ideals.upperToLowerLipRatio);
    const jawScore = scoreFromRange(jawRatio, ideals.bigonialToBizygomatic[gender]);
    const cheekScore = scoreFromRange(cheekboneRatio, ideals.fWHR[gender]);
    const symmetryScore = symmetry <= 2 ? 95 : symmetry <= 3 ? 85 : symmetry <= 5 ? 70 : Math.max(30, 85 - symmetry * 5);

    const allScores = [foreheadScore, eyeScore, noseScore, lipScore, jawScore, cheekScore, symmetryScore];
    const overall = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

    const scores: ProportionScores = {
        forehead: foreheadScore,
        eyes: eyeScore,
        nose: noseScore,
        lips: lipScore,
        jaw: jawScore,
        cheeks: cheekScore,
        symmetry: symmetryScore,
        overall,
    };

    const recommendations = getRecommendations(measurements, ethnicity, gender);

    return { scores, measurements, recommendations };
}
