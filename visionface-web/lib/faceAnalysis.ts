/**
 * faceAnalysis.ts
 * Computes proportions scores from MediaPipe FaceLandmarker results.
 * Landmark indices based on MediaPipe Face Mesh topology (468 landmarks).
 */

export interface ProportionScores {
    forehead: number;  // Panna
    eyes: number;      // Ögon
    nose: number;      // Näsa
    lips: number;      // Mun
    jaw: number;       // Käke
}

/** Euclidean distance between two 2D points */
function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Converts a ratio to a 0–100 score using a golden ratio target (φ ≈ 1.618).
 * The closer the ratio is to the target, the higher the score.
 */
function ratioToScore(ratio: number, target: number, tolerance = 0.5): number {
    const diff = Math.abs(ratio - target);
    const score = Math.max(0, 100 - (diff / tolerance) * 100);
    return Math.round(Math.min(100, score));
}

/**
 * Compute proportions scores from a MediaPipe NormalizedLandmark array.
 * Returns scores for 5 face zones (0–100).
 */
export function computeProportions(
    landmarks: { x: number; y: number; z: number }[]
): ProportionScores {
    if (!landmarks || landmarks.length < 468) {
        return { forehead: 0, eyes: 0, nose: 0, lips: 0, jaw: 0 };
    }

    // Key landmark indices (MediaPipe Face Mesh 468 points)
    const CHIN = landmarks[152];         // chin bottom
    const FOREHEAD = landmarks[10];      // top of forehead
    const LEFT_EYE_OUT = landmarks[33];  // outer left eye corner
    const RIGHT_EYE_OUT = landmarks[263];// outer right eye corner
    const LEFT_EYE_IN = landmarks[133];  // inner left eye corner
    const RIGHT_EYE_IN = landmarks[362]; // inner right eye corner
    const NOSE_TIP = landmarks[4];
    const NOSE_BASE = landmarks[2];
    const LEFT_LIP = landmarks[61];      // left lip corner
    const RIGHT_LIP = landmarks[291];    // right lip corner
    const UPPER_LIP = landmarks[13];
    const LOWER_LIP = landmarks[14];
    const LEFT_JAW = landmarks[234];
    const RIGHT_JAW = landmarks[454];
    const EYE_TO_BROW_L = landmarks[105];// left brow top
    const EYE_TO_BROW_R = landmarks[334];// right brow top

    // Face total height
    const faceHeight = dist(FOREHEAD, CHIN) || 1;

    // ── Panna (Forehead) ────────────────────────────────────────────────────────
    // Target: forehead ~1/3 of face height (golden division)
    const eyeCenter = { x: (LEFT_EYE_OUT.x + RIGHT_EYE_OUT.x) / 2, y: (LEFT_EYE_OUT.y + RIGHT_EYE_OUT.y) / 2 };
    const foreheadHeight = dist(FOREHEAD, eyeCenter);
    const foreheadRatio = foreheadHeight / faceHeight;
    const forehearScore = ratioToScore(foreheadRatio, 0.33, 0.12);

    // ── Ögon (Eyes) ─────────────────────────────────────────────────────────────
    // Target: eye width ≈ 1/5 of face width (rule of fifths)
    const faceWidth = dist(LEFT_JAW, RIGHT_JAW) || 1;
    const leftEyeWidth = dist(LEFT_EYE_OUT, LEFT_EYE_IN);
    const rightEyeWidth = dist(RIGHT_EYE_IN, RIGHT_EYE_OUT);
    const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
    const eyeRatio = avgEyeWidth / faceWidth;
    const eyeScore = ratioToScore(eyeRatio, 0.2, 0.08);

    // ── Näsa (Nose) ──────────────────────────────────────────────────────────────
    // Target: nose width ≈ distance between inner eye corners
    const innerEyeDist = dist(LEFT_EYE_IN, RIGHT_EYE_IN);
    const noseWidth = dist({ x: NOSE_TIP.x - 0.02, y: NOSE_TIP.y }, { x: NOSE_TIP.x + 0.02, y: NOSE_TIP.y });
    const noseHeight = dist(EYE_TO_BROW_L, NOSE_BASE);
    const noseRatio = (noseHeight / faceHeight);
    const noseScore = ratioToScore(noseRatio, 0.3, 0.1);

    // ── Mun (Lips) ────────────────────────────────────────────────────────────────
    // Target: lip width ≈ 1.618 × lip height (golden ratio proportion)
    const lipWidth = dist(LEFT_LIP, RIGHT_LIP);
    const lipHeight = dist(UPPER_LIP, LOWER_LIP) * 3; // multiply to amplify subtle differences
    const lipRatio = lipWidth / (lipHeight || 1);
    const lipScore = ratioToScore(lipRatio, 1.618, 0.6);

    // ── Käke (Jaw) ────────────────────────────────────────────────────────────────
    // Target: jaw width / forehead width — ideally slight taper
    const foreheadWidth = dist(LEFT_EYE_OUT, RIGHT_EYE_OUT) * 1.3;
    const jawWidth = dist(LEFT_JAW, RIGHT_JAW);
    const jawRatio = jawWidth / (foreheadWidth || 1);
    const jawScore = ratioToScore(jawRatio, 0.85, 0.2);

    return {
        forehead: Math.max(55, forehearScore), // floor at 55 to avoid very low scores
        eyes: Math.max(55, eyeScore),
        nose: Math.max(55, noseScore),
        lips: Math.max(55, lipScore),
        jaw: Math.max(55, jawScore),
    };
}
