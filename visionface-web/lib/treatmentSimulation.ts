import type { ProportionScores } from './faceAnalysis';

export type FaceZone = keyof ProportionScores;

export interface FaceLandmark {
    x: number;
    y: number;
    z: number;
}

const FACE_OVAL_INDICES = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
    152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const OUTER_LIPS_INDICES = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const JAWLINE_INDICES = [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454];

function clamp01(v: number) {
    return Math.max(0, Math.min(1, v));
}

function getMirroredPoint(landmarks: FaceLandmark[], idx: number, w: number, h: number) {
    const lm = landmarks[idx];
    if (!lm) return null;
    return { x: (1 - lm.x) * w, y: lm.y * h };
}

function avgPoint(...pts: Array<{ x: number; y: number } | null>) {
    const valid = pts.filter((p): p is { x: number; y: number } => !!p);
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: sum.x / valid.length, y: sum.y / valid.length };
}

function createPolygonPath(
    ctx: CanvasRenderingContext2D,
    landmarks: FaceLandmark[],
    w: number,
    h: number,
    indices: number[]
) {
    ctx.beginPath();
    let hasPoint = false;
    for (let i = 0; i < indices.length; i += 1) {
        const p = getMirroredPoint(landmarks, indices[i], w, h);
        if (!p) continue;
        if (!hasPoint) {
            ctx.moveTo(p.x, p.y);
            hasPoint = true;
        } else {
            ctx.lineTo(p.x, p.y);
        }
    }
    if (!hasPoint) return false;
    ctx.closePath();
    return true;
}

function createFaceClipPath(ctx: CanvasRenderingContext2D, landmarks: FaceLandmark[], w: number, h: number) {
    return createPolygonPath(ctx, landmarks, w, h, FACE_OVAL_INDICES);
}

function drawSoftEllipse(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    colorInner: string,
    colorOuter = 'rgba(255,255,255,0)'
) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(Math.max(1, rx), Math.max(1, ry));
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, colorInner);
    gradient.addColorStop(1, colorOuter);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Unable to decode source image'));
        image.src = source;
    });
}

function getBoost(base: number, target: number) {
    return clamp01(Math.abs(target - base) / 30);
}

function getDirection(base: number, target: number) {
    if (target > base) return 1;
    if (target < base) return -1;
    return 0;
}

export function getInterventionLevel(delta: number): 'Ingen' | 'Liten' | 'Medel' | 'Stor' {
    if (delta <= 0) return 'Ingen';
    if (delta <= 12) return 'Liten';
    if (delta <= 28) return 'Medel';
    return 'Stor';
}

export function getRiskLevel(delta: number): 'Låg' | 'Förhöjd' | 'Hög' {
    if (delta <= 0) return 'Låg';
    if (delta <= 12) return 'Låg';
    if (delta <= 28) return 'Förhöjd';
    return 'Hög';
}

