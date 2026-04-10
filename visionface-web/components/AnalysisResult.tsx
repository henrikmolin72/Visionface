'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AnalysisResult as AnalysisResultData, FaceLandmark } from '@/lib/faceAnalysis';
import { ETHNIC_PROFILES, type Ethnicity, type Gender, type Recommendation } from '@/lib/facialIdeals';

interface AnalysisResultProps {
    analysis: AnalysisResultData;
    beforeImage: string;
    landmarks: FaceLandmark[];
    ethnicity: Ethnicity;
    gender: Gender;
    onReset: () => void;
}

type ZoneKey = keyof AnalysisResultData['scores'];

// ── Animated counter hook ───────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, delay = 0): number {
    const [value, setValue] = useState(0);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const start = performance.now();
            startRef.current = start;
            const tick = (now: number) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // ease-out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.round(eased * target));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, delay);
        return () => clearTimeout(timeout);
    }, [target, duration, delay]);

    return value;
}

// ── SVG Icons per zone ───────────────────────────────────────────────────
function ZoneIcon({ zone, size = 18, color = 'currentColor' }: { zone: ZoneKey; size?: number; color?: string }) {
    const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

    switch (zone) {
        case 'forehead':
            return <svg {...props}><path d="M4 20C4 15 8 4 12 4s8 11 8 16" /><path d="M8 12h8" /></svg>;
        case 'eyes':
            return <svg {...props}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>;
        case 'nose':
            return <svg {...props}><path d="M12 2v14" /><path d="M8 20c0-2 1.5-4 4-4s4 2 4 4" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>;
        case 'lips':
            return <svg {...props}><path d="M5 14c0 3 3.5 6 7 6s7-3 7-6" /><path d="M5 14c0-1 1.5-3 7-3s7 2 7 3" /><path d="M5 14h14" /></svg>;
        case 'jaw':
            return <svg {...props}><path d="M4 8c0 0 1 12 8 14 7-2 8-14 8-14" /><path d="M4 8h16" /></svg>;
        case 'cheeks':
            return <svg {...props}><circle cx="8" cy="14" r="3" /><circle cx="16" cy="14" r="3" /><path d="M12 4v4" /></svg>;
        case 'symmetry':
            return <svg {...props}><line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3,2" /><path d="M8 6h-2a2 2 0 00-2 2v8a2 2 0 002 2h2" /><path d="M16 6h2a2 2 0 012 2v8a2 2 0 01-2 2h-2" /></svg>;
        default:
            return <svg {...props}><circle cx="12" cy="12" r="8" /></svg>;
    }
}

const ZONE_LABELS: { key: ZoneKey; label: string }[] = [
    { key: 'forehead', label: 'Panna' },
    { key: 'eyes', label: 'Ögon' },
    { key: 'nose', label: 'Näsa' },
    { key: 'lips', label: 'Läppar' },
    { key: 'jaw', label: 'Käklinje' },
    { key: 'cheeks', label: 'Kindben' },
    { key: 'symmetry', label: 'Symmetri' },
];

function getZonePositionsFromLandmarks(landmarks: FaceLandmark[]): Record<ZoneKey, { cx: number; cy: number }> {
    if (!landmarks || landmarks.length < 468) {
        return {
            forehead: { cx: 50, cy: 18 }, eyes: { cx: 50, cy: 38 }, nose: { cx: 50, cy: 52 },
            lips: { cx: 50, cy: 65 }, jaw: { cx: 50, cy: 80 }, cheeks: { cx: 30, cy: 48 },
            symmetry: { cx: 70, cy: 48 }, overall: { cx: 50, cy: 50 },
        };
    }

    const lm = (idx: number) => landmarks[idx];
    const mirror = (x: number) => (1 - x) * 100;
    const toY = (y: number) => y * 100;
    const avg = (...pts: FaceLandmark[]) => ({
        cx: pts.reduce((s, p) => s + mirror(p.x), 0) / pts.length,
        cy: pts.reduce((s, p) => s + toY(p.y), 0) / pts.length,
    });

    const forehead = { cx: mirror(lm(10).x), cy: toY(lm(10).y) };
    const leftEyeCenter = avg(lm(33), lm(133), lm(159), lm(145));
    const rightEyeCenter = avg(lm(263), lm(362), lm(386), lm(374));
    const eyes = { cx: (leftEyeCenter.cx + rightEyeCenter.cx) / 2, cy: (leftEyeCenter.cy + rightEyeCenter.cy) / 2 };
    const nose = { cx: mirror(lm(4).x), cy: toY(lm(4).y) };
    const lips = avg(lm(13), lm(14), lm(0));
    const jaw = { cx: mirror(lm(152).x), cy: toY(lm(152).y) };
    const cheeks = { cx: mirror(lm(116).x), cy: toY(lm(116).y) };
    const symmetry = { cx: mirror(lm(345).x), cy: toY(lm(345).y) };

    return { forehead, eyes, nose, lips, jaw, cheeks, symmetry, overall: { cx: 50, cy: 50 } };
}

