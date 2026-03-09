'use client';

import type { ProportionScores } from '@/lib/faceAnalysis';
import { getInterventionLevel, getRiskLevel } from '@/lib/treatmentSimulation';

type FaceZone = keyof ProportionScores;

interface RecommendationsProps {
    baselineScores: ProportionScores;
    targetScores: ProportionScores;
    onBack: () => void;
    onContinue: () => void;
}

interface ProcedureRecommendation {
    id: string;
    name: string;
    why: string;
    whatItIs: string;
    risks: string[];
    zones: string[];
    icon: string;
    color: string;
    intervention: string;
    riskLevel: string;
    fromScore: number;
    toScore: number;
    delta: number;
}

const ZONE_META: Record<FaceZone, { label: string; icon: string; color: string }> = {
    forehead: { label: 'Panna', icon: '⬆', color: '#e2e8f0' },
    eyes: { label: 'Ögon', icon: '👁', color: '#e0f2fe' },
    nose: { label: 'Näsa', icon: '◆', color: '#dbeafe' },
    lips: { label: 'Läppar', icon: '◇', color: '#fce7f3' },
    jaw: { label: 'Käklinje', icon: '⬇', color: '#e0e7ff' },
};

function getProcedureTemplate(zone: FaceZone, delta: number) {
    const level = getInterventionLevel(delta);
    const commonSmall = ['Tillfällig svullnad', 'Ömhet 24-72 timmar'];
    const commonMedium = ['Svullnad 3-7 dagar', 'Ökad risk för blåmärken', 'Kan kräva återbesök för finjustering'];
    const commonLarge = ['Längre återhämtningstid', 'Högre komplikationsrisk', 'Kräver specialistbedömning och kirurgisk planering'];

    if (zone === 'nose') {
        if (level === 'Liten') {
            return {
                name: 'Näsprofil-justering (mild)',
                whatItIs: 'Icke-kirurgisk näsprofilering med filler för mindre konturförbättring.',
                risks: commonSmall,
            };
        }
        if (level === 'Medel') {
            return {
                name: 'Näsprofil-justering (moderat)',
                whatItIs: 'Kombinationsbehandling med strukturell planering för tydligare näsbalans.',
                risks: commonMedium,
            };
        }
        return {
            name: 'Kirurgisk näsplan (rhinoplastik-konsultation)',
            whatItIs: 'Kirurgisk konsultation för större formförändring och funktionell/estetisk optimering.',
            risks: commonLarge,
        };
    }

    if (zone === 'jaw') {
        if (level === 'Liten') {
            return {
                name: 'Käklinje-konturering (mild)',
                whatItIs: 'Mindre konturering med filler eller skin tightening för skarpare käklinje.',
                risks: commonSmall,
            };
        }
        if (level === 'Medel') {
            return {
                name: 'Käklinje-konturering (moderat)',
                whatItIs: 'Kombination av filler och trådlyft för tydligare definition.',
                risks: commonMedium,
            };
        }
        return {
            name: 'Käklinje-kirurgisk konsultation',
            whatItIs: 'Kirurgisk utvärdering för större strukturell förändring av nedre ansiktet.',
            risks: commonLarge,
        };
    }

    if (zone === 'lips') {
        if (level === 'Liten') {
            return {
                name: 'Läppharmonisering (mild)',
                whatItIs: 'Liten volymjustering för förbättrad balans och kontur.',
                risks: ['Tillfällig svullnad', 'Lätt asymmetri första dagarna'],
            };
        }
        if (level === 'Medel') {
            return {
                name: 'Läppharmonisering (moderat)',
                whatItIs: 'Stegvis volym- och formkorrigering med uppföljning.',
                risks: ['Svullnad och blåmärken', 'Kan behöva kompletterande behandling'],
            };
        }
        return {
            name: 'Avancerad läpprekonstruktion-konsultation',
            whatItIs: 'För större målbild rekommenderas specialistkonsultation och fler-stegsplan.',
            risks: commonLarge,
        };
    }

    if (zone === 'eyes') {
        if (level === 'Liten') {
            return {
                name: 'Periorbital finjustering (mild)',
                whatItIs: 'Mild förbättring kring ögonområdet med toxin/filler beroende på behov.',
                risks: ['Lätt ömhet', 'Tillfällig rodnad'],
            };
        }
        if (level === 'Medel') {
            return {
                name: 'Periorbital finjustering (moderat)',
                whatItIs: 'Kombinerad plan för rynkor, volym och vävnadsstöd runt ögonen.',
                risks: commonMedium,
            };
        }
        return {
            name: 'Ögonlocks-/periorbital kirurgisk konsultation',
            whatItIs: 'Vid större målbild krävs kirurgisk bedömning och detaljerad riskanalys.',
            risks: commonLarge,
        };
    }

    if (level === 'Liten') {
        return {
            name: 'Pannlinje-justering (mild)',
            whatItIs: 'Diskret behandling för mjukare uttryck och förbättrad pannbalans.',
            risks: ['Lätt ömhet', 'Tillfällig rodnad'],
        };
    }
    if (level === 'Medel') {
        return {
            name: 'Pannlinje-justering (moderat)',
            whatItIs: 'Kombinerad plan med toxin och hudkvalitetsbehandling.',
            risks: commonMedium,
        };
    }
    return {
        name: 'Pannkirurgisk konsultation',
        whatItIs: 'Större önskad förändring kräver kirurgisk specialistbedömning.',
        risks: commonLarge,
    };
}

