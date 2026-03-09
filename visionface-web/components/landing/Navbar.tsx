'use client';

import { ArrowRight, ShieldCheck } from 'lucide-react';

interface NavbarProps {
    compact: boolean;
    onPrimaryAction: () => void;
}

export default function Navbar({ compact, onPrimaryAction }: NavbarProps) {
    return (
        <header className="fixed top-3 md:top-4 left-1/2 z-[60] w-[min(96vw,1180px)] -translate-x-1/2">
            <div
                className={`vf-nav-shell transition-all duration-500 ${compact ? 'vf-nav-shell-compact' : ''}`}
            >
                <a href="#hero" className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[1rem] bg-white/80 border border-white/70 shadow-sm">
                        <ShieldCheck size={18} className="text-[#0f172a]" />
                    </span>
                    <span className="text-[15px] md:text-[16px] font-semibold tracking-tight text-[#0f172a]">
                        VisionFace
                    </span>
                </a>

                <nav className="hidden md:flex items-center gap-2">
                    {[
                        { href: '#features', label: 'Features' },
                        { href: '#philosophy', label: 'Philosophy' },
                        { href: '#protocol', label: 'Protocol' },
                        { href: '#membership', label: 'Membership' },
                    ].map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            className="px-3 py-2 text-[13px] font-semibold text-[#334155] rounded-[1rem] hover:bg-white/60 transition-colors"
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={onPrimaryAction}
                    className="vf-magnetic rounded-[1.15rem] border border-white/80 bg-white/90 px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-[13px] font-semibold text-[#0f172a] shadow-[0_10px_24px_rgba(14,116,144,0.14)] inline-flex items-center gap-1.5"
                >
                    Start Scan
                    <ArrowRight size={14} />
                </button>
            </div>
        </header>
    );
}
