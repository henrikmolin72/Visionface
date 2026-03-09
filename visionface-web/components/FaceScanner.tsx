'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ProportionScores } from '@/lib/faceAnalysis';
import type { FaceLandmark } from '@/lib/treatmentSimulation';

type ScanState = 'idle' | 'requesting' | 'scanning' | 'analyzing' | 'done' | 'denied';
const REQUIRED_STABLE_SCAN_MS = 3000;

export interface ScanResultPayload {
    scores: ProportionScores;
    beforeImage: string;
    afterImage: string;
    landmarks: FaceLandmark[];
}

interface FaceScannerProps {
    onResult: (payload: ScanResultPayload) => void;
}

type LandmarkerDetectionResult = {
    faceLandmarks?: FaceLandmark[][];
};

type RuntimeLandmarker = {
    detectForVideo?: (video: HTMLVideoElement, timestampMs: number) => LandmarkerDetectionResult;
    detect?: (image: HTMLVideoElement) => LandmarkerDetectionResult;
};

const FACE_OVAL_INDICES = [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
    152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
];

const MESH_CONNECTIONS: Array<[number, number]> = [
    // Face contour
    [10, 338], [338, 297], [297, 332], [332, 284], [284, 251], [251, 389], [389, 356], [356, 454],
    [454, 323], [323, 361], [361, 288], [288, 397], [397, 365], [365, 379], [379, 378], [378, 400],
    [400, 377], [377, 152], [152, 148], [148, 176], [176, 149], [149, 150], [150, 136], [136, 172],
    [172, 58], [58, 132], [132, 93], [93, 234], [234, 127], [127, 162], [162, 21], [21, 54],
    [54, 103], [103, 67], [67, 109], [109, 10],
    // Brows
    [70, 63], [63, 105], [105, 66], [66, 107], [107, 55],
    [336, 296], [296, 334], [334, 293], [293, 300], [300, 276],
    // Eyes
    [33, 133], [133, 173], [173, 157], [157, 158], [158, 159], [159, 160], [160, 161], [161, 246], [246, 33],
    [263, 362], [362, 398], [398, 384], [384, 385], [385, 386], [386, 387], [387, 388], [388, 466], [466, 263],
    // Nose
    [168, 6], [6, 197], [197, 195], [195, 5], [5, 4], [4, 1], [1, 19], [19, 94], [94, 2], [2, 98], [98, 327],
    // Lips
    [61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291], [291, 61],
    [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324], [324, 308], [308, 78],
    // Cross-face net for visible mesh effect
    [33, 168], [263, 168], [133, 6], [362, 6], [61, 2], [291, 2], [98, 61], [327, 291], [234, 93], [454, 323],
    [70, 168], [336, 168], [50, 4], [280, 4], [105, 195], [334, 195], [152, 2], [10, 168],
];

const OUTER_LIPS_INDICES = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
const JAWLINE_INDICES = [234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454];

