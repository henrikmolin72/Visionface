'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Building2, ExternalLink, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';
import ClinicsMap from '@/components/ClinicsMap';
import type { ClinicProfile, ClinicsApiResponse, ReviewSnapshot } from '@/lib/clinicData';

function formatRating(snapshot: ReviewSnapshot) {
    if (snapshot.rating === null) return 'Ej hittat';
    if (snapshot.reviewCount === null) return `${snapshot.rating.toFixed(1)} / 5`;
    return `${snapshot.rating.toFixed(1)} / 5 (${snapshot.reviewCount})`;
}

function sourceBadge(snapshot: ReviewSnapshot) {
    if (snapshot.fetched === 'live') return 'Live';
    if (snapshot.fetched === 'fallback') return 'Katalog';
    return 'Saknas';
}

const CITY_OPTIONS = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Sverige'];

export default function ClinicsPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [clinics, setClinics] = useState<ClinicProfile[]>([]);
    const [city, setCity] = useState('Stockholm');
    const [query, setQuery] = useState('estetik');
    const [cityInput, setCityInput] = useState('Stockholm');
    const [queryInput, setQueryInput] = useState('estetik');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
    const [meta, setMeta] = useState<ClinicsApiResponse['meta'] | null>(null);

    const selectedClinic = useMemo(
        () => clinics.find((clinic) => clinic.id === selectedClinicId) ?? clinics[0] ?? null,
        [clinics, selectedClinicId]
    );

    async function loadClinics(nextCity: string, nextQuery: string) {
        setLoading(true);
        setError(null);
        try {
            const url = `/api/clinics?city=${encodeURIComponent(nextCity)}&q=${encodeURIComponent(nextQuery)}`;
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Kunde inte hämta kliniker (${response.status})`);
            }
            const data = (await response.json()) as ClinicsApiResponse;
            setClinics(data.clinics);
            setMeta(data.meta);
            setSelectedClinicId(data.clinics[0]?.id ?? null);
        } catch {
            setError('Klinikdata kunde inte hämtas just nu. Försök igen.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadClinics(city, query);
    }, [city, query]);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-clinic-reveal]',
                { autoAlpha: 0, y: 30 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.82,
                    stagger: 0.11,
                    ease: 'power3.out',
                },
            );
        }, root);

        return () => ctx.revert();
    }, [clinics.length, loading, selectedClinicId]);

    const onSearch = (e: FormEvent) => {
        e.preventDefault();
        setCity(cityInput.trim() || 'Sverige');
        setQuery(queryInput.trim() || 'estetik');
    };

    return (
        <div ref={rootRef} className="min-h-[calc(100vh-5rem)] px-4 md:px-6 pb-8">
            <div className="vf-page-container max-w-6xl flex flex-col gap-4 md:gap-5">
                <section data-clinic-reveal className="vf-hero-shot min-h-[200px] md:min-h-[250px] p-5 md:p-7">
                    <div
                        className="vf-hero-shot-media"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=2200&q=80')",
                        }}
                    />
                    <div className="vf-hero-shot-overlay" />

                    <div className="vf-hero-shot-content h-full flex flex-col justify-end">
                        <p className="vf-kicker text-[#b9eaff]">Clinic Intelligence</p>
                        <h1 className="mt-2 text-[clamp(1.9rem,4.1vw,3.2rem)] leading-[0.9] font-[var(--font-sora)] text-[#e8f7ff]">
                            Match trusted clinics with
                            <span className="block vf-dramatic text-[clamp(2.3rem,6vw,4.9rem)] leading-[0.78] text-[#d6f2ff]">
                                Outcome Data.
                            </span>
                        </h1>
                        <p className="mt-2 max-w-[760px] text-sm md:text-base text-[#d3e7f5]">
                            Filtrera efter stad och ingrepp, jämför Google, Trustpilot och Reco i realtid och gå direkt
                            till klinikens verifierade kanaler.
                        </p>
                    </div>
                </section>

                <section data-clinic-reveal className="vf-surface-strong p-4 md:p-5">
                    <form onSubmit={onSearch} className="grid gap-3 md:gap-4 md:grid-cols-[1fr_1.4fr_auto] md:items-end">
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b] block mb-1.5">
                                Stad
                            </label>
                            <input
                                list="city-options"
                                value={cityInput}
                                onChange={(e) => setCityInput(e.target.value)}
                                className="vf-input"
                                placeholder="Ex: Stockholm"
                            />
                            <datalist id="city-options">
                                {CITY_OPTIONS.map((value) => (
                                    <option key={value} value={value} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b] block mb-1.5">
                                Sökord
                            </label>
                            <input
                                value={queryInput}
                                onChange={(e) => setQueryInput(e.target.value)}
                                className="vf-input"
                                placeholder="Ex: rhinoplastik, fillers, botox"
                            />
                        </div>
                        <button
                            type="submit"
                            className="vf-magnetic w-full md:w-auto md:min-w-[190px] rounded-[1.2rem] py-3 px-5 btn-3d-glass btn-3d-glass-pink btn-3d-glass-static text-[#1E293B] font-semibold hover:-translate-y-px transition-transform"
                        >
                            <span className="btn-glass-engraved">Sök kliniker</span>
                        </button>
                    </form>

                    {meta && (
                        <p className="mt-3 text-[12px] text-[#64748b]">
                            Datakälla:{' '}
                            <span className="font-semibold text-[#1E293B]">
                                {meta.source === 'google_places' ? 'Google Places (live)' : 'Lokal katalog (fallback)'}
                            </span>
                            {meta.note && <span className="block mt-1">{meta.note}</span>}
                        </p>
                    )}
                </section>

                {loading && (
                    <div data-clinic-reveal className="vf-surface rounded-[1.8rem] p-5 text-sm text-[#475569]">
                        Hämtar kliniker och omdömen...
                    </div>
                )}

                {error && (
                    <div data-clinic-reveal className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && clinics.length === 0 && (
                    <div data-clinic-reveal className="vf-surface rounded-[1.8rem] p-5 text-sm text-[#475569]">
                        Inga kliniker hittades. Testa ett bredare sökord eller en annan stad.
                    </div>
                )}

                {!loading && clinics.length > 0 && (
                    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-start">
                        <div data-clinic-reveal className="space-y-4">
                            <ClinicsMap
                                clinics={clinics}
                                selectedClinicId={selectedClinicId}
                                onSelectClinic={setSelectedClinicId}
                            />

                            {selectedClinic && (
                                <article className="vf-surface rounded-[2rem] p-5 md:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                        <div>
                                            <p className="vf-kicker mb-2">Selected clinic</p>
                                            <h2 className="text-2xl md:text-[2rem] leading-tight font-semibold vf-heading">
                                                {selectedClinic.name}
                                            </h2>
                                            <p className="text-[#475569] text-sm mt-1.5">{selectedClinic.address}</p>
                                            <p className="text-[#64748b] text-xs mt-1.5">
                                                TrustScore:{' '}
                                                <span className="font-semibold text-[#1E293B]">
                                                    {selectedClinic.trustScore.toFixed(1)} / 5
                                                </span>
                                            </p>
                                        </div>
                                        {selectedClinic.verified && (
                                            <span className="inline-flex items-center gap-1.5 bg-[#E3F2FD] text-[#475569] border border-[#BBDEFB] text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm self-start">
                                                <ShieldCheck size={12} />
                                                Verifierad
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                        {([
                                            { label: 'Google', key: 'google' },
                                            { label: 'Trustpilot', key: 'trustpilot' },
                                            { label: 'Reco', key: 'reco' },
                                        ] as const).map((source) => {
                                            const snapshot = selectedClinic.sources[source.key];
                                            return (
                                                <div
                                                    key={source.key}
                                                    className="rounded-[1.2rem] border border-[#dbeafe] bg-white/92 backdrop-blur-sm p-3.5"
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <p className="text-xs uppercase tracking-wide text-[#64748b] font-semibold">
                                                            {source.label}
                                                        </p>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-[#475569]">
                                                            {sourceBadge(snapshot)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-[#1E293B]">{formatRating(snapshot)}</p>
                                                    {snapshot.url && (
                                                        <a
                                                            href={snapshot.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-[#475569] hover:text-[#1E293B] hover:-translate-y-px transition-transform"
                                                        >
                                                            Öppna källa
                                                            <ExternalLink size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedClinic.treatments.map((treatment) => (
                                            <span
                                                key={treatment}
                                                className="inline-flex items-center gap-1 bg-white/90 text-[#475569] text-xs px-2.5 py-1 rounded-md border border-[#dbeafe]"
                                            >
                                                <Sparkles size={12} />
                                                {treatment}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2.5">
                                        {selectedClinic.website && (
                                            <a
                                                href={selectedClinic.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="vf-magnetic flex-1 inline-flex items-center justify-center gap-1.5 rounded-[1rem] py-2.5 px-4 border border-[#e2e8f0] bg-white text-[#1E293B] text-sm font-semibold hover:bg-[#f8fafc] hover:-translate-y-px transition-transform"
                                            >
                                                <Building2 size={15} />
                                                Besök hemsida
                                            </a>
                                        )}
                                        {selectedClinic.sources.google.url && (
                                            <a
                                                href={selectedClinic.sources.google.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="vf-magnetic flex-1 inline-flex items-center justify-center gap-1.5 rounded-[1rem] py-2.5 px-4 border border-[#e2e8f0] bg-white text-[#1E293B] text-sm font-semibold hover:bg-[#f8fafc] hover:-translate-y-px transition-transform"
                                            >
                                                <MapPinned size={15} />
                                                Öppna i Maps
                                            </a>
                                        )}
                                    </div>
                                </article>
                            )}
                        </div>

                        <aside data-clinic-reveal className="vf-surface rounded-[2rem] p-4 md:p-5 h-fit">
                            <p className="vf-kicker mb-2">Clinic shortlist</p>
                            <h3 className="text-xl font-semibold vf-heading mb-4">Matchade kliniker</h3>
                            <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                                {clinics.map((clinic, index) => {
                                    const isSelected = selectedClinicId === clinic.id;
                                    return (
                                        <button
                                            key={clinic.id}
                                            type="button"
                                            onClick={() => setSelectedClinicId(clinic.id)}
                                            className={`w-full text-left rounded-[1.3rem] border px-4 py-3 transition-all hover:-translate-y-px ${isSelected
                                                ? 'border-[#7dd3fc] bg-[#ecfeff] shadow-[0_10px_20px_rgba(14,165,233,0.14)]'
                                                : 'border-[#dbeafe] bg-white/85 hover:bg-white'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-[11px] font-bold text-[#94a3b8] mb-1">
                                                        #{index + 1} på kartan
                                                    </p>
                                                    <h4 className="text-base font-semibold text-[#1E293B]">{clinic.name}</h4>
                                                    <p className="text-xs text-[#64748b] mt-1">{clinic.address}</p>
                                                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748b]">
                                                        <span>Google: {clinic.sources.google.rating ?? 'N/A'}</span>
                                                        <span>Trustpilot: {clinic.sources.trustpilot.rating ?? 'N/A'}</span>
                                                        <span>Reco: {clinic.sources.reco.rating ?? 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-[#1E293B]">
                                                        {clinic.trustScore.toFixed(1)} / 5
                                                    </p>
                                                    <p className="text-[11px] text-[#94a3b8]">TrustScore</p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>
                    </section>
                )}
            </div>
        </div>
    );
}
