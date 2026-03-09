'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProportionScores } from '@/lib/faceAnalysis';
import {
    getInterventionLevel,
    getRiskLevel,
    renderTreatmentPreview,
    type FaceLandmark,
} from '@/lib/treatmentSimulation';

type FaceZone = keyof ProportionScores;

interface AnalysisResultProps {
    scores: ProportionScores;
    beforeImage?: string;
    afterImage?: string;
    landmarks?: FaceLandmark[];
    onReset: () => void;
    onContinue: (targetScores: ProportionScores) => void;
}

const ZONE_LABELS: { key: FaceZone; label: string; emoji: string }[] = [
    { key: 'forehead', label: 'Panna', emoji: '⬆' },
    { key: 'eyes', label: 'Ögon', emoji: '👁' },
    { key: 'nose', label: 'Näsa', emoji: '◆' },
    { key: 'lips', label: 'Mun', emoji: '◇' },
    { key: 'jaw', label: 'Käkelinje', emoji: '⬇' },
];

const ZONE_ORDER: FaceZone[] = ['forehead', 'eyes', 'nose', 'lips', 'jaw'];

function getScoreColor(score: number): string {
    if (score >= 85) return '#BBDEFB';
    if (score >= 70) return '#E3F2FD';
    return '#F1F5F9';
}

function getScoreLabel(score: number): string {
    if (score >= 90) return 'Utmärkt';
    if (score >= 80) return 'Mycket bra';
    if (score >= 70) return 'Bra';
    return 'Neutral';
}

