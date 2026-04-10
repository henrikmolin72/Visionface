import { FaceDetectionResult } from 'expo-face-detector';
import { FaceLandmarks, FacialMeasurements } from '../types/facial';
import { FACIAL_STANDARDS, scoreAgainstStandard } from '../data/facialProportions';
import { Ethnicity } from '../types/facial';

/** Map expo-face-detector result to our FaceLandmarks shape. */
export function extractLandmarks(face: FaceDetectionResult['faces'][0]): FaceLandmarks | null {
  const { bounds, leftEyePosition, rightEyePosition, noseBasePosition, leftMouthPosition, rightMouthPosition } = face;
  if (!leftEyePosition || !rightEyePosition || !noseBasePosition || !leftMouthPosition || !rightMouthPosition) {
    return null;
  }
  return {
    leftEye: leftEyePosition,
    rightEye: rightEyePosition,
    nose: noseBasePosition,
    leftMouth: leftMouthPosition,
    rightMouth: rightMouthPosition,
    bounds,
  };
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

/**
 * Derive FacialMeasurements from detected landmarks.
 * All ratios are normalized so results are resolution-independent.
 */
export function computeMeasurements(landmarks: FaceLandmarks): FacialMeasurements {
  const faceWidth = landmarks.bounds.size.width;
  const faceHeight = landmarks.bounds.size.height;

  const eyeSpacing = distance(landmarks.leftEye, landmarks.rightEye);

  // Estimate nose width as ~60% of eye spacing (approximation without a nose-tip landmark)
  const noseWidthEstimate = eyeSpacing * 0.6;

  // Jawline: use mouth width vs face width as proxy
  const mouthWidth = distance(landmarks.leftMouth, landmarks.rightMouth);
  const jawlineScore = Math.min(100, Math.round((mouthWidth / faceWidth) * 220));

  // Symmetry: compare left/right distances from center
  const faceCenterX = landmarks.bounds.origin.x + faceWidth / 2;
  const leftEyeDist = Math.abs(landmarks.leftEye.x - faceCenterX);
  const rightEyeDist = Math.abs(landmarks.rightEye.x - faceCenterX);
  const symmetryRaw = 1 - Math.abs(leftEyeDist - rightEyeDist) / (faceWidth / 2);
  const symmetryScore = Math.min(100, Math.round(symmetryRaw * 100));

  const faceWidthHeightRatio = faceWidth / faceHeight;
  const eyeSpacingRatio = eyeSpacing / faceWidth;
  const noseWidthRatio = noseWidthEstimate / faceWidth;

  // Chin projection: distance from nose to mouth midpoint vs face height
  const mouthMidY = (landmarks.leftMouth.y + landmarks.rightMouth.y) / 2;
  const noseMouthDist = Math.abs(mouthMidY - landmarks.nose.y);
  const chinProjection = Math.round((noseMouthDist / faceHeight) * 100);

  // Cheekbone prominence: eye level width estimate vs lower face width
  const cheekboneProminence = Math.min(100, Math.round((eyeSpacing / mouthWidth) * 90));

  // Golden ratio: approx from face proportions
  const goldenRatioScore = Math.min(
    100,
    Math.round(100 - Math.abs(faceWidthHeightRatio - 1.618) * 60),
  );

  return {
    faceWidthHeightRatio: Math.round(faceWidthHeightRatio * 100) / 100,
    eyeSpacingRatio: Math.round(eyeSpacingRatio * 100) / 100,
    noseWidthRatio: Math.round(noseWidthRatio * 100) / 100,
    jawlineScore,
    symmetryScore,
    goldenRatioScore,
    chinProjection,
    cheekboneProminence,
  };
}

/** Compute an overall 0–100 score vs. ethnic standard. */
export function computeOverallScore(
  measurements: FacialMeasurements,
  ethnicity: Ethnicity,
): number {
  const standard = FACIAL_STANDARDS[ethnicity];

  const scores = [
    scoreAgainstStandard(measurements.faceWidthHeightRatio, standard.faceWidthHeightRatio),
    scoreAgainstStandard(measurements.eyeSpacingRatio, standard.eyeSpacingRatio),
    scoreAgainstStandard(measurements.noseWidthRatio, standard.noseWidthRatio),
    scoreAgainstStandard(measurements.jawlineScore, standard.jawlineScore, 20),
    scoreAgainstStandard(measurements.cheekboneProminence, standard.cheekboneProminence, 20),
    measurements.symmetryScore,
    measurements.goldenRatioScore,
  ];

  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
