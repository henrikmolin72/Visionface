export default function ProfilePage() {
    return (
        <div className="min-h-screen p-6 pt-3 pb-32 relative overflow-hidden">
            <div className="max-w-xl mx-auto relative z-10">
                <div className="mb-6">
                    <p className="vf-kicker mb-2">Account</p>
                    <h1 className="text-3xl font-semibold vf-heading">Profil</h1>
                </div>

                <div className="vf-surface p-5 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-[1.25rem] bg-[linear-gradient(160deg,#ffffff_0%,#dff4ff_100%)] border border-[#bae6fd] flex items-center justify-center shadow-[0_10px_18px_rgba(14,165,233,0.16)]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-[#0f172a]">Anonym Användare</p>
                            <p className="text-sm vf-copy">Inget konto krävs</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    {[
                        { label: 'Om VisionFace', icon: '◎' },
                        { label: 'Integritetspolicy', icon: '🔒' },
                        { label: 'Användarvillkor', icon: '📄' },
                        { label: 'Kontakta oss', icon: '✉' },
                    ].map((item) => (
                        <button
                            key={item.label}
                            className="vf-surface w-full flex items-center justify-between px-5 py-4 transition-colors text-left hover:border-[#bae6fd]"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-[#0f172a] font-medium">{item.label}</span>
                            </div>
                            <span className="text-[#64748b]">→</span>
                        </button>
                    ))}
                </div>

                <div className="mt-8 p-4 vf-surface rounded-2xl border-[#fbcfe8] bg-[linear-gradient(160deg,rgba(255,255,255,0.95)_0%,rgba(252,231,243,0.55)_100%)]">
                    <p className="text-[#6b7280] text-sm text-center leading-6">
                        All tidsbokning sker externt. VisionFace hanterar inga betalningar eller bokningar direkt.
                    </p>
                </div>
            </div>
        </div>
    );
}
