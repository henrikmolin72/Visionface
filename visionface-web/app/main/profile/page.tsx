'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Link from 'next/link';

interface ScanRecord {
    id: string;
    date: string;
    score: number;
    ethnicity: string;
    topRec: string;
}

const ETHNICITY_LABELS: Record<string, string> = {
    caucasian: 'Kaukasisk',
    eastAsian: 'Östasiatisk',
    southAsian: 'Sydasiatisk',
    african: 'Afrikansk',
    middleEastern: 'Mellanöstern',
    hispanic: 'Latinamerikansk',
};

const MOCK_SCANS: ScanRecord[] = [
    { id: '1', date: '2026-04-08', score: 74, ethnicity: 'caucasian', topRec: 'Läppfiller' },
    { id: '2', date: '2026-03-15', score: 70, ethnicity: 'caucasian', topRec: 'Botox' },
    { id: '3', date: '2026-02-20', score: 68, ethnicity: 'caucasian', topRec: 'Läppfiller' },
];

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
    const r = size / 2 - 4;
    const circ = 2 * Math.PI * r;
    const offset = circ - (circ * score) / 100;
    const color = score >= 80 ? '#2dd4a8' : score >= 65 ? '#5eead4' : '#e8b931';
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e7e5e2" strokeWidth="2.5" />
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
            <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#1a1a1a">
                {score}
            </text>
        </svg>
    );
}

