'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface GalleryEntry {
    id: string;
    initials: string;
    age: number;
    procedure: string;
    beforeScore: number;
    afterScore: number;
    verified: boolean;
    monthsAgo: number;
    note: string;
    color: string;
}

const GALLERY: GalleryEntry[] = [
    { id: '1', initials: 'A.L', age: 29, procedure: 'Läppfiller', beforeScore: 61, afterScore: 78, verified: true, monthsAgo: 2, note: 'Naturligt resultat, nöjd med symmetrin.', color: '#fecdd3' },
    { id: '2', initials: 'M.S', age: 34, procedure: 'Botox', beforeScore: 55, afterScore: 72, verified: true, monthsAgo: 4, note: 'Minskad rynkdjup på panna och kråksparkar.', color: '#bae6fd' },
    { id: '3', initials: 'K.B', age: 41, procedure: 'Kindben', beforeScore: 64, afterScore: 81, verified: false, monthsAgo: 6, note: 'Mer markerad ansiktskontour.', color: '#bbf7d0' },
    { id: '4', initials: 'E.H', age: 26, procedure: 'Rhinoplasty', beforeScore: 58, afterScore: 79, verified: true, monthsAgo: 8, note: 'Näsprojektionen förbättrades avsevärt.', color: '#c4b5fd' },
    { id: '5', initials: 'P.A', age: 37, procedure: 'Trådlyft', beforeScore: 60, afterScore: 76, verified: true, monthsAgo: 3, note: 'Mjukare lyft längs käklinjen.', color: '#fde68a' },
    { id: '6', initials: 'J.K', age: 31, procedure: 'Hakförstärkning', beforeScore: 57, afterScore: 74, verified: false, monthsAgo: 10, note: 'Bättre balans i ansiktsprofilen.', color: '#a5f3fc' },
];

const ALL_PROCEDURES = ['Alla', ...Array.from(new Set(GALLERY.map(g => g.procedure)))];

function ScoreDelta({ before, after }: { before: number; after: number }) {
    const delta = after - before;
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-[#52524e]">{before}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2dd4a8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
            </svg>
            <span className="font-bold text-[#0d9373]">{after}</span>
            <span className="font-semibold text-[#2dd4a8]">+{delta}</span>
        </div>
    );
}

export default function GalleryPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [filter, setFilter] = useState('Alla');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('[data-gallery-reveal]', { autoAlpha: 0, y: 28 }, {
                autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            });
        }, root);
        return () => ctx.revert();
    }, []);

    const filtered = GALLERY.filter((g) => {
        if (filter !== 'Alla' && g.procedure !== filter) return false;
        if (verifiedOnly && !g.verified) return false;
        return true;
    });

    const avgDelta = filtered.length
        ? Math.round(filtered.reduce((s, g) => s + (g.afterScore - g.beforeScore), 0) / filtered.length)
        : 0;

    return (
        <div ref={rootRef} className="min-h-[calc(100vh-5rem)] px-4 md:px-6 pb-8">
            <div className="vf-page-container max-w-6xl flex flex-col gap-4">

                {/* Hero */}
                <section data-gallery-reveal className="vf-hero-shot min-h-[180px] p-5 md:p-7">
                    <div className="vf-hero-shot-media" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80')" }} />
                    <div className="vf-hero-shot-overlay" />
                    <div className="vf-hero-shot-content h-full flex flex-col justify-end">
                        <p className="vf-kicker text-[#b9eaff]">Community Gallery</p>
                        <h1 className="mt-1 text-[clamp(1.8rem,4vw,3rem)] leading-tight font-[var(--font-sora)] text-[#e8f7ff]">
                            Riktiga resultat.
                            <span className="block vf-dramatic text-[clamp(2rem,5vw,4rem)] text-[#d6f2ff]">Verkliga förändringar.</span>
                        </h1>
                    </div>
                </section>

                {/* Stats */}
                <section data-gallery-reveal className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Inlägg', value: filtered.length },
                        { label: 'Verifierade', value: filtered.filter(g => g.verified).length },
                        { label: 'Snitt förbättring', value: `+${avgDelta}` },
                    ].map((s) => (
                        <div key={s.label} className="vf-surface p-4 text-center">
                            <p className="text-2xl font-light text-[#0f172a]">{s.value}</p>
                            <p className="text-[11px] vf-copy mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </section>

                {/* Filters */}
                <section data-gallery-reveal className="flex flex-wrap gap-2 items-center">
                    {ALL_PROCEDURES.map((p) => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                            style={{
                                borderColor: filter === p ? '#134e4a' : '#e2e0dc',
                                backgroundColor: filter === p ? '#134e4a' : 'white',
                                color: filter === p ? 'white' : '#52524e',
                            }}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors ml-1"
                        style={{
                            borderColor: verifiedOnly ? '#2dd4a8' : '#e2e0dc',
                            backgroundColor: verifiedOnly ? '#f0fdf8' : 'white',
                            color: verifiedOnly ? '#0d9373' : '#52524e',
                        }}
                    >
                        ✓ Verifierade
                    </button>
                </section>

                {/* Grid */}
                <section data-gallery-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((entry) => (
                        <article key={entry.id} className="vf-surface p-5 vf-card-hover">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-11 h-11 rounded-[0.9rem] flex items-center justify-center text-sm font-bold text-[#1a1a1a] border border-white/80"
                                        style={{ backgroundColor: entry.color + '88' }}
                                    >
                                        {entry.initials}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-[#0f172a]">{entry.age} år</p>
                                        <p className="text-[11px] vf-copy">{entry.monthsAgo}mån sedan</p>
                                    </div>
                                </div>
                                {entry.verified && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f0fdf8] text-[#0d9373] border border-[#2dd4a8]/30">
                                        ✓ Verifierad
                                    </span>
                                )}
                            </div>

                            <div className="mb-3">
                                <span
                                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: entry.color + '55', color: '#1a1a1a' }}
                                >
                                    {entry.procedure}
                                </span>
                            </div>

                            <ScoreDelta before={entry.beforeScore} after={entry.afterScore} />

                            <div className="mt-3 h-1.5 bg-[#e7e5e2] rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#2dd4a8,#0d9373)]"
                                    style={{ width: `${entry.afterScore}%` }}
                                />
                            </div>

                            <p className="mt-3 text-[12px] leading-relaxed vf-copy italic">"{entry.note}"</p>
                        </article>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full text-center py-16 vf-copy">
                            <p className="text-2xl mb-2">🔍</p>
                            <p className="font-medium text-[#0f172a]">Inga inlägg matchar filtret</p>
                        </div>
                    )}
                </section>

                {/* Disclaimer */}
                <div data-gallery-reveal className="bg-[#fefce8] border border-[#fef3c7] rounded-xl p-3">
                    <p className="text-[10px] text-[#92400e] leading-relaxed">
                        Alla resultat är anonymiserade och baserade på VisionFace-poäng före och efter ingrepp.
                        Individuella resultat varierar. Konsultera alltid en legitimerad specialist.
                    </p>
                </div>
            </div>
        </div>
    );
}