function buildRecommendations(baselineScores: ProportionScores, targetScores: ProportionScores): ProcedureRecommendation[] {
    const zones: FaceZone[] = ['nose', 'jaw', 'lips', 'eyes', 'forehead'];
    const recs: ProcedureRecommendation[] = [];

    for (const zone of zones) {
        const fromScore = baselineScores[zone];
        const toScore = targetScores[zone];
        const rawDelta = toScore - fromScore;
        const delta = Math.abs(rawDelta);
        if (delta <= 0) continue;

        const template = getProcedureTemplate(zone, delta);
        const directionLabel = rawDelta >= 0 ? 'uppåt' : 'nedåt';
        recs.push({
            id: `${zone}-${fromScore}-${toScore}`,
            name: template.name,
            why: `${ZONE_META[zone].label}: du vill flytta från ${fromScore} till ${toScore} (${directionLabel} ${delta} steg). Större förändring kräver normalt större ingrepp.`,
            whatItIs: template.whatItIs,
            risks: template.risks,
            zones: [ZONE_META[zone].label],
            icon: ZONE_META[zone].icon,
            color: ZONE_META[zone].color,
            intervention: getInterventionLevel(delta),
            riskLevel: getRiskLevel(delta),
            fromScore,
            toScore,
            delta,
        });
    }

    if (recs.length === 0) {
        recs.push({
            id: 'maintenance',
            name: 'Underhållsplan',
            why: 'Du har inte ökat någon zon från baseline. Fokus blir underhåll och hudkvalitet.',
            whatItIs: 'Icke-invasiv plan med hudvård/skinbooster för att bevara nuvarande resultat.',
            risks: ['Milda och kortvariga reaktioner'],
            zones: ['Hela ansiktet'],
            icon: '🌟',
            color: '#e0f2f1',
            intervention: 'Ingen',
            riskLevel: 'Låg',
            fromScore: 0,
            toScore: 0,
            delta: 0,
        });
    }

    return recs;
}

function computeOverallRisk(baselineScores: ProportionScores, targetScores: ProportionScores): 'Låg' | 'Förhöjd' | 'Hög' {
    const weights: Record<FaceZone, number> = {
        forehead: 0.85,
        eyes: 1,
        nose: 1.25,
        lips: 1.1,
        jaw: 1.2,
    };

    const zones: FaceZone[] = ['forehead', 'eyes', 'nose', 'lips', 'jaw'];
    const weighted = zones.reduce((sum, zone) => {
        const delta = Math.abs(targetScores[zone] - baselineScores[zone]);
        return sum + (delta / 45) * weights[zone];
    }, 0);

    if (weighted < 0.65) return 'Låg';
    if (weighted < 1.45) return 'Förhöjd';
    return 'Hög';
}