export async function renderTreatmentPreview({
    sourceImage,
    landmarks,
    baselineScores,
    targetScores,
}: {
    sourceImage: string;
    landmarks: FaceLandmark[];
    baselineScores: ProportionScores;
    targetScores: ProportionScores;
}): Promise<string> {
    try {
        if (!sourceImage || !landmarks || landmarks.length === 0) return sourceImage;
        const image = await loadImage(sourceImage);
        const w = image.naturalWidth || image.width;
        const h = image.naturalHeight || image.height;
        if (!w || !h) return sourceImage;

        const beforeCanvas = document.createElement('canvas');
        beforeCanvas.width = w;
        beforeCanvas.height = h;
        const beforeCtx = beforeCanvas.getContext('2d');
        if (!beforeCtx) return sourceImage;
        beforeCtx.drawImage(image, 0, 0, w, h);

        const afterCanvas = document.createElement('canvas');
        afterCanvas.width = w;
        afterCanvas.height = h;
        const afterCtx = afterCanvas.getContext('2d');
        if (!afterCtx) return sourceImage;

        const foreheadBoost = getBoost(baselineScores.forehead, targetScores.forehead);
        const eyesBoost = getBoost(baselineScores.eyes, targetScores.eyes);
        const noseBoost = getBoost(baselineScores.nose, targetScores.nose);
        const lipsBoost = getBoost(baselineScores.lips, targetScores.lips);
        const jawBoost = getBoost(baselineScores.jaw, targetScores.jaw);
        const foreheadDirection = getDirection(baselineScores.forehead, targetScores.forehead);
        const eyesDirection = getDirection(baselineScores.eyes, targetScores.eyes);
        const noseDirection = getDirection(baselineScores.nose, targetScores.nose);
        const lipsDirection = getDirection(baselineScores.lips, targetScores.lips);
        const jawDirection = getDirection(baselineScores.jaw, targetScores.jaw);
        const globalBoost = clamp01((foreheadBoost + eyesBoost + noseBoost + lipsBoost + jawBoost) / 5);

        // Base layer keeps realism and allows local enhancements above.
        afterCtx.filter = `contrast(${(1.05 + globalBoost * 0.16).toFixed(3)}) saturate(${(1.08 + globalBoost * 0.18).toFixed(3)}) brightness(${(1.02 + globalBoost * 0.08).toFixed(3)})`;
        afterCtx.drawImage(beforeCanvas, 0, 0);
        afterCtx.filter = 'none';

        if (globalBoost <= 0.01) {
            return afterCanvas.toDataURL('image/jpeg', 0.9);
        }

        const foreheadTop = getMirroredPoint(landmarks, 10, w, h);
        const chin = getMirroredPoint(landmarks, 152, w, h);
        const leftJaw = getMirroredPoint(landmarks, 234, w, h);
        const rightJaw = getMirroredPoint(landmarks, 454, w, h);
        const leftEyeCenter = avgPoint(
            getMirroredPoint(landmarks, 33, w, h),
            getMirroredPoint(landmarks, 133, w, h),
            getMirroredPoint(landmarks, 159, w, h),
            getMirroredPoint(landmarks, 145, w, h)
        );
        const rightEyeCenter = avgPoint(
            getMirroredPoint(landmarks, 263, w, h),
            getMirroredPoint(landmarks, 362, w, h),
            getMirroredPoint(landmarks, 386, w, h),
            getMirroredPoint(landmarks, 374, w, h)
        );
        const noseBridge = getMirroredPoint(landmarks, 168, w, h);
        const noseTip = getMirroredPoint(landmarks, 4, w, h);
        const leftNostril = getMirroredPoint(landmarks, 98, w, h);
        const rightNostril = getMirroredPoint(landmarks, 327, w, h);
        const lipCenter = avgPoint(
            getMirroredPoint(landmarks, 13, w, h),
            getMirroredPoint(landmarks, 14, w, h),
            getMirroredPoint(landmarks, 0, w, h)
        );
        const browCenter = avgPoint(
            getMirroredPoint(landmarks, 105, w, h),
            getMirroredPoint(landmarks, 334, w, h),
            foreheadTop
        );

        const faceWidth = leftJaw && rightJaw
            ? Math.max(1, Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y))
            : w * 0.42;
        const faceHeight = foreheadTop && chin
            ? Math.max(1, Math.hypot(chin.x - foreheadTop.x, chin.y - foreheadTop.y))
            : h * 0.62;
        const jawCenter = avgPoint(chin, leftJaw, rightJaw);

        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = w;
        blurCanvas.height = h;
        const blurCtx = blurCanvas.getContext('2d');
        if (blurCtx) {
            blurCtx.filter = `blur(${(2.6 + globalBoost * 3.4).toFixed(2)}px)`;
            blurCtx.drawImage(beforeCanvas, 0, 0);
            blurCtx.filter = 'none';

            afterCtx.save();
            if (createFaceClipPath(afterCtx, landmarks, w, h)) {
                afterCtx.clip();
                afterCtx.globalAlpha = 0.2 + globalBoost * 0.24;
                afterCtx.drawImage(blurCanvas, 0, 0);
            }
            afterCtx.restore();
        }

        if (foreheadBoost > 0.02 && browCenter) {
            drawSoftEllipse(
                afterCtx,
                browCenter.x,
                browCenter.y - faceHeight * 0.08,
                faceWidth * 0.31,
                faceHeight * 0.18,
                foreheadDirection >= 0
                    ? `rgba(186, 230, 253, ${(0.1 + foreheadBoost * 0.34).toFixed(3)})`
                    : `rgba(15, 23, 42, ${(0.03 + foreheadBoost * 0.1).toFixed(3)})`
            );
        }

        if (eyesBoost > 0.02) {
            const eyeCenters = [leftEyeCenter, rightEyeCenter].filter((p): p is { x: number; y: number } => !!p);
            for (const c of eyeCenters) {
                drawSoftEllipse(
                    afterCtx,
                    c.x,
                    c.y + faceHeight * 0.01,
                    faceWidth * 0.13,
                    faceHeight * 0.075,
                    eyesDirection >= 0
                        ? `rgba(224, 242, 254, ${(0.07 + eyesBoost * 0.28).toFixed(3)})`
                        : `rgba(15, 23, 42, ${(0.03 + eyesBoost * 0.1).toFixed(3)})`
                );
            }
        }

        if (noseBoost > 0.02 && noseBridge && noseTip) {
            // Simulate contour refinement by local clipped scale/contrast around the nose.
            afterCtx.save();
            afterCtx.beginPath();
            afterCtx.ellipse(
                (noseBridge.x + noseTip.x) / 2,
                (noseBridge.y + noseTip.y) / 2 + faceHeight * 0.02,
                faceWidth * 0.12,
                faceHeight * 0.19,
                0,
                0,
                Math.PI * 2
            );
            afterCtx.clip();
            afterCtx.translate((noseBridge.x + noseTip.x) / 2, (noseBridge.y + noseTip.y) / 2);
            const noseScaleX = noseDirection >= 0 ? 1 - noseBoost * 0.17 : 1 + noseBoost * 0.15;
            const noseScaleY = noseDirection >= 0 ? 1 + noseBoost * 0.025 : 1 - noseBoost * 0.03;
            afterCtx.scale(noseScaleX, Math.max(0.82, noseScaleY));
            afterCtx.translate(-(noseBridge.x + noseTip.x) / 2, -(noseBridge.y + noseTip.y) / 2);
            afterCtx.filter = `contrast(${(1.08 + noseBoost * 0.16).toFixed(3)}) saturate(${(1.06 + noseBoost * 0.18).toFixed(3)})`;
            afterCtx.globalAlpha = 0.36 + noseBoost * 0.34;
            afterCtx.drawImage(beforeCanvas, 0, 0);
            afterCtx.restore();
            afterCtx.filter = 'none';

            afterCtx.save();
            afterCtx.strokeStyle = noseDirection >= 0
                ? `rgba(186, 230, 253, ${(0.28 + noseBoost * 0.45).toFixed(3)})`
                : `rgba(15, 23, 42, ${(0.08 + noseBoost * 0.18).toFixed(3)})`;
            afterCtx.lineWidth = Math.max(1.4, faceWidth * 0.01);
            afterCtx.lineCap = 'round';
            afterCtx.shadowColor = noseDirection >= 0 ? 'rgba(125, 211, 252, 0.65)' : 'rgba(15, 23, 42, 0.45)';
            afterCtx.shadowBlur = 10;
            afterCtx.beginPath();
            afterCtx.moveTo(noseBridge.x, noseBridge.y);
            afterCtx.lineTo(noseTip.x, noseTip.y);
            afterCtx.stroke();
            afterCtx.restore();

            if (leftNostril && rightNostril) {
                drawSoftEllipse(
                    afterCtx,
                    leftNostril.x,
                    leftNostril.y + faceHeight * 0.01,
                    faceWidth * 0.06,
                    faceHeight * 0.04,
                    `rgba(15, 23, 42, ${(0.03 + noseBoost * 0.13).toFixed(3)})`
                );
                drawSoftEllipse(
                    afterCtx,
                    rightNostril.x,
                    rightNostril.y + faceHeight * 0.01,
                    faceWidth * 0.06,
                    faceHeight * 0.04,
                    `rgba(15, 23, 42, ${(0.03 + noseBoost * 0.13).toFixed(3)})`
                );
            }
        }

        if (lipsBoost > 0.02 && lipCenter) {
            afterCtx.save();
            if (createPolygonPath(afterCtx, landmarks, w, h, OUTER_LIPS_INDICES)) {
                afterCtx.clip();
                const lipScaleRaw = lipsDirection >= 0 ? 1 + lipsBoost * 0.1 : 1 - lipsBoost * 0.085;
                const lipScale = Math.max(0.8, lipScaleRaw);
                afterCtx.translate(lipCenter.x, lipCenter.y);
                afterCtx.scale(lipScale, lipScale);
                afterCtx.translate(-lipCenter.x, -lipCenter.y);
                afterCtx.filter = `saturate(${(1.12 + lipsBoost * 0.7).toFixed(3)}) brightness(${(1.04 + lipsBoost * 0.14).toFixed(3)})`;
                afterCtx.globalAlpha = 0.28 + lipsBoost * 0.36;
                afterCtx.drawImage(beforeCanvas, 0, 0);
            }
            afterCtx.restore();
            afterCtx.filter = 'none';

            drawSoftEllipse(
                afterCtx,
                lipCenter.x,
                lipCenter.y + faceHeight * 0.01,
                faceWidth * 0.12,
                faceHeight * 0.065,
                lipsDirection >= 0
                    ? `rgba(244, 114, 182, ${(0.1 + lipsBoost * 0.28).toFixed(3)})`
                    : `rgba(15, 23, 42, ${(0.03 + lipsBoost * 0.12).toFixed(3)})`
            );
        }

        if (jawBoost > 0.02) {
            afterCtx.save();
            let hasPath = false;
            for (let i = 0; i < JAWLINE_INDICES.length; i += 1) {
                const p = getMirroredPoint(landmarks, JAWLINE_INDICES[i], w, h);
                if (!p) continue;
                if (!hasPath) {
                    afterCtx.beginPath();
                    afterCtx.moveTo(p.x, p.y);
                    hasPath = true;
                } else {
                    afterCtx.lineTo(p.x, p.y);
                }
            }
            if (hasPath) {
                afterCtx.strokeStyle = jawDirection >= 0
                    ? `rgba(56, 189, 248, ${(0.12 + jawBoost * 0.32).toFixed(3)})`
                    : `rgba(15, 23, 42, ${(0.05 + jawBoost * 0.12).toFixed(3)})`;
                afterCtx.lineWidth = 1.4 + jawBoost * 2;
                afterCtx.shadowColor = jawDirection >= 0 ? 'rgba(14, 116, 144, 0.34)' : 'rgba(15, 23, 42, 0.32)';
                afterCtx.shadowBlur = 8 + jawBoost * 9;
                afterCtx.stroke();
            }
            afterCtx.restore();

            if (jawCenter) {
                drawSoftEllipse(
                    afterCtx,
                    jawCenter.x,
                    jawCenter.y - faceHeight * 0.02,
                    faceWidth * 0.27,
                    faceHeight * 0.12,
                    jawDirection >= 0
                        ? `rgba(186, 230, 253, ${(0.06 + jawBoost * 0.18).toFixed(3)})`
                        : `rgba(15, 23, 42, ${(0.03 + jawBoost * 0.1).toFixed(3)})`
                );
            }
        }

        const glow = afterCtx.createRadialGradient(w * 0.5, h * 0.42, w * 0.06, w * 0.5, h * 0.42, w * 0.48);
        glow.addColorStop(0, `rgba(186, 230, 253, ${(0.1 + globalBoost * 0.08).toFixed(3)})`);
        glow.addColorStop(0.55, `rgba(186, 230, 253, ${(0.06 + globalBoost * 0.05).toFixed(3)})`);
        glow.addColorStop(1, 'rgba(186, 230, 253, 0)');
        afterCtx.fillStyle = glow;
        afterCtx.fillRect(0, 0, w, h);

        return afterCanvas.toDataURL('image/jpeg', 0.9);
    } catch {
        return sourceImage;
    }
}