function PrivacySettings() {
    const [settings, setSettings] = useState({
        shareAnonymous: false,
        storeScans: true,
        analyticsOptIn: false,
    });

    const toggle = (key: keyof typeof settings) =>
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    const items = [
        { key: 'storeScans' as const, label: 'Spara skanningar lokalt', desc: 'Behåll historik på den här enheten' },
        { key: 'shareAnonymous' as const, label: 'Bidra anonymt till community', desc: 'Delar avidentifierade poäng till galleriet' },
        { key: 'analyticsOptIn' as const, label: 'Förbättringsanalys', desc: 'Hjälp oss förbättra AI-modellen' },
    ];

    return (
        <div className="vf-surface p-5 space-y-3">
            <p className="vf-kicker mb-1">Integritet</p>
            <h2 className="text-lg font-semibold vf-heading mb-3">Datakontroll</h2>
            {items.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-4 py-2 border-b border-[#e7e5e2] last:border-0">
                    <div>
                        <p className="text-sm font-medium text-[#0f172a]">{item.label}</p>
                        <p className="text-[11px] vf-copy">{item.desc}</p>
                    </div>
                    <button
                        onClick={() => toggle(item.key)}
                        className="relative w-11 h-6 rounded-full transition-colors shrink-0"
                        style={{ backgroundColor: settings[item.key] ? '#2dd4a8' : '#e7e5e2' }}
                        role="switch"
                        aria-checked={settings[item.key]}
                    >
                        <span
                            className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                            style={{ transform: settings[item.key] ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                    </button>
                </div>
            ))}
            <button className="mt-2 w-full text-[12px] text-[#991b1b] font-medium py-2.5 rounded-xl border border-[#fecaca] bg-[#fff1f2] hover:bg-[#ffe4e6] transition-colors">
                Radera alla skanningar
            </button>
        </div>
    );
}

export default function ProfilePage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'history' | 'privacy'>('history');

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('[data-profile-reveal]', { autoAlpha: 0, y: 22 }, {
                autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out',
            });
        }, root);
        return () => ctx.revert();
    }, []);

    const latestScore = MOCK_SCANS[0]?.score ?? 0;
    const trend = MOCK_SCANS.length >= 2
        ? MOCK_SCANS[0].score - MOCK_SCANS[MOCK_SCANS.length - 1].score
        : 0;

    return (
        <div ref={rootRef} className="min-h-[calc(100vh-5rem)] px-4 md:px-6 pb-8">
            <div className="vf-page-container max-w-xl flex flex-col gap-4">

                {/* User card */}
                <div data-profile-reveal className="vf-surface p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-[linear-gradient(160deg,#ffffff_0%,#dff4ff_100%)] border border-[#bae6fd] flex items-center justify-center shadow-[0_10px_18px_rgba(14,165,233,0.16)]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-[#0f172a]">Anonym Användare</p>
                            <p className="text-sm vf-copy">Inget konto krävs</p>
                        </div>
                    </div>
                </div>

                {/* Stats row */}
                <div data-profile-reveal className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Skanningar', value: MOCK_SCANS.length },
                        { label: 'Senaste', value: latestScore },
                        { label: 'Trend', value: trend >= 0 ? `+${trend}` : `${trend}` },
                    ].map((s) => (
                        <div key={s.label} className="vf-surface p-4 text-center">
                            <p className="text-2xl font-light text-[#0f172a]">{s.value}</p>
                            <p className="text-[11px] vf-copy mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div data-profile-reveal className="flex gap-1 p-1 bg-[#f3f0eb] rounded-[1.1rem]">
                    {[
                        { key: 'history' as const, label: 'Skanhistorik' },
                        { key: 'privacy' as const, label: 'Integritet' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="flex-1 py-2 rounded-[0.9rem] text-sm font-medium transition-all"
                            style={{
                                backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                                color: activeTab === tab.key ? '#0f172a' : '#52524e',
                                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(26,26,26,0.08)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Scan history */}
                {activeTab === 'history' && (
                    <div data-profile-reveal className="space-y-3">
                        {MOCK_SCANS.map((scan, i) => (
                            <div key={scan.id} className="vf-surface p-4 flex items-center gap-4 vf-card-hover">
                                <ScoreRing score={scan.score} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#0f172a]">
                                        {new Date(scan.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
                                    </p>
                                    <p className="text-[11px] vf-copy truncate">
                                        {ETHNICITY_LABELS[scan.ethnicity]} · Topp: {scan.topRec}
                                    </p>
                                </div>
                                {i === 0 && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f0fdf8] text-[#0d9373] border border-[#2dd4a8]/30 font-semibold shrink-0">
                                        Senaste
                                    </span>
                                )}
                                {i > 0 && (
                                    <span className={`text-xs font-medium shrink-0 ${scan.score < MOCK_SCANS[i - 1].score ? 'text-[#e8b931]' : 'text-[#2dd4a8]'}`}>
                                        {scan.score < MOCK_SCANS[i - 1].score ? '▼' : '▲'} {Math.abs(scan.score - MOCK_SCANS[i - 1].score)}
                                    </span>
                                )}
                            </div>
                        ))}
                        <Link
                            href="/main/scan"
                            className="block text-center py-4 vf-surface vf-card-hover text-sm font-semibold text-[#134e4a] hover:text-[#0d9373]"
                        >
                            + Ny skanning
                        </Link>
                    </div>
                )}

                {/* Privacy settings */}
                {activeTab === 'privacy' && (
                    <div data-profile-reveal>
                        <PrivacySettings />
                    </div>
                )}

                {/* Menu items */}
                <div data-profile-reveal className="space-y-2">
                    {[
                        { label: 'Community Gallery', icon: '◈', href: '/main/gallery' },
                        { label: 'Om VisionFace', icon: '◎', href: '#' },
                        { label: 'Användarvillkor', icon: '📄', href: '#' },
                        { label: 'Kontakta oss', icon: '✉', href: '#' },
                    ].map((item) => (
                        item.href === '#' ? (
                            <button
                                key={item.label}
                                className="vf-surface w-full flex items-center justify-between px-5 py-4 transition-colors text-left hover:border-[#bae6fd] vf-card-hover"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-[#0f172a] font-medium">{item.label}</span>
                                </div>
                                <span className="text-[#64748b]">→</span>
                            </button>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="vf-surface flex items-center justify-between px-5 py-4 transition-colors hover:border-[#bae6fd] vf-card-hover"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="text-[#0f172a] font-medium">{item.label}</span>
                                </div>
                                <span className="text-[#64748b]">→</span>
                            </Link>
                        )
                    ))}
                </div>

                <div data-profile-reveal className="p-4 vf-surface rounded-2xl border-[#fbcfe8] bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(252,231,243,0.55)_100%)]">
                    <p className="text-[#6b7280] text-sm text-center leading-6">
                        All tidsbokning sker externt. VisionFace hanterar inga betalningar eller bokningar direkt.
                    </p>
                </div>
            </div>
        </div>
    );
}
