'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import type { ProportionScores } from '@/lib/faceAnalysis';
import AnalysisResult from '@/components/AnalysisResult';
import Recommendations from '@/components/Recommendations';
import type { ScanResultPayload } from '@/components/FaceScanner';
import type { FaceLandmark } from '@/lib/treatmentSimulation';

// Dynamically import FaceScanner to avoid SSR issues with MediaPipe + camera
const FaceScanner = dynamic(() => import('@/components/FaceScanner'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full px-6">
            <div className="text-center vf-surface-strong px-7 py-6">
                <div className="w-8 h-8 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="vf-copy text-sm">Laddar scanner...</p>
            </div>
        </div>
    ),
});

export default function ScanPage() {
    const [baselineScores, setBaselineScores] = useState<ProportionScores | null>(null);
    const [targetScores, setTargetScores] = useState<ProportionScores | null>(null);
    const [scanPreview, setScanPreview] = useState<{ beforeImage: string; afterImage: string; landmarks: FaceLandmark[] } | null>(null);
    const [view, setView] = useState<'scanner' | 'result' | 'recommendations'>('scanner');
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-scan-reveal]',
                { autoAlpha: 0, y: 34 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.86,
                    stagger: 0.1,
                    ease: 'power3.out',
                },
            );
        }, root);

        return () => ctx.revert();
    }, [view]);

    const handleResult = (result: ScanResultPayload) => {
        setBaselineScores(result.scores);
        setTargetScores(result.scores);
        setScanPreview({ beforeImage: result.beforeImage, afterImage: result.afterImage, landmarks: result.landmarks });
        setView('result');
    };

    const handleReset = () => {
        setBaselineScores(null);
        setTargetScores(null);
        setScanPreview(null);
        setView('scanner');
    };

    return (
        <div ref={rootRef} className="h-[calc(100vh-5rem)] px-4 md:px-6 pb-5">
            <div className="vf-page-container max-w-6xl h-full flex flex-col gap-4">
                {view === 'scanner' && (
                    <section data-scan-reveal className="vf-hero-shot min-h-[180px] md:min-h-[220px] p-5 md:p-7">
                        <div
                            className="vf-hero-shot-media"
                            style={{
                                backgroundImage:
                                    "url('https://images.unsplash.com/photo-1467272046618-f2d170371b51?auto=format&fit=crop&w=2200&q=80')",
                            }}
                        />
                        <div className="vf-hero-shot-overlay" />

                        <div className="vf-hero-shot-content h-full flex flex-col justify-end">
                            <p className="vf-kicker text-[#b9eaff]">Facial Capture Protocol</p>
                            <h1 className="mt-2 text-[clamp(1.85rem,4vw,3.2rem)] leading-[0.92] font-[var(--font-sora)] text-[#e8f7ff]">
                                Precision mapping in
                                <span className="block vf-dramatic text-[clamp(2.35rem,5.8vw,4.9rem)] leading-[0.8] text-[#d6f2ff]">
                                    Real Time.
                                </span>
                            </h1>
                            <p className="mt-2 max-w-[640px] text-sm md:text-base text-[#d3e7f5]">
                                Positionera ansiktet och håll stilla i tre sekunder. VisionFace låser ansiktsmesh,
                                analyserar proportioner och bygger din före/efter-bas direkt i browsern.
                            </p>
                        </div>
                    </section>
                )}

                <div
                    data-scan-reveal
                    className={`min-h-0 flex-1 ${view === 'scanner' ? 'vf-surface rounded-[2rem] overflow-hidden' : 'overflow-hidden'}`}
                >
                    {view === 'result' && baselineScores && (
                        <AnalysisResult
                            scores={baselineScores}
                            beforeImage={scanPreview?.beforeImage}
                            afterImage={scanPreview?.afterImage}
                            landmarks={scanPreview?.landmarks}
                            onReset={handleReset}
                            onContinue={(nextTargetScores) => {
                                setTargetScores(nextTargetScores);
                                setView('recommendations');
                            }}
                        />
                    )}
                    {view === 'recommendations' && baselineScores && targetScores && (
                        <Recommendations
                            baselineScores={baselineScores}
                            targetScores={targetScores}
                            onBack={() => setView('result')}
                            onContinue={() => window.location.href = '/main/clinics'}
                        />
                    )}
                    {view === 'scanner' && <FaceScanner onResult={handleResult} />}
                </div>
            </div>
        </div>
    );
}
