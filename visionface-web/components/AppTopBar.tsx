'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
    { href: '/main/scan', label: 'Scan' },
    { href: '/main/clinics', label: 'Kliniker' },
    { href: '/main/education', label: 'Lexikon' },
    { href: '/main/profile', label: 'Profil' },
];

function getPageLabel(pathname: string) {
    const item = NAV_ITEMS.find((entry) => pathname.startsWith(entry.href));
    return item?.label ?? 'VisionFace';
}

export default function AppTopBar() {
    const pathname = usePathname();
    const pageLabel = getPageLabel(pathname);
    const router = useRouter();
    const [compact, setCompact] = useState(false);

    useEffect(() => {
        const onScroll = () => setCompact(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className="fixed top-3 md:top-4 left-1/2 z-[65] w-[min(96vw,1180px)] -translate-x-1/2">
            <div className={`vf-nav-shell transition-all duration-500 ${compact ? 'vf-nav-shell-compact' : ''}`}>
                <Link href="/" className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[1rem] bg-white/80 border border-white/70 shadow-sm">
                        <ShieldCheck size={18} className="text-[#0f172a]" />
                    </span>
                    <span className="text-[15px] md:text-[16px] font-semibold tracking-tight text-[#0f172a]">
                        VisionFace
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-2">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-3 py-2 text-[13px] font-semibold rounded-[1rem] transition-colors ${active
                                    ? 'text-[#0f172a] bg-white/65'
                                    : 'text-[#334155] hover:bg-white/60'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <button
                    type="button"
                    onClick={() => router.push('/main/scan')}
                    className="hidden md:inline-flex vf-magnetic rounded-[1.1rem] border border-white/80 bg-white/90 px-3.5 py-2 text-[12px] font-semibold text-[#0f172a] shadow-[0_10px_24px_rgba(14,116,144,0.14)]"
                >
                    Start Scan
                </button>

                <span className="inline-flex md:hidden items-center rounded-[0.9rem] border border-white/75 bg-white/78 px-3 py-1.5 text-[12px] font-semibold text-[#0f172a]">
                    {pageLabel}
                </span>
            </div>
        </header>
    );
}
