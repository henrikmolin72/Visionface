'use client';

import { ArrowRight, Shield, Sparkles } from 'lucide-react';

interface HeroProps {
    onPrimaryAction: () => void;
}

export default function Hero({ onPrimaryAction }: HeroProps) {
    return (
        <section id="hero" className="vf-hero relative min-h-[100dvh] w-full overflow-hidden">
            <div
                data-hero-bg
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=2200&q=80')",
                }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(186,230,253,0.55),transparent_48%),linear-gradient(180deg,rgba(248,252,255,0.26),rgba(248,252,255,0.84)_64%,#f8fbff_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(15,23,42,0.18),transparent_42%)]" />

            <div className="relative z-10 mx-auto flex min-h-[100dvh] w-[min(94vw,1180px)] flex-col justify-end pb-12 pt-28 sm:pb-14 md:pb-20 md:pt-32">
                <div className="max-w-[860px]">
                    <p data-reveal className="vf-hero-reveal inline-flex items-center gap-2 rounded-[1rem] border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#155e75] backdrop-blur-sm">
                        <Sparkles size={13} />
                        Clinical Aesthetics Intelligence
                    </p>

                    <h1
                        data-reveal
                        className="vf-hero-reveal mt-4 sm:mt-5 font-[var(--font-sora)] text-[clamp(2.2rem,7.2vw,6.1rem)] leading-[0.92] tracking-[-0.03em] text-[#0f172a]"
                    >
                        Precision Face Planning,
                        <br />
                        <span className="text-[#155e75]">Cinematic Clarity.</span>
                    </h1>

                    <p
                        data-reveal
                        className="vf-hero-reveal mt-4 sm:mt-5 max-w-[620px] text-[clamp(1rem,1.7vw,1.25rem)] leading-relaxed text-[#334155]"
                    >
                        VisionFace turns advanced facial analysis into a premium consultation experience.
                        Compare realistic before/after previews, calibrate each facial zone, and map treatment
                        pathways before your first clinic meeting.
                    </p>

                    <div data-reveal className="vf-hero-reveal mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onPrimaryAction}
                            className="vf-magnetic inline-flex items-center justify-center gap-2 rounded-[1.35rem] px-6 py-4 text-[15px] font-semibold text-[#0f172a] border border-white/90 bg-white/95 shadow-[0_20px_38px_rgba(8,145,178,0.22)]"
                        >
                            Start Scanning
                            <ArrowRight size={16} />
                        </button>
                        <a
                            href="#features"
                            className="vf-magnetic inline-flex items-center justify-center gap-2 rounded-[1.35rem] px-6 py-4 text-[15px] font-semibold text-[#0f172a] border border-[#bae6fd]/85 bg-[#eff9ff]/80 backdrop-blur-sm"
                        >
                            Explore the System
                        </a>
                    </div>

                    <div data-reveal className="vf-hero-reveal mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-[1rem] bg-white/65 border border-white/80 px-3 py-2 text-[12px] text-[#475569]">
                        <Shield size={14} className="text-[#0e7490]" />
                        Local-first processing. Patient data stays in-browser by default.
                    </div>
                </div>
            </div>
        </section>
    );
}
