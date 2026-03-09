'use client';

import { useRouter } from 'next/navigation';

export default function DisclaimerPage() {
    const router = useRouter();

    const handleAccept = () => {
        sessionStorage.setItem('onboarding_complete', 'true');
        router.push('/main/scan');
    };

    const rules = [
        {
            title: "Endast Simulering",
            desc: "Alla bilder och analyser är AI-genererade och utgör inga garantier för faktiska medicinska resultat."
        },
        {
            title: "Guardrails",
            desc: "För din säkerhet har vi begränsat möjliga justeringar till anatomiskt realistiska nivåer."
        },
        {
            title: "Lokal Bearbetning",
            desc: "Kameradata lämnar aldrig din enhet — all ansiktsanalys sker direkt i din webbläsare."
        },
        {
            title: "Rådgivning",
            desc: "Individuell anatomi påverkar alltid det slutgiltiga resultatet. Rådgör med legitimerad klinik."
        }
    ];

    return (
        <div className="min-h-screen vf-page-base flex flex-col p-6 relative pb-32">
            <div className="vf-page-orb-left" aria-hidden="true" />
            <div className="vf-page-orb-right" aria-hidden="true" />

            {/* Top Navigation Row */}
            <div className="w-full max-w-lg mx-auto pt-6 pb-4 relative z-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#64748b] hover:text-[#0f172a] transition-colors py-2 px-1 -ml-1"
                    aria-label="Gå tillbaka"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span className="text-sm font-medium">Tillbaka</span>
                </button>
            </div>

            {/* Header */}
            <div className="w-full max-w-lg mx-auto mb-8 animate-slide-up-fade relative z-10">
                <h1 className="text-3xl md:text-4xl font-light vf-heading tracking-tight mb-3">
                    Viktig Information
                </h1>
                <p className="vf-copy text-sm leading-relaxed">
                    Läs igenom och godkänn villkoren innan du fortsätter till analysen.
                </p>
            </div>

            {/* Staggered Rules List */}
            <div className="w-full max-w-lg mx-auto space-y-4 relative z-10">
                {rules.map((rule, idx) => (
                    <div
                        key={idx}
                        className="vf-surface rounded-2xl p-5 animate-slide-up-fade"
                        style={{
                            animationDelay: `${(idx + 1) * 100}ms`,
                            animationFillMode: 'forwards'
                        }}
                    >
                        <h3 className="text-[#0f172a] font-medium mb-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
                            {rule.title}
                        </h3>
                        <p className="text-[#64748b] text-sm leading-relaxed pl-3.5">
                            {rule.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* Bottom Fixed Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-6 vf-bottom-frost animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                <div className="max-w-lg mx-auto">
                    <button
                        id="disclaimer-accept-btn"
                        onClick={handleAccept}
                        className="group relative w-full overflow-hidden rounded-2xl btn-3d-glass btn-3d-glass-pink text-[#0f172a] font-medium py-4 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2 btn-glass-engraved">
                            Jag förstår och accepterar
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </span>
                    </button>
                </div>
            </div>

        </div>
    );
}
