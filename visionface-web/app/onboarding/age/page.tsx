'use client';

import { useRouter } from 'next/navigation';

export default function AgePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen vf-page-base flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="vf-page-orb-left" aria-hidden="true" />
            <div className="vf-page-orb-right" aria-hidden="true" />

            {/* Back arrow */}
            <div className="absolute top-12 left-6 w-full max-w-lg mx-auto z-20">
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

            <div className="relative z-10 flex flex-col items-center w-full max-w-sm mt-8">
                {/* 18+ Hero */}
                <div className="mb-12 animate-slide-up-fade text-center">
                    <div className="w-32 h-32 rounded-full vf-surface-strong flex items-center justify-center mb-8 mx-auto relative shadow-[0_8px_32px_rgba(227,242,253,0.4)]">
                        <div className="absolute inset-0 rounded-full border-[0.5px] border-white/70" />
                        <span className="text-5xl font-light vf-heading tracking-tighter">18+</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-light vf-heading mb-4 tracking-tight">
                        Åldersgräns
                    </h1>
                    <p className="vf-copy leading-relaxed">
                        För din säkerhet måste du vara över 18 år för att använda VisionFace och utföra simuleringar för estetiska ingrepp.
                    </p>
                </div>

                {/* Actions */}
                <div className="w-full space-y-3 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                    <button
                        id="age-confirm-btn"
                        onClick={() => router.push('/onboarding/disclaimer')}
                        className="group relative w-full overflow-hidden rounded-2xl btn-3d-glass btn-3d-glass-pink text-[#0f172a] font-medium py-4 transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <span className="relative z-10 btn-glass-engraved">Jag är över 18 år</span>
                    </button>

                    <button
                        id="age-deny-btn"
                        onClick={() => router.back()}
                        className="w-full vf-surface border text-[#64748b] hover:text-[#0f172a] font-medium py-4 rounded-2xl transition-all duration-300 active:scale-[0.98]"
                    >
                        Jag är under 18 år
                    </button>
                </div>
            </div>
        </div>
    );
}
