'use client';

import { Activity, CalendarClock, RefreshCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const DIAGNOSTIC_METRICS = [
    { label: 'Nasal Projection', value: '55 / 100', trend: '+18 target' },
    { label: 'Orbital Symmetry', value: '72 / 100', trend: '+10 target' },
    { label: 'Jawline Definition', value: '63 / 100', trend: '+22 target' },
    { label: 'Lip Volume Balance', value: '69 / 100', trend: '+8 target' },
];

const TYPEWRITER_LINES = [
    'Distributing specialist insight to every patient journey.',
    'Clinical-grade face intelligence in a premium interface.',
    'Bridging scan, simulation, and treatment decisions instantly.',
];

function getSchedulerSummary(intensity: number) {
    if (intensity <= 35) {
        return {
            size: 'Liten justering',
            sessions: '1 session + kontroll',
            risk: 'Låg',
        };
    }
    if (intensity <= 70) {
        return {
            size: 'Moderat plan',
            sessions: '2-3 sessioner + uppföljning',
            risk: 'Förhöjd',
        };
    }
    return {
        size: 'Större förändring',
        sessions: 'Kirurgisk konsult + fler-stegsplan',
        risk: 'Hög',
    };
}

export default function Features() {
    const [metricIndex, setMetricIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [lineIndex, setLineIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [intensity, setIntensity] = useState(58);

    useEffect(() => {
        const line = TYPEWRITER_LINES[lineIndex];
        if (charIndex <= line.length) {
            const timer = window.setTimeout(() => {
                setTypedText(line.slice(0, charIndex));
                setCharIndex((prev) => prev + 1);
            }, 28);
            return () => window.clearTimeout(timer);
        }

        const pause = window.setTimeout(() => {
            setCharIndex(0);
            setTypedText('');
            setLineIndex((prev) => (prev + 1) % TYPEWRITER_LINES.length);
        }, 1400);

        return () => window.clearTimeout(pause);
    }, [charIndex, lineIndex]);

    const currentMetric = DIAGNOSTIC_METRICS[metricIndex];
    const scheduler = useMemo(() => getSchedulerSummary(intensity), [intensity]);

    return (
        <section id="features" className="relative py-20 md:py-28">
            <div className="mx-auto w-[min(94vw,1180px)]">
                <div data-reveal className="max-w-2xl mb-8 md:mb-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0e7490]">
                        The Clinical Boutique Core
                    </p>
                    <h2 className="mt-3 font-[var(--font-sora)] text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[1.03] tracking-[-0.03em] text-[#0f172a]">
                        Three Interfaces, One Precision Loop
                    </h2>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    <article data-reveal className="vf-feature-card">
                        <div className="flex items-start justify-between mb-4">
                            <div className="vf-feature-icon"><Activity size={18} /></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
                                Diagnostic Shuffler
                            </span>
                        </div>
                        <p className="text-sm text-[#475569] leading-relaxed mb-4">
                            Shuffle zone telemetry to pressure-test clinical precision before consultation.
                        </p>
                        <div className="rounded-[1.15rem] border border-[#dbeafe] bg-[#f0f9ff] p-4">
                            <p className="text-[12px] uppercase tracking-wide text-[#64748b]">{currentMetric.label}</p>
                            <p className="mt-1 text-2xl font-semibold text-[#0f172a]">{currentMetric.value}</p>
                            <p className="text-[12px] text-[#0e7490] font-semibold">{currentMetric.trend}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setMetricIndex((prev) => (prev + 1) % DIAGNOSTIC_METRICS.length)}
                            className="vf-magnetic mt-4 inline-flex items-center gap-2 rounded-[1rem] border border-[#cbd5e1] bg-white px-3 py-2 text-[13px] font-semibold text-[#0f172a]"
                        >
                            <RefreshCcw size={14} />
                            Shuffle Metric
                        </button>
                    </article>

                    <article data-reveal className="vf-feature-card">
                        <div className="flex items-start justify-between mb-4">
                            <div className="vf-feature-icon"><Sparkles size={18} /></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
                                Telemetry Typewriter
                            </span>
                        </div>
                        <p className="text-sm text-[#475569] leading-relaxed mb-4">
                            VisionFace turns technical depth into language patients can trust instantly.
                        </p>
                        <div className="rounded-[1.15rem] border border-[#dbeafe] bg-white p-4 min-h-[150px]">
                            <p className="text-[11px] uppercase tracking-wide text-[#94a3b8] mb-2">
                                Live message stream
                            </p>
                            <p className="text-[15px] leading-relaxed text-[#1e293b]">
                                {typedText}
                                <span className="inline-block ml-0.5 h-[1em] w-[1px] bg-[#0e7490] animate-pulse align-middle" />
                            </p>
                        </div>
                    </article>

                    <article data-reveal className="vf-feature-card">
                        <div className="flex items-start justify-between mb-4">
                            <div className="vf-feature-icon"><CalendarClock size={18} /></div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748b]">
                                Cursor Protocol Scheduler
                            </span>
                        </div>
                        <p className="text-sm text-[#475569] leading-relaxed mb-4">
                            Adjust intervention intensity and preview pathway depth, session load, and risk profile.
                        </p>
                        <div className="rounded-[1.15rem] border border-[#dbeafe] bg-white p-4">
                            <div className="flex items-center justify-between mb-2 text-[12px] text-[#64748b]">
                                <span>Intervention Intensity</span>
                                <span className="font-semibold text-[#0f172a]">{intensity}</span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={intensity}
                                onChange={(event) => setIntensity(Number(event.target.value))}
                                className="w-full accent-[#0ea5e9]"
                                aria-label="Intervention intensity"
                            />
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                <div className="rounded-[0.9rem] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-2">
                                    <p className="text-[10px] uppercase text-[#94a3b8]">Scope</p>
                                    <p className="text-[12px] font-semibold text-[#0f172a]">{scheduler.size}</p>
                                </div>
                                <div className="rounded-[0.9rem] bg-[#f8fafc] border border-[#e2e8f0] px-2 py-2">
                                    <p className="text-[10px] uppercase text-[#94a3b8]">Flow</p>
                                    <p className="text-[12px] font-semibold text-[#0f172a]">{scheduler.sessions}</p>
                                </div>
                                <div className="rounded-[0.9rem] bg-[#fff7ed] border border-[#fed7aa] px-2 py-2">
                                    <p className="text-[10px] uppercase text-[#9a3412]">Risk</p>
                                    <p className="text-[12px] font-semibold text-[#9a3412]">{scheduler.risk}</p>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
