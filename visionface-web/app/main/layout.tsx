import BottomNav from '@/components/BottomNav';
import AppTopBar from '@/components/AppTopBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen vf-page-base flex flex-col">
            <div className="vf-page-orb-left" aria-hidden="true" />
            <div className="vf-page-orb-right" aria-hidden="true" />
            <AppTopBar />

            <main className="flex-1 pb-24 pt-20 md:pt-24 overflow-y-auto relative z-10">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