export default function FaceScanner({ onResult }: FaceScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number>(0);
    const landmarkerRef = useRef<unknown>(null);
    const lastTimestampRef = useRef<number>(0);
    const lastVideoTimeMsRef = useRef<number>(-1);
    const detectCooldownUntilRef = useRef<number>(0);

    const [scanState, setScanState] = useState<ScanState>('idle');
    const [faceDetected, setFaceDetected] = useState(false);
    const [loadingModel, setLoadingModel] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const progressRef = useRef(0);

    const updateScanProgress = useCallback((next: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(next)));
        if (progressRef.current !== clamped) {
            progressRef.current = clamped;
            setScanProgress(clamped);
        }
    }, []);

    const withSuppressedTFLiteInfo = useCallback(<T,>(fn: () => T): T => {
        const originalConsoleError = console.error;
        console.error = (...args: unknown[]) => {
            const text = args
                .map((arg) => {
                    if (typeof arg === 'string') return arg;
                    if (arg instanceof Error) return arg.message;
                    try {
                        return JSON.stringify(arg);
                    } catch {
                        return String(arg);
                    }
                })
                .join(' ');

            // MediaPipe/TFLite logs this info through stderr in some browsers.
            // Next/Turbopack surfaces it as a Console Error overlay even though it's non-fatal.
            if (text.includes('Created TensorFlow Lite XNNPACK delegate for CPU.')) return;

            originalConsoleError(...args);
        };

        try {
            return fn();
        } finally {
            console.error = originalConsoleError;
        }
    }, []);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    const cleanup = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    // ── Load MediaPipe ────────────────────────────────────────────────────────
    const loadLandmarker = useCallback(async () => {
        setLoadingModel(true);
        try {
            const vision = await import('@mediapipe/tasks-vision');
            const { FaceLandmarker, FilesetResolver } = vision;
            const visionVersion = '0.10.32';

            const filesetResolver = await FilesetResolver.forVisionTasks(
                `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${visionVersion}/wasm`
            );
            const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath:
                        'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                    delegate: 'CPU',
                },
                runningMode: 'VIDEO',
                numFaces: 1,
            });
            landmarkerRef.current = faceLandmarker;
        } catch (e) {
            console.error('MediaPipe load failed:', e);
        } finally {
            setLoadingModel(false);
        }
    }, []);

    // ── Start Camera ──────────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
        setScanState('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            lastTimestampRef.current = 0;
            lastVideoTimeMsRef.current = -1;
            detectCooldownUntilRef.current = 0;
            updateScanProgress(0);
            setScanState('scanning');
            await loadLandmarker();
            startDetectionLoop();
        } catch {
            updateScanProgress(0);
            setScanState('denied');
        }
    }, [loadLandmarker, updateScanProgress]);

    // ── Detection Loop ────────────────────────────────────────────────────────
    const startDetectionLoop = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        let analyzing = false;
        let faceDetectionStartTime = -1;

        const loop = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const landmarker = landmarkerRef.current as RuntimeLandmarker | null;

            if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
                animFrameRef.current = requestAnimationFrame(loop);
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw mirrored video frame
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            // Run face detection if model is loaded and we are not already results-processing
            if (landmarker?.detectForVideo && !analyzing) {
                if (performance.now() < detectCooldownUntilRef.current) {
                    drawOval(ctx, canvas.width, canvas.height, faceDetectionStartTime !== -1);
                    animFrameRef.current = requestAnimationFrame(loop);
                    return;
                }

                // Only detect when we have a fresh decoded video frame.
                const videoTimeMs = Math.floor(video.currentTime * 1000);
                if (videoTimeMs <= lastVideoTimeMsRef.current) {
                    drawOval(ctx, canvas.width, canvas.height, faceDetectionStartTime !== -1);
                    animFrameRef.current = requestAnimationFrame(loop);
                    return;
                }
                lastVideoTimeMsRef.current = videoTimeMs;

                // Ensure strictly increasing integer timestamps for MediaPipe.
                const detectTimestamp = Math.max(videoTimeMs, lastTimestampRef.current + 1);
                lastTimestampRef.current = detectTimestamp;

                const detectLandmarks = () => {
                    const attemptVideoDetection = (timestampMs: number) => {
                        if (!landmarker?.detectForVideo) return null;
                        lastTimestampRef.current = timestampMs;
                        return withSuppressedTFLiteInfo(
                            () => landmarker.detectForVideo?.(video, timestampMs) ?? null
                        );
                    };

                    try {
                        const first = attemptVideoDetection(detectTimestamp);
                        if (first) return first;
                    } catch {
                        // fall through to retry/fallback
                    }

                    try {
                        // Retry once with a bumped timestamp for strict monotonic edge cases.
                        const second = attemptVideoDetection(detectTimestamp + 1);
                        if (second) return second;
                    } catch {
                        // fall through to IMAGE-mode fallback
                    }

                    if (landmarker?.detect) {
                        try {
                            return withSuppressedTFLiteInfo(() => landmarker.detect?.(video) ?? null);
                        } catch {
                            return null;
                        }
                    }

                    return null;
                };

                try {
                    const result = detectLandmarks();
                    const landmarks = result?.faceLandmarks?.[0];

                    if (!result) {
                        // MediaPipe can fail transiently per-frame on some devices/browsers.
                        faceDetectionStartTime = -1;
                        setFaceDetected(false);
                        updateScanProgress(0);
                        drawOval(ctx, canvas.width, canvas.height, false);
                        detectCooldownUntilRef.current = performance.now() + 140;
                    } else if (landmarks && landmarks.length > 0) {
                        setFaceDetected(true);
                        drawOval(ctx, canvas.width, canvas.height, true);
                        drawFaceMesh(ctx, landmarks, canvas.width, canvas.height);

                        // Start/Continue 2s stability timer
                        if (faceDetectionStartTime === -1) {
                            faceDetectionStartTime = performance.now();
                            updateScanProgress(0);
                        } else {
                            const elapsed = performance.now() - faceDetectionStartTime;
                            const progress = (elapsed / REQUIRED_STABLE_SCAN_MS) * 100;
                            updateScanProgress(progress);
                        }

                        if (performance.now() - faceDetectionStartTime >= REQUIRED_STABLE_SCAN_MS) {
                            analyzing = true;
                            updateScanProgress(100);
                            setScanState('analyzing');

                            // Visual polish delay
                            await new Promise(r => setTimeout(r, 800));

                            const { computeProportions } = await import('@/lib/faceAnalysis');
                            const scores = computeProportions(landmarks);
                            const { beforeImage, afterImage } = generatePreviewImages(video, landmarks, scores);
                            const stableLandmarks = landmarks.map((lm) => ({
                                x: lm.x,
                                y: lm.y,
                                z: lm.z,
                            }));

                            setScanState('done');
                            cleanup();
                            onResult({
                                scores,
                                beforeImage,
                                afterImage,
                                landmarks: stableLandmarks,
                            });
                            return; // Stop the loop
                        }
                    } else {
                        setFaceDetected(false);
                        faceDetectionStartTime = -1;
                        updateScanProgress(0);
                        drawOval(ctx, canvas.width, canvas.height, false);
                    }
                } catch {
                    // Back off briefly on transient MediaPipe runtime errors.
                    faceDetectionStartTime = -1;
                    setFaceDetected(false);
                    updateScanProgress(0);
                    drawOval(ctx, canvas.width, canvas.height, false);
                    detectCooldownUntilRef.current = performance.now() + 120;
                }
            } else {
                drawOval(ctx, canvas.width, canvas.height, faceDetectionStartTime !== -1);
            }

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);
    }, [cleanup, onResult, updateScanProgress, withSuppressedTFLiteInfo]);

    // ── Draw oval overlay ─────────────────────────────────────────────────────
    function drawOval(ctx: CanvasRenderingContext2D, w: number, h: number, active: boolean) {
        const cx = w / 2;
        const cy = h / 2;
        const rx = w * 0.22;
        const ry = h * 0.38;

        // Darken the overlay outside the oval
        ctx.save();
        ctx.fillStyle = 'rgba(17, 24, 39, 0.45)';
        ctx.fillRect(0, 0, w, h);

        // Cut out oval
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Oval border
        ctx.strokeStyle = active ? '#BBDEFB' : 'rgba(187,222,251,0.3)';
        ctx.lineWidth = active ? 3 : 2;
        if (active) {
            ctx.shadowColor = '#BBDEFB';
            ctx.shadowBlur = 12;
        }
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    function drawFaceMesh(ctx: CanvasRenderingContext2D, landmarks: FaceLandmark[], w: number, h: number) {
        if (!landmarks || landmarks.length === 0) return;

        const getPoint = (idx: number) => {
            const lm = landmarks[idx];
            if (!lm) return null;
            return { x: (1 - lm.x) * w, y: lm.y * h };
        };

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(56, 233, 255, 0.78)';
        ctx.lineWidth = 1.15;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.58)';
        ctx.shadowBlur = 7;

        for (const [a, b] of MESH_CONNECTIONS) {
            const p1 = getPoint(a);
            const p2 = getPoint(b);
            if (!p1 || !p2) continue;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(207, 250, 254, 0.95)';
        for (let i = 0; i < landmarks.length; i += 3) {
            const p = getPoint(i);
            if (!p) continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.25, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
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

    function clamp01(v: number) {
        return Math.max(0, Math.min(1, v));
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

    function createFaceClipPath(ctx: CanvasRenderingContext2D, landmarks: FaceLandmark[], w: number, h: number) {
        if (!landmarks || landmarks.length === 0) return false;
        return createPolygonPath(ctx, landmarks, w, h, FACE_OVAL_INDICES);
    }

    function generatePreviewImages(
        video: HTMLVideoElement,
        landmarks: FaceLandmark[],
        scores: ProportionScores
    ): { beforeImage: string; afterImage: string } {
        try {
            const w = video.videoWidth;
            const h = video.videoHeight;
            if (!w || !h) return { beforeImage: '', afterImage: '' };

            const beforeCanvas = document.createElement('canvas');
            beforeCanvas.width = w;
            beforeCanvas.height = h;
            const beforeCtx = beforeCanvas.getContext('2d');
            if (!beforeCtx) return { beforeImage: '', afterImage: '' };

            // Mirror like the scanner view for consistent comparison.
            beforeCtx.save();
            beforeCtx.scale(-1, 1);
            beforeCtx.drawImage(video, -w, 0, w, h);
            beforeCtx.restore();

            const afterCanvas = document.createElement('canvas');
            afterCanvas.width = w;
            afterCanvas.height = h;
            const afterCtx = afterCanvas.getContext('2d');
            if (!afterCtx) return { beforeImage: '', afterImage: '' };

            const zoneBoost = (score: number, target = 88) => clamp01((target - score) / 30);
            const foreheadBoost = zoneBoost(scores.forehead);
            const eyesBoost = zoneBoost(scores.eyes);
            const noseBoost = zoneBoost(scores.nose);
            const lipsBoost = zoneBoost(scores.lips);
            const jawBoost = zoneBoost(scores.jaw);
            const globalBoost = clamp01((foreheadBoost + eyesBoost + noseBoost + lipsBoost + jawBoost) / 5);

            const foreheadTop = getMirroredPoint(landmarks, 10, w, h);
            const chin = getMirroredPoint(landmarks, 152, w, h);
            const leftJaw = getMirroredPoint(landmarks, 234, w, h);
            const rightJaw = getMirroredPoint(landmarks, 454, w, h);
            const leftBrow = avgPoint(
                getMirroredPoint(landmarks, 70, w, h),
                getMirroredPoint(landmarks, 105, w, h),
                getMirroredPoint(landmarks, 55, w, h),
            );
            const rightBrow = avgPoint(
                getMirroredPoint(landmarks, 336, w, h),
                getMirroredPoint(landmarks, 334, w, h),
                getMirroredPoint(landmarks, 285, w, h),
            );
            const leftEyeCenter = avgPoint(
                getMirroredPoint(landmarks, 33, w, h),
                getMirroredPoint(landmarks, 133, w, h),
                getMirroredPoint(landmarks, 159, w, h),
                getMirroredPoint(landmarks, 145, w, h),
            );
            const rightEyeCenter = avgPoint(
                getMirroredPoint(landmarks, 263, w, h),
                getMirroredPoint(landmarks, 362, w, h),
                getMirroredPoint(landmarks, 386, w, h),
                getMirroredPoint(landmarks, 374, w, h),
            );
            const noseBridge = getMirroredPoint(landmarks, 168, w, h);
            const noseTip = getMirroredPoint(landmarks, 4, w, h);
            const leftNostril = getMirroredPoint(landmarks, 98, w, h);
            const rightNostril = getMirroredPoint(landmarks, 327, w, h);
            const lipCenter = avgPoint(
                getMirroredPoint(landmarks, 13, w, h),
                getMirroredPoint(landmarks, 14, w, h),
                getMirroredPoint(landmarks, 0, w, h),
            );

            const faceWidth = leftJaw && rightJaw
                ? Math.max(1, Math.hypot(rightJaw.x - leftJaw.x, rightJaw.y - leftJaw.y))
                : w * 0.42;
            const faceHeight = foreheadTop && chin
                ? Math.max(1, Math.hypot(chin.x - foreheadTop.x, chin.y - foreheadTop.y))
                : h * 0.62;
            const foreheadCenter = avgPoint(foreheadTop, leftBrow, rightBrow);
            const jawCenter = avgPoint(chin, leftJaw, rightJaw);

            // Base enhancement for a premium simulation look.
            afterCtx.filter = `contrast(${(1.05 + globalBoost * 0.05).toFixed(3)}) saturate(${(1.07 + globalBoost * 0.07).toFixed(3)}) brightness(${(1.02 + globalBoost * 0.05).toFixed(3)})`;
            afterCtx.drawImage(beforeCanvas, 0, 0);
            afterCtx.filter = 'none';

            const smoothAlpha = 0.16 + globalBoost * 0.2;

            // Skin smoothing inside facial contour.
            const blurCanvas = document.createElement('canvas');
            blurCanvas.width = w;
            blurCanvas.height = h;
            const blurCtx = blurCanvas.getContext('2d');
            if (blurCtx) {
                const blurStrength = 2 + globalBoost * 2.4;
                blurCtx.filter = `blur(${blurStrength.toFixed(2)}px) brightness(1.03)`;
                blurCtx.drawImage(beforeCanvas, 0, 0);
                blurCtx.filter = 'none';

                afterCtx.save();
                if (createFaceClipPath(afterCtx, landmarks, w, h)) {
                    afterCtx.clip();
                    afterCtx.globalAlpha = smoothAlpha;
                    afterCtx.drawImage(blurCanvas, 0, 0);
                }
                afterCtx.restore();
            }

            // Zone: Forehead refinement.
            if (foreheadCenter && blurCtx && foreheadBoost > 0.03) {
                afterCtx.save();
                afterCtx.beginPath();
                afterCtx.ellipse(
                    foreheadCenter.x,
                    foreheadCenter.y - faceHeight * 0.03,
                    faceWidth * 0.3,
                    faceHeight * 0.17,
                    0,
                    0,
                    Math.PI * 2
                );
                afterCtx.clip();
                afterCtx.globalAlpha = 0.16 + foreheadBoost * 0.18;
                afterCtx.drawImage(blurCanvas, 0, 0);
                afterCtx.restore();

                drawSoftEllipse(
                    afterCtx,
                    foreheadCenter.x,
                    foreheadCenter.y - faceHeight * 0.05,
                    faceWidth * 0.27,
                    faceHeight * 0.16,
                    `rgba(186, 230, 253, ${(0.08 + foreheadBoost * 0.22).toFixed(3)})`
                );
            }

            // Zone: Eye area brightening + texture softening.
            if (blurCtx && eyesBoost > 0.03) {
                const eyeCenters = [leftEyeCenter, rightEyeCenter].filter((p): p is { x: number; y: number } => !!p);
                for (const c of eyeCenters) {
                    afterCtx.save();
                    afterCtx.beginPath();
                    afterCtx.ellipse(
                        c.x,
                        c.y + faceHeight * 0.01,
                        faceWidth * 0.12,
                        faceHeight * 0.075,
                        0,
                        0,
                        Math.PI * 2
                    );
                    afterCtx.clip();
                    afterCtx.globalAlpha = 0.12 + eyesBoost * 0.2;
                    afterCtx.drawImage(blurCanvas, 0, 0);
                    afterCtx.restore();

                    drawSoftEllipse(
                        afterCtx,
                        c.x,
                        c.y,
                        faceWidth * 0.13,
                        faceHeight * 0.07,
                        `rgba(224, 242, 254, ${(0.06 + eyesBoost * 0.18).toFixed(3)})`
                    );
                }
            }

            // Zone: Nose bridge highlighting + side contour.
            if (noseBridge && noseTip && noseBoost > 0.03) {
                afterCtx.save();
                afterCtx.strokeStyle = `rgba(186, 230, 253, ${(0.28 + noseBoost * 0.35).toFixed(3)})`;
                afterCtx.lineWidth = Math.max(1.3, faceWidth * 0.008);
                afterCtx.lineCap = 'round';
                afterCtx.shadowColor = 'rgba(125, 211, 252, 0.55)';
                afterCtx.shadowBlur = 7;
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
                        faceHeight * 0.045,
                        `rgba(15, 23, 42, ${(0.03 + noseBoost * 0.08).toFixed(3)})`
                    );
                    drawSoftEllipse(
                        afterCtx,
                        rightNostril.x,
                        rightNostril.y + faceHeight * 0.01,
                        faceWidth * 0.06,
                        faceHeight * 0.045,
                        `rgba(15, 23, 42, ${(0.03 + noseBoost * 0.08).toFixed(3)})`
                    );
                }
            }

            // Zone: Lips volumizing / color refinement.
            if (lipCenter && lipsBoost > 0.03) {
                afterCtx.save();
                if (createPolygonPath(afterCtx, landmarks, w, h, OUTER_LIPS_INDICES)) {
                    afterCtx.clip();
                    const lipScale = 1 + lipsBoost * 0.035;
                    afterCtx.translate(lipCenter.x, lipCenter.y);
                    afterCtx.scale(lipScale, lipScale);
                    afterCtx.translate(-lipCenter.x, -lipCenter.y);
                    afterCtx.filter = `saturate(${(1.08 + lipsBoost * 0.45).toFixed(3)}) brightness(${(1.02 + lipsBoost * 0.08).toFixed(3)})`;
                    afterCtx.globalAlpha = 0.25 + lipsBoost * 0.25;
                    afterCtx.drawImage(beforeCanvas, 0, 0);
                    afterCtx.filter = 'none';
                }
                afterCtx.restore();

                drawSoftEllipse(
                    afterCtx,
                    lipCenter.x,
                    lipCenter.y + faceHeight * 0.01,
                    faceWidth * 0.11,
                    faceHeight * 0.06,
                    `rgba(244, 114, 182, ${(0.06 + lipsBoost * 0.17).toFixed(3)})`
                );
            }

            // Zone: Jawline definition.
            if (jawBoost > 0.03) {
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
                    afterCtx.strokeStyle = `rgba(56, 189, 248, ${(0.08 + jawBoost * 0.2).toFixed(3)})`;
                    afterCtx.lineWidth = 1.2 + jawBoost * 1.4;
                    afterCtx.shadowColor = 'rgba(14, 116, 144, 0.28)';
                    afterCtx.shadowBlur = 6 + jawBoost * 6;
                    afterCtx.stroke();
                }
                afterCtx.restore();

                if (jawCenter) {
                    drawSoftEllipse(
                        afterCtx,
                        jawCenter.x,
                        jawCenter.y - faceHeight * 0.02,
                        faceWidth * 0.26,
                        faceHeight * 0.11,
                        `rgba(186, 230, 253, ${(0.04 + jawBoost * 0.1).toFixed(3)})`
                    );
                }
            }

            // Subtle clinical glow.
            const glow = afterCtx.createRadialGradient(w * 0.5, h * 0.42, w * 0.06, w * 0.5, h * 0.42, w * 0.48);
            glow.addColorStop(0, 'rgba(186, 230, 253, 0.16)');
            glow.addColorStop(0.55, 'rgba(186, 230, 253, 0.09)');
            glow.addColorStop(1, 'rgba(186, 230, 253, 0)');
            afterCtx.fillStyle = glow;
            afterCtx.fillRect(0, 0, w, h);

            // Slight contour polish along face oval.
            afterCtx.save();
            afterCtx.strokeStyle = 'rgba(125, 211, 252, 0.16)';
            afterCtx.lineWidth = 1.3;
            if (createFaceClipPath(afterCtx, landmarks, w, h)) {
                afterCtx.stroke();
            }
            afterCtx.restore();

            return {
                beforeImage: beforeCanvas.toDataURL('image/jpeg', 0.9),
                afterImage: afterCanvas.toDataURL('image/jpeg', 0.9),
            };
        } catch {
            return { beforeImage: '', afterImage: '' };
        }
    }

    // ── UI States ─────────────────────────────────────────────────────────────

    if (scanState === 'idle') {
        return (
            <div className="vf-page-base flex flex-col items-center justify-center h-full p-6 text-center relative overflow-hidden">
                {/* Ambient background blur */}
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-[#E3F2FD] rounded-full blur-[100px] opacity-50 mix-blend-multiply pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center max-w-sm">
                    {/* Scanner Icon/Visual */}
                    <div className="mb-10 animate-slide-up-fade">
                        <div className="relative w-32 h-40 rounded-[60px] vf-surface flex flex-col items-center justify-center mb-6 shadow-sm overflow-hidden">
                            <div className="absolute inset-0 border border-white/60 rounded-[60px]" />
                            {/* Scanning line animation */}
                            <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#E3F2FD] to-transparent opacity-40 animate-[slide-up_2s_ease-in-out_infinite_alternate]" />
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-float">
                                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-light vf-heading mb-3 tracking-tight animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                        Klinisk Ansiktsanalys
                    </h2>
                    <p className="text-[#64748b] text-sm leading-relaxed mb-10 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                        Placera ditt ansikte i ovalen. AI-modellen kommer att kartlägga dina ansiktsproportioner lokalt med hög precision.
                    </p>

                    <button
                        id="start-scan-btn"
                        onClick={startCamera}
                        className="group relative w-full overflow-hidden rounded-2xl btn-3d-glass btn-3d-glass-pink text-[#1E293B] font-medium py-4 px-8 transition-all duration-300 animate-slide-up-fade"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="absolute inset-0 bg-[#F8BBD0]/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <span className="btn-glass-engraved">Starta Kameran</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </span>
                    </button>

                    <div className="mt-6 flex items-center gap-2 text-[#94a3b8] text-xs font-medium animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Kameran används endast aktivt under analysen</span>
                    </div>
                </div>
            </div>
        );
    }

    if (scanState === 'denied') {
        return (
            <div className="vf-page-base flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#fee2e2] flex items-center justify-center mb-6 animate-scale-in">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h2 className="text-2xl font-light text-[#0f172a] mb-3 tracking-tight animate-slide-up-fade">Kamera nekad</h2>
                <p className="text-[#64748b] text-sm leading-relaxed mb-8 max-w-xs mx-auto animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                    Vi behöver tillgång till kameran för att kunna genomföra ansiktsanalysen. Tillåt detta i din webbläsares inställningar.
                </p>
                <button
                    onClick={startCamera}
                    className="vf-surface text-[#0f172a] font-medium py-3 px-8 rounded-2xl transition-colors shadow-sm animate-slide-up-fade"
                    style={{ animationDelay: '100ms' }}
                >
                    Försök igen
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-[#020617] overflow-hidden">
            {/* Hidden video element */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
                style={{ transform: 'scaleX(-1)', opacity: 0 }}
                playsInline
                muted
            />

            {/* Canvas with overlay */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Loading model indicator */}
            {loadingModel && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 vf-surface-strong text-[#0f172a] text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-sm animate-slide-up-fade">
                    <svg className="animate-spin h-3 w-3 text-[#0f172a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Initierar AI-motor...
                </div>
            )}

            {/* Guide text */}
            <div className="absolute top-16 left-0 right-0 flex justify-center w-full px-6">
                <div className={`transition-all duration-500 rounded-full px-5 py-2.5 text-sm md:text-base font-medium flex items-center gap-2 shadow-lg backdrop-blur-md border ${scanState === 'analyzing'
                    ? 'bg-[#E3F2FD]/90 border-[#BBDEFB]/50 text-[#1E293B]'
                    : faceDetected
                        ? 'bg-[#BBDEFB]/40 border-[#BBDEFB]/60 text-[#1E293B]'
                        : 'bg-[#1E293B]/60 border-white/10 text-white/90'
                    }`}>
                    {scanState === 'analyzing' ? (
                        <>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BBDEFB] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BBDEFB]"></span>
                            </span>
                            Kalkulerar data...
                        </>
                    ) : faceDetected ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Skannar ansiktet... {scanProgress}%
                        </>
                    ) : (
                        'Positionera ansiktet i ovalen'
                    )}
                </div>
            </div>

            {/* Bottom status */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center px-6">
                {scanState === 'analyzing' ? (
                    <div className="vf-surface-strong w-full max-w-sm rounded-3xl p-5 text-center shadow-2xl animate-slide-up-fade">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[#1E293B] font-semibold text-sm">Genererar rapport</p>
                            <span className="text-xs font-bold text-[#BBDEFB]">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#BBDEFB] rounded-full animate-fill-bar-bezier" style={{ width: '100%' }} />
                        </div>
                    </div>
                ) : faceDetected ? (
                    <div className="vf-surface-strong w-full max-w-sm rounded-3xl p-5 text-center shadow-2xl animate-slide-up-fade">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[#1E293B] font-semibold text-sm">Skannar proportioner</p>
                            <span className="text-xs font-bold text-[#BBDEFB]">{scanProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#BBDEFB] rounded-full transition-[width] duration-100 ease-linear" style={{ width: `${scanProgress}%` }} />
                        </div>
                        <p className="text-[11px] text-[#475569] mt-2">
                            Håll ansiktet stilla i {Math.max(0, ((REQUIRED_STABLE_SCAN_MS * (100 - scanProgress)) / 100 / 1000)).toFixed(1)} sek till...
                        </p>
                    </div>
                ) : (
                    <p className={`text-xs tracking-wide uppercase font-medium mt-4 ${faceDetected ? 'text-white/90' : 'text-white/50'} animate-gentle-pulse`}>
                        {faceDetected ? 'Biometrisk analys pågår...' : 'Söker efter proportioner...'}
                    </p>
                )}
            </div>
        </div>
    );
}