export default function Recommendations({ baselineScores, targetScores, onBack, onContinue }: RecommendationsProps) {
    const recommendations = buildRecommendations(baselineScores, targetScores);
    const overallRisk = computeOverallRisk(baselineScores, targetScores);
    const totalDelta = (Object.keys(targetScores) as FaceZone[]).reduce(
        (acc, zone) => acc + Math.abs(targetScores[zone] - baselineScores[zone]),
        0
    );
    const adjustedZones = (Object.keys(targetScores) as FaceZone[]).filter(
        (zone) => targetScores[zone] !== baselineScores[zone]
    ).length;

    return (
        <div className="vf-page-base flex flex-col h-full overflow-y-auto pb-6 relative">
            <div className="absolute top-[-5%] right-[-5%] w-[50vw] h-[50vw] bg-[#E3F2FD] rounded-full blur-[100px] opacity-30 pointer-events-none" />

            <div className="relative pt-12 pb-8 px-6 animate-fade-in-up">
                <button
                    onClick={onBack}
                    className="mb-6 flex items-center gap-2 text-[#475569] text-sm font-medium py-2 px-4 rounded-xl btn-3d-glass bg-white/40 hover:text-[#1E293B] transition-all"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Tillbaka till analys
                </button>

                <h1 className="text-3xl font-light text-[#1E293B] tracking-tight mb-2">
                    Dynamisk Behandlingsplan
                </h1>
                <p className="text-[#475569] text-sm leading-relaxed max-w-sm">
                    Rekommendationerna följer dina valda målvärden. Högre ändring ger större ingrepp och ofta högre risknivå.
                </p>
            </div>

            <div className="px-6 mb-5">
                <div className="vf-surface rounded-2xl p-4 border border-[#dbeafe]">
                    <p className="text-[11px] uppercase tracking-widest text-[#64748b] font-semibold mb-2">Sammanfattning av val</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-white/70 border border-[#e2e8f0] py-2 px-2">
                            <p className="text-[10px] text-[#94a3b8] uppercase">Zoner ändrade</p>
                            <p className="text-lg font-semibold text-[#1E293B]">{adjustedZones}</p>
                        </div>
                        <div className="rounded-xl bg-white/70 border border-[#e2e8f0] py-2 px-2">
                            <p className="text-[10px] text-[#94a3b8] uppercase">Total ökning</p>
                            <p className="text-lg font-semibold text-[#1E293B]">+{totalDelta}</p>
                        </div>
                        <div className="rounded-xl bg-[#fff7ed] border border-[#fdba74] py-2 px-2">
                            <p className="text-[10px] text-[#9a3412] uppercase">Övergripande risk</p>
                            <p className="text-lg font-semibold text-[#9a3412]">{overallRisk}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-4">
                {recommendations.map((rec, i) => (
                    <div
                        key={rec.id}
                        className="vf-surface rounded-3xl p-6 animate-slide-up-fade"
                        style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: `${rec.color}88` }}>
                                {rec.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-[#1E293B]">{rec.name}</h3>
                                <div className="flex gap-1 mt-1">
                                    {rec.zones.map((z) => (
                                        <span key={z} className="text-[10px] font-bold text-[#475569] uppercase tracking-wider bg-[#F1F5F9] px-2 py-0.5 rounded-full">
                                            {z}
                                        </span>
                                    ))}
                                    {rec.delta > 0 && (
                                        <span className="text-[10px] font-bold text-[#1E293B] uppercase tracking-wider bg-[#e0f2fe] px-2 py-0.5 rounded-full">
                                            {rec.fromScore}→{rec.toScore}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <div className="rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wide text-[#94a3b8]">Ingreppsstorlek</p>
                                <p className="text-sm font-semibold text-[#1E293B]">{rec.intervention}</p>
                            </div>
                            <div className="rounded-xl bg-[#fff1f2] border border-[#fecdd3] px-3 py-2">
                                <p className="text-[10px] uppercase tracking-wide text-[#9f1239]">Risknivå</p>
                                <p className="text-sm font-semibold text-[#9f1239]">{rec.riskLevel}</p>
                            </div>
                        </div>

                        <p className="text-[#475569] text-sm mb-4 font-medium italic border-l-3 border-[#BBDEFB] pl-3 py-1">
                            &quot;{rec.why}&quot;
                        </p>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-widest mb-1.5 opacity-60">Vad det innebär</h4>
                                <p className="text-[#475569] text-sm leading-relaxed">{rec.whatItIs}</p>
                            </div>

                            <div className="bg-[#fff1f2] rounded-xl p-4 border border-[#fecdd3]/50">
                                <h4 className="text-xs font-bold text-[#e11d48] uppercase tracking-widest mb-2 flex items-center gap-1.5 text-red-600">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                        <line x1="12" y1="9" x2="12" y2="13"></line>
                                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                    </svg>
                                    Risker & Säkerhet
                                </h4>
                                <ul className="space-y-1">
                                    {rec.risks.map((risk, ri) => (
                                        <li key={ri} className="text-[#be123c] text-xs flex items-start gap-2">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-[#e11d48] flex-shrink-0" />
                                            {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 px-6 pb-8 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
                <button
                    onClick={onContinue}
                    className="group relative w-full overflow-hidden rounded-2xl py-4 transition-all duration-300 btn-3d-glass bg-white text-[#1E293B]"
                >
                    <div className="absolute inset-0 bg-[#BBDEFB]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        Hitta Klinik för Behandling
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </span>
                </button>
                <p className="text-center text-[10px] text-[#94a3b8] mt-4 max-w-[260px] mx-auto">
                    Rekommendationer är vägledande. Slutlig behandlingsplan och riskbedömning görs alltid av legitimerad kliniker.
                </p>
            </div>
        </div>
    );
}
