'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Ethnicity, Gender } from '@/lib/facialIdeals';

type ScanState = 'idle' | 'requesting' | 'aligning' | 'scanning' | 'analyzing' | 'done' | 'denied';
const REQUIRED_STABLE_SCAN_MS = 6000;
const ALIGNMENT_HOLD_MS = 1500; // Hold aligned for 1.5s before scan starts

export interface FaceLandmark {
    x: number;
    y: number;
    z: number;
}

export interface ScanResultPayload {
    landmarks: FaceLandmark[];
    beforeImage: string;
    ethnicity: Ethnicity;
    gender: Gender;
}

interface FaceScannerProps {
    ethnicity: Ethnicity;
    gender: Gender;
    onResult: (payload: ScanResultPayload) => void;
}

type LandmarkerDetectionResult = {
    faceLandmarks?: FaceLandmark[][];
};

type RuntimeLandmarker = {
    detectForVideo?: (video: HTMLVideoElement, timestampMs: number) => LandmarkerDetectionResult;
    detect?: (image: HTMLVideoElement) => LandmarkerDetectionResult;
};

interface AlignmentStatus {
    centered: boolean;
    distance: boolean;
    vertical: boolean;
    all: boolean;
    hint: string;
}

/** Check if face is properly aligned in the circle */
function checkAlignment(landmarks: FaceLandmark[], canvasW: number, canvasH: number): AlignmentStatus {
    const circleR = Math.min(canvasW, canvasH) * 0.44;
    const circleCx = canvasW / 2;
    const circleCy = canvasH / 2;

    // Key landmarks (mirrored x)
    const forehead = landmarks[10];
    const chin = landmarks[152];
    const leftJaw = landmarks[234];
    const rightJaw = landmarks[454];
    const noseTip = landmarks[4];

    // Face center (mirrored)
    const faceCenterX = (1 - noseTip.x) * canvasW;
    const faceCenterY = ((forehead.y + chin.y) / 2) * canvasH;

    // Face dimensions
    const faceHeight = Math.abs(chin.y - forehead.y) * canvasH;
    const faceWidth = Math.abs((1 - leftJaw.x) - (1 - rightJaw.x)) * canvasW;

    // Check centering: face center should be within 15% of circle center
    const offsetX = Math.abs(faceCenterX - circleCx) / circleR;
    const offsetY = Math.abs(faceCenterY - circleCy) / circleR;
    const centered = offsetX < 0.2 && offsetY < 0.2;

    // Check distance: face should fill 55-85% of circle diameter
    const faceToCircleRatio = Math.max(faceHeight, faceWidth) / (circleR * 2);
    const tooClose = faceToCircleRatio > 0.85;
    const tooFar = faceToCircleRatio < 0.45;
    const distance = !tooClose && !tooFar;

    // Check vertical: forehead should be above chin (not tilted too much)
    const tiltRatio = Math.abs(forehead.x - chin.x) / Math.abs(forehead.y - chin.y);
    const vertical = tiltRatio < 0.15;

    const all = centered && distance && vertical;

    let hint = '';
    if (!centered) {
        if (offsetX > offsetY) {
            hint = faceCenterX < circleCx ? 'Flytta ansiktet åt höger' : 'Flytta ansiktet åt vänster';
        } else {
            hint = faceCenterY < circleCy ? 'Flytta ansiktet nedåt' : 'Flytta ansiktet uppåt';
        }
    } else if (tooClose) {
        hint = 'Flytta dig längre från kameran';
    } else if (tooFar) {
        hint = 'Flytta dig närmare kameran';
    } else if (!vertical) {
        hint = 'Håll huvudet rakt';
    } else {
        hint = 'Perfekt! Håll stilla...';
    }

    return { centered, distance, vertical, all, hint };
}

