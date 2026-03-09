'use client';

function HelixSvg() {
    return (
        <svg viewBox="0 0 260 120" className="w-full h-24" fill="none">
            <path d="M16 20 C 70 88, 190 88, 244 20" stroke="rgba(14,165,233,0.7)" strokeWidth="2.5" />
            <path d="M16 100 C 70 32, 190 32, 244 100" stroke="rgba(59,130,246,0.45)" strokeWidth="2.5" />
            {Array.from({ length: 11 }).map((_, i) => {
                const x = 16 + i * 22.8;
                return <line key={x} x1={x} y1="26" x2={x} y2="94" stroke="rgba(148,163,184,0.42)" strokeWidth="1.3" />;
            })}
        </svg>
    );
}

function GridScannerSvg() {
    return (
        <svg viewBox="0 0 260 120" className="w-full h-24" fill="none">
            {Array.from({ length: 9 }).map((_, y) => (
                <line key={`h-${y}`} x1="18" y1={18 + y * 11} x2="242" y2={18 + y * 11} stroke="rgba(148,163,184,0.32)" strokeWidth="1" />
            ))}
            {Array.from({ length: 11 }).map((_, x) => (
                <line key={`v-${x}`} x1={18 + x * 22} y1="18" x2={18 + x * 22} y2="106" stroke="rgba(148,163,184,0.28)" strokeWidth="1" />
            ))}
            <rect x="64" y="26" width="132" height="68" rx="14" stroke="rgba(14,165,233,0.75)" strokeWidth="2" />
            <line x1="70" y1="58" x2="190" y2="58" stroke="rgba(56,189,248,0.8)" strokeWidth="2" />
        </svg>
    );
}

function WaveformSvg() {
    return (
        <svg viewBox="0 0 260 120" className="w-full h-24" fill="none">
            <path
                d="M10 72 L34 72 L44 44 L56 88 L68 24 L82 95 L94 36 L110 84 L126 50 L142 67 L160 31 L178 90 L194 45 L210 70 L250 70"
                stroke="rgba(14,165,233,0.78)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <line x1="10" y1="72" x2="250" y2="72" stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
        </svg>
    );
}

const CARDS = [
    {
        id: 'phase-1',
        eyebrow: 'Phase 01',
        title: 'Helix Intake',
        body: 'Scan landmarks, normalize geometry, and establish baseline confidence intervals before simulation.',
        graphic: <HelixSvg />,
    },
    {
        id: 'phase-2',
        eyebrow: 'Phase 02',
        title: 'Grid Scanner',
        body: 'Zone-specific tuning allows patients to evaluate intervention depth with immediate visual feedback.',
        graphic: <GridScannerSvg />,
    },
    {
        id: 'phase-3',
        eyebrow: 'Phase 03',
        title: 'Waveform Protocol',
        body: 'Output translates directly into treatment pathways, session cadence, and risk visibility.',
        graphic: <WaveformSvg />,
    },
];

export default function Protocol() {
    return (
        <section id="protocol" className="relative py-20 md:py-28">
            <div className="mx-auto w-[min(94vw,1180px)]">
                <div data-reveal className="max-w-2xl mb-7 md:mb-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0e7490]">
                        Protocol Stack
                    </p>
                    <h2 className="mt-3 font-[var(--font-sora)] text-[clamp(1.9rem,4.2vw,3.2rem)] leading-[1.04] tracking-[-0.03em] text-[#0f172a]">
                        Sticky surgical intelligence cards.
                    </h2>
                </div>

                <div className="relative">
                    {CARDS.map((card, index) => (
                        <article
                            key={card.id}
                            data-reveal
                            className="vf-protocol-card sticky top-20 md:top-28 rounded-[2rem] border border-[#dbeafe] bg-white/92 backdrop-blur-md p-5 md:p-7 mb-5 md:mb-6 shadow-[0_18px_34px_rgba(15,23,42,0.1)]"
                            style={{ zIndex: 10 + index }}
                        >
                            <div className="grid md:grid-cols-[1.2fr_1fr] gap-5 md:gap-8 items-center">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0e7490]">{card.eyebrow}</p>
                                    <h3 className="mt-2 text-[clamp(1.3rem,2.6vw,2rem)] leading-tight font-[var(--font-sora)] text-[#0f172a]">
                                        {card.title}
                                    </h3>
                                    <p className="mt-3 text-[#475569] text-[15px] leading-relaxed">
                                        {card.body}
                                    </p>
                                </div>
                                <div className="rounded-[1.5rem] border border-[#cbd5e1] bg-[#f8fcff] px-3 py-2 md:px-4 md:py-3">
                                    {card.graphic}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