function getScoreColor(score: number): string {
    if (score >= 85) return '#2dd4a8';
    if (score >= 70) return '#5eead4';
    if (score >= 55) return '#e8b931';
    return '#f87171';
}

function getScoreLabel(score: number): string {
    if (score >= 90) return 'Utmärkt';
    if (score >= 80) return 'Mycket bra';
    if (score >= 70) return 'Bra';
    if (score >= 55) return 'Godtagbart';
    return 'Förbättringsbar';
}

function getSeverityColor(severity: Recommendation['severity']): string {
    if (severity === 'mild') return '#2dd4a8';
    if (severity === 'moderate') return '#e8b931';
    return '#f87171';
}

function getSeverityLabel(severity: Recommendation['severity']): string {
    if (severity === 'mild') return 'Mild';
    if (severity === 'moderate') return 'Måttlig';
    return 'Betydande';
}

// ── Interactive face illustration ────────────────────────────────────────
function FaceIllustration({
    selectedZone, onSelectZone, scores, beforeImage, zonePositions,
}: {
    selectedZone: ZoneKey | null; onSelectZone: (zone: ZoneKey) => void;
    scores: AnalysisResultData['scores']; beforeImage: string;
    zonePositions: Record<ZoneKey, { cx: number; cy: number }>;
}) {
    const zones = ZONE_LABELS.filter(z => z.key !== 'overall');

    return (
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#111110] border border-[#2a2a28]">
            {beforeImage && (
                <img src={beforeImage} alt="Ansiktsbild" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#111110]/40 via-[#111110]/10 to-[#111110]/70" />

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {zones.map(({ key, label }) => {
                    const pos = zonePositions[key];
                    if (!pos) return null;
                    const isSelected = selectedZone === key;
                    const score = scores[key];
                    const color = getScoreColor(score);
                    const r = isSelected ? 4 : 2.5;

                    return (
                        <g key={key} className="cursor-pointer" onClick={() => onSelectZone(key)}>
                            {isSelected && (
                                <circle cx={pos.cx} cy={pos.cy} r={r + 2} fill="none" stroke={color} strokeWidth="0.5" opacity="0.5">
                                    <animate attributeName="r" values={`${r + 2};${r + 4};${r + 2}`} dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                            )}
                            <circle cx={pos.cx} cy={pos.cy} r={r + 0.8}
                                fill={isSelected ? color + '30' : 'transparent'}
                                stroke={isSelected ? color : 'rgba(255,255,255,0.3)'}
                                strokeWidth={isSelected ? 0.6 : 0.3}
                            />
                            <circle cx={pos.cx} cy={pos.cy} r={isSelected ? 2 : 1.3} fill={color} opacity={isSelected ? 1 : 0.85} />

                            {isSelected && (
                                <>
                                    <line x1={pos.cx} y1={pos.cy} x2={pos.cx > 50 ? 90 : 10} y2={pos.cy}
                                        stroke={color} strokeWidth="0.3" strokeDasharray="1,0.8" opacity="0.6" />
                                    <rect x={pos.cx > 50 ? 78 : 2} y={pos.cy - 4} width="20" height="8" rx="1.5"
                                        fill="#111110" fillOpacity="0.85" stroke={color} strokeWidth="0.3" strokeOpacity="0.5" />
                                    <text x={pos.cx > 50 ? 88 : 12} y={pos.cy + 1} textAnchor="middle"
                                        fill="white" fontSize="3" fontWeight="600" className="select-none">
                                        {label} {score}
                                    </text>
                                </>
                            )}
                        </g>
                    );
                })}
            </svg>

            {selectedZone && selectedZone !== 'overall' && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-[#111110]/85 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                    <div className="flex items-center gap-2">
                        <ZoneIcon zone={selectedZone} size={16} color={getScoreColor(scores[selectedZone])} />
                        <span className="text-xs font-semibold text-white">
                            {ZONE_LABELS.find(z => z.key === selectedZone)?.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold" style={{ color: getScoreColor(scores[selectedZone]) }}>
                            {scores[selectedZone]}
                        </span>
                        <span className="text-[10px] text-white/50">/100</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AnalysisResult({
    analysis, beforeImage, landmarks, ethnicity, gender, onReset,
}: AnalysisResultProps) {
    const router = useRouter();
    const { scores, recommendations } = analysis;
    const profile = ETHNIC_PROFILES[ethnicity];
    const [selectedZone, setSelectedZone] = useState<ZoneKey | null>(null);
    const overallCount = useCountUp(scores.overall, 1400, 300);

    const openConsultation = () => {
        const summary = {
            overallScore: scores.overall,
            ethnicity,
            scores: Object.fromEntries(
                Object.entries(scores).filter(([k]) => k !== 'overall')
            ),
            recommendations: recommendations.map((r) => ({
                zone: r.zone,
                procedure: r.label,
                severity: r.severity,
            })),
        };
        sessionStorage.setItem('vf_scan_for_consultation', JSON.stringify(summary));
        router.push('/main/consultation');
    };

    const sortedRecs = useMemo(() => {
        const order: Record<string, number> = { significant: 0, moderate: 1, mild: 2 };
        return [...recommendations].sort((a, b) => order[a.severity] - order[b.severity]);
    }, [recommendations]);

    const recZones = useMemo(() => new Set(sortedRecs.map(r => r.zone)), [sortedRecs]);
    const zonePositions = useMemo(() => getZonePositionsFromLandmarks(landmarks), [landmarks]);

    return (
        <div className="flex flex-col h-full overflow-y-auto pb-6 relative">
            {/* Header */}
            <div className="relative pt-12 pb-8 px-6 flex flex-col items-center border-b border-[#d6d3cd]/40 bg-white/50 backdrop-blur-3xl animate-slide-up-fade">
                <p className="vf-kicker mb-1">
                    {profile.label} • {gender === 'female' ? 'Kvinna' : 'Man'}
                </p>
                <p className="vf-kicker mb-4">Klinisk Rapport</p>

                <div className="relative w-32 h-32 flex items-center justify-center mb-4 animate-scale-in" style={{ animationDelay: '200ms' }}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="#e7e5e2" strokeWidth="1.5" />
                        <circle
                            cx="50" cy="50" r="46"
                            fill="none"
                            stroke={getScoreColor(scores.overall)}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="289.026"
                            strokeDashoffset={289.026 - (289.026 * scores.overall) / 100}
                            className="transition-all duration-[1400ms] ease-out"
                            style={{ filter: `drop-shadow(0 0 6px ${getScoreColor(scores.overall)}40)` }}
                        />
                    </svg>
                    <div className="text-center">
                        <span className="text-5xl font-light text-[#1a1a1a] tracking-tighter">{overallCount}</span>
                    </div>
                </div>

                <p className="text-sm text-center" style={{ color: 'var(--vf-copy)' }}>
                    Harmonipoäng — <span className="font-medium text-[#1a1a1a]">{getScoreLabel(scores.overall)}</span>
                </p>
            </div>

            <div className="px-6 pt-6 pb-4 space-y-5 z-10 w-full max-w-lg mx-auto">
                {/* Face illustration + Zone analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up-fade">
                    <div>
                        <h3 className="vf-kicker mb-3">Ansiktsanalys</h3>
                        <FaceIllustration
                            selectedZone={selectedZone} onSelectZone={setSelectedZone}
                            scores={scores} beforeImage={beforeImage} zonePositions={zonePositions}
                        />
                        <p className="text-[10px] mt-2 text-center" style={{ color: '#a8a29e' }}>
                            Tryck på en markör eller zon för att markera
                        </p>
                    </div>

                    <div>
                        <h3 className="vf-kicker mb-3">Zonanalys</h3>
                        <div className="space-y-2">
                            {ZONE_LABELS.map(({ key, label }, i) => {
                                if (key === 'overall') return null;
                                const score = scores[key];
                                const isSelected = selectedZone === key;
                                const hasRec = recZones.has(key);

                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedZone(isSelected ? null : key)}
                                        className={`w-full vf-surface vf-card-hover rounded-xl p-3 flex items-center justify-between transition-all duration-200 animate-reveal-card ${
                                            isSelected ? 'ring-2 scale-[1.02] shadow-md' : ''
                                        }`}
                                        style={{
                                            animationDelay: `${(i + 2) * 80}ms`,
                                            '--tw-ring-color': isSelected ? getScoreColor(score) : undefined,
                                        } as React.CSSProperties}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
                                                style={{
                                                    borderColor: isSelected ? getScoreColor(score) : '#e7e5e2',
                                                    backgroundColor: isSelected ? getScoreColor(score) + '15' : 'white',
                                                }}
                                            >
                                                <ZoneIcon zone={key} size={18} color={isSelected ? getScoreColor(score) : '#78766f'} />
                                            </div>
                                            <div className="text-left">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[#1a1a1a] font-medium text-sm">{label}</p>
                                                    {hasRec && <span className="w-1.5 h-1.5 rounded-full bg-[#e8b931]" />}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <div className="h-1 w-16 bg-[#e7e5e2] rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full animate-score-fill"
                                                            style={{ '--target-width': `${score}%`, backgroundColor: getScoreColor(score) } as React.CSSProperties}
                                                        />
                                                    </div>
                                                    <span className="text-[10px]" style={{ color: 'var(--vf-copy)' }}>{getScoreLabel(score)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-light text-[#1a1a1a]">{score}</span>
                                            <span className="text-[10px] font-medium ml-0.5" style={{ color: '#a8a29e' }}>/100</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {sortedRecs.length > 0 && (
                    <div className="animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
                        <h3 className="vf-kicker mb-3">Rekommendationer</h3>
                        <div className="space-y-3">
                            {sortedRecs.map((rec, i) => {
                                const isHighlighted = selectedZone === rec.zone;
                                return (
                                    <button
                                        key={`${rec.procedure}-${i}`}
                                        type="button"
                                        onClick={() => setSelectedZone(rec.zone as ZoneKey)}
                                        className={`w-full text-left vf-surface vf-card-hover rounded-2xl p-4 border-l-4 transition-all duration-200 animate-reveal-card ${
                                            isHighlighted ? 'ring-1 ring-[#2dd4a8]/40 shadow-md scale-[1.01]' : ''
                                        }`}
                                        style={{
                                            borderLeftColor: getSeverityColor(rec.severity),
                                            animationDelay: `${(i + 6) * 80}ms`,
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                                style={{ backgroundColor: getSeverityColor(rec.severity) + '18' }}
                                            >
                                                <ZoneIcon zone={rec.zone as ZoneKey} size={16} color={getSeverityColor(rec.severity)} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-semibold text-[#1a1a1a]">{rec.label}</h4>
                                                    <span
                                                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                                        style={{
                                                            backgroundColor: getSeverityColor(rec.severity) + '20',
                                                            color: rec.severity === 'mild' ? '#134e4a' : rec.severity === 'moderate' ? '#92400e' : '#991b1b',
                                                        }}
                                                    >
                                                        {getSeverityLabel(rec.severity)}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--vf-copy)' }}>{rec.description}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {sortedRecs.length === 0 && (
                    <div className="vf-surface rounded-2xl p-6 text-center animate-scale-in">
                        <p className="text-lg font-light text-[#1a1a1a] mb-2">Utmärkta proportioner</p>
                        <p className="text-sm" style={{ color: 'var(--vf-copy)' }}>
                            Dina ansiktsproportioner ligger inom idealintervallet.
                        </p>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="bg-[#fefce8] border border-[#fef3c7] rounded-xl p-3 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
                    <p className="text-[10px] text-[#92400e] leading-relaxed">
                        <strong>Disclaimer:</strong> Denna analys baseras på statistiska tendenser från publicerad forskning
                        och utgör inte medicinsk rådgivning. Skönhet är subjektivt. Konsultera alltid en legitimerad specialist
                        innan eventuella ingrepp.
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-auto px-6 pt-4 pb-8 w-full max-w-lg mx-auto z-10 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
                <button
                    onClick={openConsultation}
                    className="group w-full rounded-2xl py-4 mb-3 transition-all duration-300 bg-[#134e4a] text-white shadow-lg hover:bg-[#0d3d38] hover:shadow-xl"
                >
                    <span className="flex items-center justify-center gap-2">
                        Fråga AI-konsulten
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                    </span>
                </button>
                <button
                    onClick={() => router.push('/main/clinics')}
                    className="group w-full rounded-2xl py-3.5 mb-3 transition-all duration-300 bg-white border border-[#d6d3cd]/60 text-[#134e4a] font-semibold hover:border-[#2dd4a8]/40 shadow-sm hover:shadow-md"
                >
                    <span className="flex items-center justify-center gap-2">
                        Hitta kliniker
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </span>
                </button>
                <button
                    onClick={onReset}
                    className="w-full font-medium py-3.5 rounded-2xl transition-all duration-300 bg-white border border-[#d6d3cd]/60 text-[#52524e] hover:text-[#1a1a1a] hover:border-[#2dd4a8]/30 shadow-sm"
                >
                    Ny scanning
                </button>
            </div>
        </div>
    );
}
