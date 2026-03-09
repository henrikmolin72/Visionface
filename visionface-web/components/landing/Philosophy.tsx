'use client';

export default function Philosophy() {
    return (
        <section id="philosophy" className="relative py-20 md:py-28 overflow-hidden bg-[#06131c] text-[#e2f3ff]">
            <div className="absolute inset-0 opacity-70 bg-[radial-gradient(circle_at_15%_25%,rgba(14,165,233,0.34),transparent_40%),radial-gradient(circle_at_78%_8%,rgba(59,130,246,0.16),transparent_42%)]" />
            <div data-philosophy-parallax className="absolute inset-0 vf-philosophy-texture" />

            <div className="relative z-10 mx-auto w-[min(94vw,1180px)]">
                <div data-reveal className="max-w-3xl">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#7dd3fc]">
                        Manifesto
                    </p>
                    <h2 className="mt-3 font-[var(--font-sora)] text-[clamp(2rem,4.6vw,3.7rem)] leading-[1.04] tracking-[-0.03em]">
                        Not another clinic directory.
                        <br />
                        A clinical operating layer for aesthetic decisions.
                    </h2>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {[
                        {
                            title: 'From Guesswork to Protocol',
                            body: 'Every patient starts with measurable geometry and ends with transparent treatment logic.',
                        },
                        {
                            title: 'From Elite Access to Distributed Expertise',
                            body: 'VisionFace compresses specialist insight into interfaces anyone can understand.',
                        },
                        {
                            title: 'From Sales Narrative to Risk Disclosure',
                            body: 'Procedure depth, expected scope, and risk posture are visible before booking.',
                        },
                    ].map((item) => (
                        <article
                            key={item.title}
                            data-reveal
                            className="rounded-[1.6rem] border border-[#1e3a4a] bg-white/[0.04] p-5 backdrop-blur-sm"
                        >
                            <h3 className="text-[18px] font-semibold text-[#dff4ff]">{item.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#b7d4e5]">{item.body}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
