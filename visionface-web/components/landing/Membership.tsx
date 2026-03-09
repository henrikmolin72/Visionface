'use client';

import { Check, Crown } from 'lucide-react';

const PLANS = [
    {
        name: 'Patient Core',
        price: '0 SEK',
        cadence: 'per scan',
        points: [
            'AI face scan + zone scores',
            'Live before/after calibration',
            'Clinic map + review comparison',
        ],
        accent: false,
    },
    {
        name: 'Clinical Pro',
        price: '2 490 SEK',
        cadence: 'per month',
        points: [
            'Unlimited protocol simulations',
            'Shared patient consult exports',
            'Outcome tracking dashboard',
            'Priority support',
        ],
        accent: true,
    },
    {
        name: 'Network Enterprise',
        price: 'Custom',
        cadence: 'multi-clinic',
        points: [
            'White-label deployment',
            'Role-based team workflows',
            'API + data governance tooling',
        ],
        accent: false,
    },
];

export default function Membership() {
    return (
        <section id="membership" className="relative py-20 md:py-28">
            <div className="mx-auto w-[min(94vw,1180px)]">
                <div data-reveal className="max-w-2xl mb-8 md:mb-10">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0e7490]">
                        Membership
                    </p>
                    <h2 className="mt-3 font-[var(--font-sora)] text-[clamp(1.9rem,4.4vw,3.3rem)] leading-[1.04] tracking-[-0.03em] text-[#0f172a]">
                        Scale from personal insight to full clinical operating layer.
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <article
                            key={plan.name}
                            data-reveal
                            className={`rounded-[2rem] border p-6 md:p-7 ${plan.accent
                                    ? 'border-[#7dd3fc] bg-gradient-to-b from-[#ecfeff] to-white shadow-[0_18px_40px_rgba(14,165,233,0.18)]'
                                    : 'border-[#dbeafe] bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[21px] font-semibold text-[#0f172a]">{plan.name}</h3>
                                {plan.accent && (
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[0.9rem] bg-[#0f172a] text-white">
                                        <Crown size={15} />
                                    </span>
                                )}
                            </div>
                            <p className="text-[34px] leading-none font-[var(--font-sora)] text-[#0f172a]">{plan.price}</p>
                            <p className="text-[12px] text-[#64748b] mt-1">{plan.cadence}</p>

                            <ul className="mt-5 space-y-2">
                                {plan.points.map((point) => (
                                    <li key={point} className="flex items-start gap-2 text-[14px] text-[#334155]">
                                        <Check size={16} className="text-[#0ea5e9] mt-[1px] flex-shrink-0" />
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                className={`vf-magnetic mt-6 w-full rounded-[1.1rem] py-3 px-4 text-sm font-semibold border ${plan.accent
                                        ? 'bg-[#0f172a] text-white border-[#0f172a]'
                                        : 'bg-white text-[#0f172a] border-[#cbd5e1]'
                                    }`}
                            >
                                {plan.accent ? 'Book Pro Demo' : 'Select Plan'}
                            </button>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
