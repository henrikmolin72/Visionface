'use client';

import { Activity, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative overflow-hidden bg-[#020b12] text-[#dbeafe]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(14,165,233,0.3),transparent_42%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.2),transparent_48%)]" />

            <div className="relative z-10 mx-auto flex w-[min(94vw,1180px)] flex-col gap-10 py-12 md:flex-row md:items-end md:justify-between md:py-14">
                <div className="max-w-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7dd3fc]">
                        VisionFace System
                    </p>
                    <h2 className="mt-3 font-[var(--font-sora)] text-[clamp(1.5rem,3.2vw,2.4rem)] leading-tight tracking-[-0.02em]">
                        Premium facial intelligence for transparent aesthetic decisions.
                    </h2>
                    <p className="mt-4 text-sm leading-relaxed text-[#b6d1e3]">
                        Powered by local-first scanning, adaptive protocol modeling, and clinic intelligence in one cinematic workflow.
                    </p>
                </div>

                <div className="vf-footer-shell rounded-[1.7rem] border border-[#1f3a4a] bg-white/[0.03] px-5 py-4 backdrop-blur-md">
                    <div className="flex items-center gap-3 text-sm text-[#d8efff]">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-[#08283b] text-[#67e8f9]">
                            <Activity size={15} />
                        </span>
                        <div>
                            <p className="font-semibold">System Status</p>
                            <p className="text-[#9ec3d9] text-xs">Live protocol streaming</p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 border-t border-[#1f3a4a] pt-4 text-xs text-[#98b6ca]">
                        <span className="inline-flex items-center gap-1">
                            <ShieldCheck size={14} />
                            Local privacy mode
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Globe size={14} />
                            Clinic network ready
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