export default function FaceScanner({ ethnicity, gender, onResult }: FaceScannerProps) {
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
    const [laserPhase, setLaserPhase] = useState<'vertical' | 'horizontal' | 'done'>('vertical');
    const [alignmentHint, setAlignmentHint] = useState('Positionera ansiktet i cirkeln');
    const [alignmentChecks, setAlignmentChecks] = useState({ centered: false, distance: false, vertical: false });
    const progressRef = useRef(0);
    const laserStartRef = useRef(0);
    const alignedSinceRef = useRef(-1);

    const updateScanProgress = useCallback((next: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(next)));
        if (progressRef.current !== clamped) {
            progressRef.current = clamped;
            setScanProgress(clamped);
        }
    }, []);

    useEffect(() => {
        const originalConsoleError = console.error;
        console.error = (...args: unknown[]) => {
            const text = args.map((a) => typeof a === 'string' ? a : a instanceof Error ? a.message : String(a)).join(' ');
            if (text.includes('XNNPACK delegate for CPU')) return;
            originalConsoleError(...args);
        };
        return () => { console.error = originalConsoleError; };
    }, []);

    const cleanup = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    }, []);

    useEffect(() => () => cleanup(), [cleanup]);

    const loadLandmarker = useCallback(async () => {
        setLoadingModel(true);
        try {
            const vision = await import('@mediapipe/tasks-vision');
            const { FaceLandmarker, FilesetResolver } = vision;
            const filesetResolver = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
            );
            const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
                baseOptions: {
                    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
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
            alignedSinceRef.current = -1;
            setScanState('aligning');
            await loadLandmarker();
            startDetectionLoop();
        } catch {
            updateScanProgress(0);
            setScanState('denied');
        }
    }, [loadLandmarker, updateScanProgress]);

    const startDetectionLoop = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        let analyzing = false;
        let scanStartTime = -1;
        let currentScanState: ScanState = 'aligning';

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

            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            if (landmarker?.detectForVideo && !analyzing) {
                if (performance.now() < detectCooldownUntilRef.current) {
                    drawRoundFrame(ctx, canvas.width, canvas.height, false, false);
                    animFrameRef.current = requestAnimationFrame(loop);
                    return;
                }

                const videoTimeMs = Math.floor(video.currentTime * 1000);
                if (videoTimeMs <= lastVideoTimeMsRef.current) {
                    drawRoundFrame(ctx, canvas.width, canvas.height, false, false);
                    animFrameRef.current = requestAnimationFrame(loop);
                    return;
                }
                lastVideoTimeMsRef.current = videoTimeMs;

                const detectTimestamp = Math.max(videoTimeMs, lastTimestampRef.current + 1);
                lastTimestampRef.current = detectTimestamp;

                const detectLandmarks = () => {
                    const attempt = (ts: number) => {
                        if (!landmarker?.detectForVideo || video.paused || video.ended) return null;
                        lastTimestampRef.current = ts;
                        return landmarker.detectForVideo(video, ts);
                    };
                    try { const r = attempt(detectTimestamp); if (r) return r; } catch { /* retry */ }
                    try { const r = attempt(detectTimestamp + 1); if (r) return r; } catch { /* fallback */ }
                    return null;
                };

                try {
                    const result = detectLandmarks();
                    const landmarks = result?.faceLandmarks?.[0];

                    if (!result) {
                        setFaceDetected(false);
                        alignedSinceRef.current = -1;
                        if (currentScanState === 'aligning') {
                            setAlignmentHint('Positionera ansiktet i cirkeln');
                            setAlignmentChecks({ centered: false, distance: false, vertical: false });
                        }
                        if (currentScanState === 'scanning') {
                            scanStartTime = -1;
                            updateScanProgress(0);
                            setLaserPhase('vertical');
                            currentScanState = 'aligning';
                            setScanState('aligning');
                        }
                        drawRoundFrame(ctx, canvas.width, canvas.height, false, false);
                        detectCooldownUntilRef.current = performance.now() + 140;
                    } else if (landmarks && landmarks.length > 0) {
                        setFaceDetected(true);

                        if (currentScanState === 'aligning') {
                            // ── ALIGNMENT PHASE ──
                            const alignment = checkAlignment(landmarks, canvas.width, canvas.height);
                            setAlignmentHint(alignment.hint);
                            setAlignmentChecks({ centered: alignment.centered, distance: alignment.distance, vertical: alignment.vertical });

                            drawRoundFrame(ctx, canvas.width, canvas.height, true, alignment.all);

                            if (alignment.all) {
                                if (alignedSinceRef.current === -1) {
                                    alignedSinceRef.current = performance.now();
                                }
                                const alignedDuration = performance.now() - alignedSinceRef.current;

                                // Draw alignment progress ring
                                drawAlignmentProgress(ctx, canvas.width, canvas.height, alignedDuration / ALIGNMENT_HOLD_MS);

                                if (alignedDuration >= ALIGNMENT_HOLD_MS) {
                                    // Transition to scanning!
                                    currentScanState = 'scanning';
                                    setScanState('scanning');
                                    scanStartTime = performance.now();
                                    laserStartRef.current = performance.now();
                                    updateScanProgress(0);
                                    setLaserPhase('vertical');
                                }
                            } else {
                                alignedSinceRef.current = -1;
                            }
                        } else if (currentScanState === 'scanning') {
                            // ── SCANNING PHASE ──
                            // Verify alignment is still OK during scan
                            const alignment = checkAlignment(landmarks, canvas.width, canvas.height);

                            if (!alignment.all) {
                                // Lost alignment — go back
                                currentScanState = 'aligning';
                                setScanState('aligning');
                                scanStartTime = -1;
                                alignedSinceRef.current = -1;
                                updateScanProgress(0);
                                setLaserPhase('vertical');
                                setAlignmentHint(alignment.hint);
                                setAlignmentChecks({ centered: alignment.centered, distance: alignment.distance, vertical: alignment.vertical });
                                drawRoundFrame(ctx, canvas.width, canvas.height, true, false);
                            } else {
                                drawRoundFrame(ctx, canvas.width, canvas.height, true, true);

                                const elapsed = performance.now() - scanStartTime;
                                const progress = (elapsed / REQUIRED_STABLE_SCAN_MS) * 100;
                                updateScanProgress(progress);

                                if (progress < 50) {
                                    setLaserPhase('vertical');
                                } else {
                                    setLaserPhase('horizontal');
                                }

                                drawLaserEffect(ctx, canvas.width, canvas.height);

                                if (elapsed >= REQUIRED_STABLE_SCAN_MS) {
                                    analyzing = true;
                                    updateScanProgress(100);
                                    setLaserPhase('done');
                                    setScanState('analyzing');

                                    await new Promise(r => setTimeout(r, 800));

                                    const stableLandmarks = landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z }));
                                    const beforeImage = generateBeforeImage(video);

                                    setScanState('done');
                                    cleanup();
                                    onResult({ landmarks: stableLandmarks, beforeImage, ethnicity, gender });
                                    return;
                                }
                            }
                        }
                    } else {
                        setFaceDetected(false);
                        alignedSinceRef.current = -1;
                        if (currentScanState === 'scanning') {
                            scanStartTime = -1;
                            updateScanProgress(0);
                            setLaserPhase('vertical');
                            currentScanState = 'aligning';
                            setScanState('aligning');
                        }
                        setAlignmentHint('Positionera ansiktet i cirkeln');
                        setAlignmentChecks({ centered: false, distance: false, vertical: false });
                        drawRoundFrame(ctx, canvas.width, canvas.height, false, false);
                    }
                } catch {
                    setFaceDetected(false);
                    alignedSinceRef.current = -1;
                    drawRoundFrame(ctx, canvas.width, canvas.height, false, false);
                    detectCooldownUntilRef.current = performance.now() + 120;
                }
            } else {
                drawRoundFrame(ctx, canvas.width, canvas.height, false, false);
            }

            animFrameRef.current = requestAnimationFrame(loop);
        };

        animFrameRef.current = requestAnimationFrame(loop);
    }, [cleanup, onResult, updateScanProgress, ethnicity, gender]);

    // ── Draw round frame ─────────────────────────────────────────────────────
    function drawRoundFrame(ctx: CanvasRenderingContext2D, w: number, h: number, faceFound: boolean, aligned: boolean) {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.44;

        ctx.save();
        ctx.fillStyle = 'rgba(2, 6, 23, 0.55)';
        ctx.fillRect(0, 0, w, h);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // Border color reflects alignment state
        if (aligned) {
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.85)'; // green when aligned
            ctx.shadowColor = 'rgba(34, 197, 94, 0.6)';
        } else if (faceFound) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)'; // amber when face found but not aligned
            ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
        } else {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.shadowColor = 'transparent';
        }
        ctx.lineWidth = faceFound ? 2.5 : 1.5;
        ctx.shadowBlur = faceFound ? 18 : 0;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        if (aligned) {
            ctx.strokeStyle = 'rgba(34, 197, 94, 0.15)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ── Alignment progress ring ──────────────────────────────────────────────
    function drawAlignmentProgress(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.44 + 4;
        const clampedProgress = Math.min(1, Math.max(0, progress));

        ctx.save();
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(34, 197, 94, 0.7)';
        ctx.shadowBlur = 12;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * clampedProgress));
        ctx.stroke();
        ctx.restore();
    }

    // ── Laser scanning effect ────────────────────────────────────────────────
    function drawLaserEffect(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) * 0.44;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
        ctx.clip();

        const now = performance.now();
        const elapsed = (now - laserStartRef.current) / 1000;
        const progress = progressRef.current;
        const isVertical = progress < 50;

        if (isVertical) {
            const cycle = (elapsed % 2) / 2;
            const yPos = cycle < 0.5
                ? cy - r + (2 * r * cycle * 2)
                : cy + r - (2 * r * (cycle - 0.5) * 2);

            const gradient = ctx.createLinearGradient(cx - r, yPos, cx + r, yPos);
            gradient.addColorStop(0, 'rgba(45, 212, 168, 0)');
            gradient.addColorStop(0.2, 'rgba(45, 212, 168, 0.7)');
            gradient.addColorStop(0.5, 'rgba(94, 234, 212, 0.95)');
            gradient.addColorStop(0.8, 'rgba(45, 212, 168, 0.7)');
            gradient.addColorStop(1, 'rgba(45, 212, 168, 0)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(45, 212, 168, 0.8)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(cx - r, yPos);
            ctx.lineTo(cx + r, yPos);
            ctx.stroke();

            const trailGrad = ctx.createLinearGradient(0, yPos - 25, 0, yPos + 25);
            trailGrad.addColorStop(0, 'rgba(45, 212, 168, 0)');
            trailGrad.addColorStop(0.5, 'rgba(45, 212, 168, 0.06)');
            trailGrad.addColorStop(1, 'rgba(45, 212, 168, 0)');
            ctx.fillStyle = trailGrad;
            ctx.fillRect(cx - r, yPos - 25, 2 * r, 50);
        } else {
            const cycle = ((elapsed - 3) % 2) / 2;
            const xPos = cycle < 0.5
                ? cx - r + (2 * r * cycle * 2)
                : cx + r - (2 * r * (cycle - 0.5) * 2);

            const gradient = ctx.createLinearGradient(xPos, cy - r, xPos, cy + r);
            gradient.addColorStop(0, 'rgba(45, 212, 168, 0)');
            gradient.addColorStop(0.2, 'rgba(45, 212, 168, 0.7)');
            gradient.addColorStop(0.5, 'rgba(94, 234, 212, 0.95)');
            gradient.addColorStop(0.8, 'rgba(45, 212, 168, 0.7)');
            gradient.addColorStop(1, 'rgba(45, 212, 168, 0)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(45, 212, 168, 0.8)';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(xPos, cy - r);
            ctx.lineTo(xPos, cy + r);
            ctx.stroke();

            const trailGrad = ctx.createLinearGradient(xPos - 25, 0, xPos + 25, 0);
            trailGrad.addColorStop(0, 'rgba(45, 212, 168, 0)');
            trailGrad.addColorStop(0.5, 'rgba(45, 212, 168, 0.06)');
            trailGrad.addColorStop(1, 'rgba(45, 212, 168, 0)');
            ctx.fillStyle = trailGrad;
            ctx.fillRect(xPos - 25, cy - r, 50, 2 * r);
        }

        ctx.restore();
    }

    function generateBeforeImage(video: HTMLVideoElement): string {
        try {
            const w = video.videoWidth;
            const h = video.videoHeight;
            if (!w || !h) return '';
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d');
            if (!ctx) return '';
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(video, -w, 0, w, h);
            ctx.restore();
            return c.toDataURL('image/jpeg', 0.9);
        } catch {
            return '';
        }
    }

    // ── UI States ─────────────────────────────────────────────────────────────

    if (scanState === 'idle') {
        return (
            <div className="vf-page-base flex flex-col items-center justify-center h-full p-6 text-center relative overflow-hidden">
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-[#2dd4a8]/20 rounded-full blur-[100px] opacity-40 mix-blend-multiply pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center max-w-sm">
                    <div className="mb-10 animate-slide-up-fade">
                        <div className="relative w-32 h-32 rounded-full vf-surface flex items-center justify-center mb-6 shadow-sm overflow-hidden">
                            <div className="absolute inset-0 border border-white/60 rounded-full" />
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#52524e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-float">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M3 7V5a2 2 0 012-2h2" />
                                <path d="M17 3h2a2 2 0 012 2v2" />
                                <path d="M21 17v2a2 2 0 01-2 2h-2" />
                                <path d="M7 21H5a2 2 0 01-2-2v-2" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light vf-heading mb-3 tracking-tight animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                        Redo att skanna
                    </h2>
                    <p className="text-sm leading-relaxed mb-10 animate-slide-up-fade" style={{ color: 'var(--vf-copy)', animationDelay: '100ms' }}>
                        Placera ansiktet i cirkeln på rätt avstånd. Systemet guidar dig till rätt position innan skanningen börjar.
                    </p>
                    <button
                        onClick={startCamera}
                        className="group relative w-full overflow-hidden rounded-2xl bg-[#134e4a] text-white font-medium py-4 px-8 shadow-lg hover:bg-[#0d3d38] hover:shadow-xl transition-all duration-300 animate-slide-up-fade"
                        style={{ animationDelay: '100ms' }}
                    >
                        <div className="absolute inset-0 bg-[#2dd4a8]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <span className="btn-glass-engraved">Starta Scanning</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:scale-110">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M3 7V5a2 2 0 012-2h2" /><path d="M17 3h2a2 2 0 012 2v2" />
                                <path d="M21 17v2a2 2 0 01-2 2h-2" /><path d="M7 21H5a2 2 0 01-2-2v-2" />
                            </svg>
                        </span>
                    </button>
                    <div className="mt-6 flex items-center gap-2 text-[#a8a29e] text-xs font-medium animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>All analys sker lokalt i din webbläsare</span>
                    </div>
                </div>
            </div>
        );
    }

    if (scanState === 'denied') {
        return (
            <div className="vf-page-base flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#fde8e8] flex items-center justify-center mb-6 animate-scale-in">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                </div>
                <h2 className="text-2xl font-light text-[#0f172a] mb-3 tracking-tight animate-slide-up-fade">Kamera nekad</h2>
                <p className="text-[#64748b] text-sm leading-relaxed mb-8 max-w-xs mx-auto animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                    Vi behöver tillgång till kameran för analysen. Tillåt i webbläsarens inställningar.
                </p>
                <button onClick={startCamera} className="vf-surface text-[#0f172a] font-medium py-3 px-8 rounded-2xl transition-colors shadow-sm animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                    Försök igen
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-[#020617] overflow-hidden">
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
                style={{ transform: 'scaleX(-1)', opacity: 0 }}
                playsInline
                muted
            />

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {loadingModel && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 vf-surface-strong text-[#0f172a] text-xs font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-sm animate-slide-up-fade">
                    <svg className="animate-spin h-3 w-3 text-[#0f172a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Initierar AI-motor...
                </div>
            )}

            {/* Top status bar */}
            <div className="absolute top-8 left-0 right-0 flex justify-center w-full px-6">
                <div className={`transition-all duration-500 rounded-full px-5 py-2.5 text-sm font-medium flex items-center gap-2 shadow-lg backdrop-blur-md border ${
                    scanState === 'analyzing'
                        ? 'bg-white/90 border-[#d6d3cd]/50 text-[#1a1a1a]'
                        : scanState === 'scanning'
                            ? 'bg-[#0c4a6e]/60 border-[#38bdf8]/40 text-[#bae6fd]'
                            : faceDetected && alignmentChecks.centered && alignmentChecks.distance && alignmentChecks.vertical
                                ? 'bg-[#052e16]/60 border-[#22c55e]/40 text-[#bbf7d0]'
                                : faceDetected
                                    ? 'bg-[#451a03]/60 border-[#fbbf24]/40 text-[#fef3c7]'
                                    : 'bg-[#1E293B]/60 border-white/10 text-white/90'
                }`}>
                    {scanState === 'analyzing' ? (
                        <>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38bdf8]" />
                            </span>
                            Analyserar data...
                        </>
                    ) : scanState === 'scanning' ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#38bdf8]">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {scanProgress < 50 ? 'Vertikal skanning...' : 'Horisontell skanning...'} {scanProgress}%
                        </>
                    ) : (
                        <>
                            {faceDetected && alignmentChecks.centered && alignmentChecks.distance && alignmentChecks.vertical ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#22c55e]">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : null}
                            {alignmentHint}
                        </>
                    )}
                </div>
            </div>

            {/* Alignment checklist (only during aligning) */}
            {scanState === 'aligning' && faceDetected && (
                <div className="absolute top-20 left-0 right-0 flex justify-center px-6">
                    <div className="flex gap-3 mt-2">
                        {[
                            { ok: alignmentChecks.centered, label: 'Centrerad' },
                            { ok: alignmentChecks.distance, label: 'Avstånd' },
                            { ok: alignmentChecks.vertical, label: 'Rakt' },
                        ].map(({ ok, label }) => (
                            <div key={label} className={`flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1 backdrop-blur-md border transition-all ${
                                ok
                                    ? 'bg-[#052e16]/60 border-[#22c55e]/40 text-[#bbf7d0]'
                                    : 'bg-[#1E293B]/50 border-white/10 text-white/50'
                            }`}>
                                {ok ? (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                    </svg>
                                )}
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom status */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center px-6">
                {scanState === 'analyzing' ? (
                    <div className="vf-surface-strong w-full max-w-sm rounded-3xl p-5 text-center shadow-2xl animate-slide-up-fade">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[#1E293B] font-semibold text-sm">Genererar rapport</p>
                            <span className="text-xs font-bold text-[#38bdf8]">100%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#38bdf8] rounded-full animate-fill-bar-bezier" style={{ width: '100%' }} />
                        </div>
                    </div>
                ) : scanState === 'scanning' ? (
                    <div className="vf-surface-strong w-full max-w-sm rounded-3xl p-5 text-center shadow-2xl animate-slide-up-fade">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-[#1E293B] font-semibold text-sm">Laserskanning</p>
                            <span className="text-xs font-bold text-[#38bdf8]">{scanProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#38bdf8] rounded-full transition-[width] duration-100 ease-linear" style={{ width: `${scanProgress}%` }} />
                        </div>
                        <p className="text-[11px] text-[#475569] mt-2">
                            Håll ansiktet stilla i {Math.max(0, ((REQUIRED_STABLE_SCAN_MS * (100 - scanProgress)) / 100 / 1000)).toFixed(1)} sek till...
                        </p>
                    </div>
                ) : scanState === 'aligning' ? (
                    <div className="vf-surface-strong w-full max-w-sm rounded-3xl p-4 text-center shadow-2xl animate-slide-up-fade">
                        <p className="text-[#1E293B] font-semibold text-sm mb-1">Justera position</p>
                        <p className="text-[11px] text-[#475569]">
                            Centrera ansiktet i cirkeln på rätt avstånd. Skanningen startar automatiskt.
                        </p>
                    </div>
                ) : (
                    <p className="text-xs tracking-wide uppercase font-medium mt-4 text-white/50 animate-gentle-pulse">
                        Söker efter ansiktet...
                    </p>
                )}
            </div>
        </div>
    );
}
