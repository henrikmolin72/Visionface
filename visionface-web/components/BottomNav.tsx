'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    {
        href: '/main/scan',
        label: 'Scan',
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#134e4a' : '#a8a29e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8 C10 8, 8 9.5, 8 12 C8 14.5, 10 16, 12 16 C14 16, 16 14.5, 16 12" />
            </svg>
        ),
    },
    {
        href: '/main/clinics',
        label: 'Kliniker',
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#134e4a' : '#a8a29e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
        ),
    },
    {
        href: '/main/education',
        label: 'Lexikon',
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#134e4a' : '#a8a29e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
        ),
    },
    {
        href: '/main/profile',
        label: 'Profil',
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#134e4a' : '#a8a29e'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-4 left-0 right-0 z-50 px-4 md:px-6 flex justify-center pointer-events-none md:hidden">
            <nav className="w-full max-w-sm px-2 py-2 pointer-events-auto vf-nav-shell">
                <div className="flex items-center justify-between">
                    {tabs.map((tab) => {
                        const active = pathname === tab.href;
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                id={`nav-${tab.label.toLowerCase()}`}
                                className="group relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-full transition-all duration-300"
                            >
                                {/* Active background pill indicator */}
                                {active && (
                                    <div className="absolute inset-0 rounded-full scale-100 transition-transform duration-300 -z-10 bg-[linear-gradient(145deg,#ffffff_0%,#f0fdf8_100%)] border border-[#2dd4a8]/30" />
                                )}

                                <div className={`transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : 'group-hover:scale-110 group-active:scale-95'}`}>
                                    {tab.icon(active)}
                                </div>
                                <span className={`text-[10px] font-medium transition-colors duration-300 mt-1 ${active ? 'text-[#134e4a] font-semibold' : 'text-[#78766f]'}`}>
                                    {tab.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