function BeforeAfterComparison({
    beforeImage,
    afterImage,
    isRendering,
}: {
    beforeImage: string;
    afterImage: string;
    isRendering: boolean;
}) {
    const [split, setSplit] = useState(50);

    return (
        <div className="vf-surface rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold tracking-widest text-[#475569] uppercase">Före / Efter</h4>
                <span className="text-[10px] font-semibold text-[#1E293B] bg-white/70 px-2 py-1 rounded-full border border-[#e2e8f0]">
                    Simulerad rendering
                </span>
            </div>

            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#e2e8f0] bg-[#f8fafc]">
                <img
                    src={beforeImage}
                    alt="Original före behandling"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
                >
                    <img
                        src={afterImage}
                        alt="Simulerat efterresultat"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div
                    className="absolute inset-y-0 w-[2px] bg-white/90 shadow-[0_0_8px_rgba(15,23,42,0.35)]"
                    style={{ left: `${split}%`, transform: 'translateX(-50%)' }}
                />
                <div className="absolute top-2 left-2 text-[10px] font-semibold text-[#1E293B] bg-white/80 px-2 py-1 rounded-full border border-[#e2e8f0]">
                    Före
                </div>
                <div className="absolute top-2 right-2 text-[10px] font-semibold text-[#1E293B] bg-white/80 px-2 py-1 rounded-full border border-[#e2e8f0]">
                    Efter
                </div>

                {isRendering && (
                    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/80 backdrop-blur-sm border border-[#e2e8f0] px-3 py-1.5 text-[11px] font-medium text-[#1E293B] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                        Uppdaterar simulering...
                    </div>
                )}
            </div>

            <input
                type="range"
                min={0}
                max={100}
                value={split}
                onChange={(e) => setSplit(Number(e.target.value))}
                className="w-full mt-3 accent-[#38bdf8]"
                aria-label="Jämför före och efter"
            />
            <p className="text-[11px] text-[#64748b] leading-relaxed mt-2">
                Förhandsrendering baserat på vald målnivå per ansiktszon. Slutresultat kan variera beroende på metod, anatomi och behandlare.
            </p>
        </div>
    );
}

export default function AnalysisResult({
    scores,
    beforeImage,
    afterImage,
    landmarks,
    onReset,
    onContinue,
}: AnalysisResultProps) {
    const [selectedZone, setSelectedZone] = useState<FaceZone>('nose');
    const [targetScores, setTargetScores] = useState<ProportionScores>(scores);
    const [dynamicAfterImage, setDynamicAfterImage] = useState(afterImage ?? '');
    const [renderingPreview, setRenderingPreview] = useState(false);

    useEffect(() => {
        setTargetScores(scores);
    }, [scores]);

    useEffect(() => {
        setDynamicAfterImage(afterImage ?? beforeImage ?? '');
    }, [afterImage, beforeImage]);

    useEffect(() => {
        if (!beforeImage) return;
        const hasChanges = ZONE_ORDER.some((zone) => targetScores[zone] !== scores[zone]);
        if (!hasChanges) {
            setDynamicAfterImage(afterImage ?? beforeImage);
            setRenderingPreview(false);
            return;
        }
        if (!landmarks || landmarks.length === 0) return;

        let cancelled = false;
        setRenderingPreview(true);

        const timer = window.setTimeout(async () => {
            const rendered = await renderTreatmentPreview({
                sourceImage: beforeImage,
                landmarks,
                baselineScores: scores,
                targetScores,
            });
            if (cancelled) return;
            setDynamicAfterImage(rendered);
            setRenderingPreview(false);
        }, 140);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [afterImage, beforeImage, landmarks, scores, targetScores]);

    const avg = useMemo(
        () => Math.round(Object.values(targetScores).reduce((acc, value) => acc + value, 0) / ZONE_ORDER.length),
        [targetScores]
    );
    const baselineAvg = useMemo(
        () => Math.round(Object.values(scores).reduce((acc, value) => acc + value, 0) / ZONE_ORDER.length),
        [scores]
    );

    const selectedBaseline = scores[selectedZone];
    const selectedTarget = targetScores[selectedZone];
    const selectedDeltaRaw = selectedTarget - selectedBaseline;
    const selectedDelta = Math.abs(selectedDeltaRaw);
    const interventionLevel = getInterventionLevel(selectedDelta);
    const riskLevel = getRiskLevel(selectedDelta);
    const selectedZoneLabel = ZONE_LABELS.find((z) => z.key === selectedZone)?.label ?? selectedZone;

    const updateZoneScore = (zone: FaceZone, value: number) => {
        const clamped = Math.max(0, Math.min(100, Math.round(value)));
        setTargetScores((prev) => ({ ...prev, [zone]: clamped }));
    };

    const updateSelectedZone = (value: number) => {
        updateZoneScore(selectedZone, value);
    };

    const resetZone = () => {
        setTargetScores((prev) => ({ ...prev, [selectedZone]: scores[selectedZone] }));
    };

    const resetAll = () => {
        setTargetScores(scores);
    };

    return (
        <div className="vf-page-base flex flex-col h-full overflow-y-auto pb-6 relative">
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#E3F2FD] rounded-full blur-[120px] opacity-40 mix-blend-multiply pointer-events-none" />

            <div className="relative pt-16 pb-12 px-6 flex flex-col items-center border-b border-[#dbeafe] bg-white/50 backdrop-blur-3xl animate-slide-up-fade">
                <p className="text-xs font-semibold tracking-widest text-[#475569] uppercase mb-4">
                    Klinisk Rapport
                </p>

                <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle
                            cx="50" cy="50" r="46"
                            fill="none"
                            stroke="#F1F5F9"
                            strokeWidth="1.5"
                        />
                        <circle
                            cx="50" cy="50" r="46"
                            fill="none"
                            stroke={getScoreColor(avg)}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="289.026"
                            strokeDashoffset={289.026 - (289.026 * avg) / 100}
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>

                    <div className="text-center">
                        <span className="text-5xl font-light text-[#1E293B] tracking-tighter">
                            {avg}
                        </span>
                    </div>
                </div>

                <p className="text-[#475569] text-sm text-center">
                    Harmonipoäng — <span className="font-medium text-[#1E293B]">{getScoreLabel(avg)}</span>
                </p>
                <p className="text-[11px] text-[#64748b] mt-1">
                    Ursprung: {baselineAvg} • Mål: {avg}
                </p>
            </div>

            <div className="px-6 pt-8 pb-4 space-y-3 z-10 w-full max-w-lg mx-auto">
                {beforeImage && dynamicAfterImage && (
                    <div className="mb-5 animate-slide-up-fade">
                        <BeforeAfterComparison
                            beforeImage={beforeImage}
                            afterImage={dynamicAfterImage}
                            isRendering={renderingPreview}
                        />
                    </div>
                )}

                <div className="vf-surface rounded-3xl p-4 mb-5 animate-slide-up-fade">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                            <h3 className="text-xs font-semibold tracking-widest text-[#475569] uppercase">Finjustera Zon</h3>
                            <p className="text-[12px] text-[#64748b] mt-1">Välj område och dra målvärdet upp till 100.</p>
                        </div>
                        <button
                            type="button"
                            onClick={resetAll}
                            className="text-[11px] font-semibold text-[#475569] px-2 py-1 rounded-lg border border-[#e2e8f0] bg-white"
                        >
                            Nollställ alla
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                        {ZONE_LABELS.map((zone) => {
                            const isActive = selectedZone === zone.key;
                            const deltaRaw = targetScores[zone.key] - scores[zone.key];
                            const deltaAbs = Math.abs(deltaRaw);
                            return (
                                <button
                                    key={zone.key}
                                    type="button"
                                    onClick={() => setSelectedZone(zone.key)}
                                    className={`rounded-xl px-2 py-2 text-left border transition-all ${isActive
                                        ? 'border-[#93c5fd] bg-[#eff6ff]'
                                        : 'border-[#e2e8f0] bg-white/70'
                                        }`}
                                >
                                    <div className="text-[10px] text-[#64748b]">{zone.emoji} {zone.label}</div>
                                    <div className="text-sm font-semibold text-[#1E293B] leading-none mt-1">{targetScores[zone.key]}</div>
                                    <div className="text-[10px] text-[#94a3b8]">{deltaRaw >= 0 ? '+' : '-'}{deltaAbs}</div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-[#1E293B]">{selectedZoneLabel}</p>
                            <button
                                type="button"
                                onClick={resetZone}
                                className="text-[11px] font-semibold text-[#475569] px-2 py-1 rounded-lg border border-[#e2e8f0]"
                            >
                                Nollställ zon
                            </button>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={selectedTarget}
                            onChange={(e) => updateSelectedZone(Number(e.target.value))}
                            className="w-full accent-[#38bdf8]"
                            aria-label={`Målvärde för ${selectedZoneLabel}`}
                        />
                        <div className="flex justify-between items-center mt-2 text-xs">
                            <span className="text-[#64748b]">Nu: {selectedBaseline}</span>
                            <span className="text-[#1E293B] font-semibold">Mål: {selectedTarget} ({selectedDeltaRaw >= 0 ? `+${selectedDelta}` : `-${selectedDelta}`})</span>
                            <span className="text-[#64748b]">0-100</span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">Ingreppsstorlek</p>
                                <p className="text-sm font-semibold text-[#1E293B]">{interventionLevel}</p>
                            </div>
                            <div className="rounded-xl bg-[#fff7ed] border border-[#fed7aa] px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wide text-[#9a3412]">Risknivå</p>
                                <p className="text-sm font-semibold text-[#9a3412]">{riskLevel}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#64748b]">Alla zoner</p>
                        {ZONE_LABELS.map((zone) => {
                            const baseline = scores[zone.key];
                            const target = targetScores[zone.key];
                            const deltaRaw = target - baseline;
                            const deltaAbs = Math.abs(deltaRaw);
                            const isActive = selectedZone === zone.key;

                            return (
                                <button
                                    key={`slider-${zone.key}`}
                                    type="button"
                                    onClick={() => setSelectedZone(zone.key)}
                                    className={`w-full text-left rounded-2xl border p-3 transition-colors ${isActive ? 'border-[#93c5fd] bg-[#eff6ff]' : 'border-[#e2e8f0] bg-[#f8fafc]'
                                        }`}
                                >
                                    <div className="flex justify-between items-center mb-2 text-xs">
                                        <span className="font-semibold text-[#1E293B]">{zone.emoji} {zone.label}</span>
                                        <span className="text-[#64748b]">{baseline} → {target} ({deltaRaw >= 0 ? '+' : '-'}{deltaAbs})</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={target}
                                        onChange={(e) => {
                                            setSelectedZone(zone.key);
                                            updateZoneScore(zone.key, Number(e.target.value));
                                        }}
                                        className="w-full accent-[#38bdf8]"
                                        aria-label={`Målvärde för ${zone.label}`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <h3 className="text-xs font-semibold tracking-widest text-[#475569] uppercase mb-4 px-1">
                    Zonal Analys
                </h3>

                {ZONE_LABELS.map(({ key, label, emoji }, i) => {
                    const score = targetScores[key];
                    const baseline = scores[key];
                    const deltaRaw = score - baseline;
                    const deltaAbs = Math.abs(deltaRaw);
                    return (
                        <div
                            key={key}
                            className="metric-card rounded-2xl p-4 flex items-center justify-between animate-slide-up-fade group"
                            style={{ animationDelay: `${(i + 1) * 100}ms`, animationFillMode: 'forwards' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg border border-[#F1F5F9]">
                                    {emoji}
                                </div>
                                <div>
                                    <p className="text-[#1E293B] font-medium text-sm">{label}</p>
                                    <p className="text-[11px] text-[#64748b]">Ursprung {baseline} → Mål {score} ({deltaRaw >= 0 ? '+' : '-'}{deltaAbs})</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1 w-24 bg-[#f1f5f9] rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${score}%`,
                                                    backgroundColor: getScoreColor(score),
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <span className="text-xl font-light text-[#1E293B]">{score}</span>
                                <span className="text-[10px] text-[#94a3b8] font-medium ml-0.5">/100</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto px-6 pt-4 pb-8 w-full max-w-lg mx-auto z-10 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                <button
                    id="explore-clinics-btn"
                    onClick={() => onContinue(targetScores)}
                    className="group relative w-full overflow-hidden rounded-2xl py-4 mb-3 transition-all duration-300 btn-3d-glass bg-white text-[#0f172a]"
                >
                    <div className="absolute inset-0 bg-[#BBDEFB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Analysera Behandlingsval
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </span>
                </button>
                <button
                    id="scan-again-btn"
                    onClick={onReset}
                    className="w-full font-medium py-3.5 rounded-2xl transition-all duration-300 btn-3d-glass bg-white text-[#475569] hover:text-[#1E293B]"
                >
                    Gör en ny scanning
                </button>
            </div>
        </div>
    );
}
