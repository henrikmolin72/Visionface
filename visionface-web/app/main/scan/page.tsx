'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import type { Ethnicity, Gender } from '@/lib/facialIdeals';
import type { AnalysisResult as AnalysisResultType } from '@/lib/faceAnalysis';
import type { ScanResultPayload, FaceLandmark } from '@/components/FaceScanner';
import EthnicitySelector from '@/components/EthnicitySelector';
import AnalysisResult from '@/components/AnalysisResult';

const FaceScanner = dynamic(() => import('@/components/FaceScanner'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full px-6">
            <div className="text-center vf-surface-strong px-7 py-6">
                <div className="w-8 h-8 border-2 border-[#134e4a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="vf-copy text-sm">Laddar scanner...</p>
            </div>
        </div>
    ),
});

type ViewState = 'ethnicity' | 'scanner' | 'result';

export default function ScanPage() {
    const [view, setView] = useState<ViewState>('ethnicity');
    const [ethnicity, setEthnicity] = useState<Ethnicity | null>(null);
    const [gender, setGender] = useState<Gender>('female');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
    const [beforeImage, setBeforeImage] = useState<string>('');
    const [landmarks, setLandmarks] = useState<FaceLandmark[]>([]);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('[data-scan-reveal]', { autoAlpha: 0, y: 34 }, {
                autoAlpha: 1, y: 0, duration: 0.86, stagger: 0.1, ease: 'power3.out',
            });
        }, root);
        return () => ctx.revert();
    }, [view]);

    const handleEthnicitySelect = (eth: Ethnicity, gen: Gender) => {
        setEthnicity(eth);
        setGender(gen);
        setView('scanner');
    };

    const handleScanResult = async (result: ScanResultPayload) => {
        const { analyzeface } = await import('@/lib/faceAnalysis');
        const analysis = analyzeface(result.landmarks, result.ethnicity, result.gender);
        setAnalysisResult(analysis);
        setBeforeImage(result.beforeImage);
        setLandmarks(result.landmarks);
        setView('result');
    };

    const handleReset = () => {
        setAnalysisResult(null);
        setBeforeImage('');
        setView('ethnicity');
    };

    return (
        <div ref={rootRef} className={`${view === 'scanner' ? 'h-screen' : 'h-[calc(100vh-5rem)]'} px-4 md:px-6 pb-5`}>
            <div className={`vf-page-container h-full flex flex-col ${view === 'scanner' ? '' : 'max-w-6xl gap-4'}`}>
                <div
                    data-scan-reveal
                    className={`min-h-0 flex-1 ${view === 'scanner' ? 'rounded-[1.5rem] overflow-hidden my-2' : view === 'ethnicity' ? '' : 'overflow-hidden'}`}
                >
                    {view === 'ethnicity' && (
                        <EthnicitySelector onSelect={handleEthnicitySelect} />
                    )}
                    {view === 'scanner' && ethnicity && (
                        <FaceScanner ethnicity={ethnicity} gender={gender} onResult={handleScanResult} />
                    )}
                    {view === 'result' && analysisResult && (
                        <AnalysisResult
                            analysis={analysisResult}
                            beforeImage={beforeImage}
                            landmarks={landmarks}
                            ethnicity={ethnicity!}
                            gender={gender}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
