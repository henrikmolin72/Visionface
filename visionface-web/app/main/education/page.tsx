'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Activity, BookOpenText, Clock3, ShieldAlert } from 'lucide-react';

type GlossaryTerm = {
    id: string;
    term: string;
    pronunciation: string;
    definition: string;
    category: 'anatomy' | 'procedure' | 'substance' | 'condition';
    relatedProcedures: string[];
};

const GLOSSARY: GlossaryTerm[] = [
    { id: 'hyaluronsyra', term: 'Hyaluronsyra', pronunciation: 'hya-lu-ron-sy-ra', definition: 'Kroppseget socker som binder vatten och ger volym. Används som fyllnadsmaterial i dermal filler och skinbooster.', category: 'substance', relatedProcedures: ['Dermal Filler', 'Skinbooster'] },
    { id: 'botulinumtoxin', term: 'Botulinumtoxin', pronunciation: 'bo-tu-li-num-tok-sin', definition: 'Protein som tillfälligt blockerar muskelkontraktion. Används för att reducera dynamiska rynkor och ge ett uppfräschat utseende.', category: 'substance', relatedProcedures: ['Botulinumtoxin'] },
    { id: 'rhinoplasty', term: 'Rhinoplastik', pronunciation: 'ri-no-plas-tik', definition: 'Kirurgisk förändring av näsans form, storlek eller funktion. Kan vara öppen (med hudsnitt) eller sluten (utan yttre snitt).', category: 'procedure', relatedProcedures: ['Rhinoplasty'] },
    { id: 'mentoplasty', term: 'Mentoplastik', pronunciation: 'men-to-plas-tik', definition: 'Kirurgisk förstärkning eller minskning av hakans projektion med implantat eller benprocedurer.', category: 'procedure', relatedProcedures: ['Hakförstärkning'] },
    { id: 'ptosis', term: 'Ptos', pronunciation: 'pto-sis', definition: 'Hängande ögonlock orsakad av försvagad muskulatur. Kan korrigeras med blepharoplastik.', category: 'condition', relatedProcedures: ['Ögonlockslyft'] },
    { id: 'malar', term: 'Malarbenet', pronunciation: 'ma-lar-be-net', definition: 'Kindknoten (os zygomaticum). Prominenta malarben associeras med attraktiva ansiktsproportioner.', category: 'anatomy', relatedProcedures: ['Kindben', 'Dermal Filler'] },
    { id: 'nasolabial', term: 'Nasolabiala veck', pronunciation: 'na-so-la-bi-a-la', definition: 'Veckarna som löper från näsvingarna till mungiporna. Djupnar med åldern och behandlas med filler.', category: 'anatomy', relatedProcedures: ['Dermal Filler'] },
    { id: 'collagen', term: 'Kollagen', pronunciation: 'ko-la-gen', definition: 'Strukturprotein som ger huden fasthet och elasticitet. Produktionen minskar med åldern, vilket behandlas med PRP och skinbooster.', category: 'substance', relatedProcedures: ['PRP-behandling', 'Skinbooster'] },
    { id: 'canthopexy', term: 'Canthopex', pronunciation: 'kan-to-peks', definition: 'Kirurgisk fixering av ögats yttre kantligament för att lyfta och strama ögonvrån.', category: 'procedure', relatedProcedures: ['Ögonlyft'] },
    { id: 'genioplasty', term: 'Genioplastik', pronunciation: 'je-ni-o-plas-tik', definition: 'Osteotomi (bensnitt) av hakan för att flytta och ompositionera hakbenet kirurgiskt.', category: 'procedure', relatedProcedures: ['Hakförstärkning'] },
    { id: 'bichectomy', term: 'Bichektomi', pronunciation: 'bi-jek-to-mi', definition: 'Kirurgiskt avlägsnande av Bichats fettkuddar i kinderna för att skapa mer skulpterade kindkonturer.', category: 'procedure', relatedProcedures: ['Kindben'] },
    { id: 'symmetry', term: 'Ansiktssymmetri', pronunciation: 'an-sik-tes-si-me-tri', definition: 'Graden av överensstämmelse mellan ansiktets höger- och vänsterhalva. Hög symmetri associeras med hälsa och attraktion.', category: 'anatomy', relatedProcedures: ['Botox', 'Dermal Filler'] },
    { id: 'golden_ratio', term: 'Gyllene snittet', pronunciation: 'gyl-le-ne-snit-tet', definition: 'Matematiskt förhållande (~1.618) som återfinns i vad som betraktas som harmoniska ansiktsproportioner.', category: 'anatomy', relatedProcedures: [] },
];

const CATEGORY_LABELS: Record<GlossaryTerm['category'], string> = {
    anatomy: 'Anatomi',
    procedure: 'Ingrepp',
    substance: 'Substans',
    condition: 'Tillstånd',
};

const CATEGORY_COLORS: Record<GlossaryTerm['category'], string> = {
    anatomy: '#bae6fd',
    procedure: '#c4b5fd',
    substance: '#bbf7d0',
    condition: '#fde68a',
};

function GlossaryCard({ term }: { term: GlossaryTerm }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="w-full text-left vf-surface rounded-[1.4rem] p-4 vf-card-hover transition-all"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-[15px] font-semibold text-[#0f172a]">{term.term}</h4>
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[term.category] + '66', color: '#1a1a1a' }}
                        >
                            {CATEGORY_LABELS[term.category]}
                        </span>
                    </div>
                    <p className="text-[11px] text-[#a8a29e] italic">/{term.pronunciation}/</p>
                </div>
                <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round"
                    className={`transition-transform shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {expanded && (
                <div className="mt-3 space-y-2">
                    <p className="text-[13px] leading-relaxed text-[#475569]">{term.definition}</p>
                    {term.relatedProcedures.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {term.relatedProcedures.map((p) => (
                                <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-[#f3f0eb] text-[#52524e] font-medium">{p}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </button>
    );
}

type Procedure = {
    id: string;
    name: string;
    description: string;
    duration: string;
    recovery: string;
    intensity: 'Low' | 'Medium' | 'High';
    zones: string[];
    color: string;
    icon: string;
    feedLines: string[];
};

const PROCEDURES: Procedure[] = [
    {
        id: 'filler',
        name: 'Dermal Filler',
        description: 'Injicering av hyaluronsyra för att bygga volym, skulptera konturer eller fylla rynkor.',
        duration: '6-12 månader',
        recovery: '1-3 dagar',
        intensity: 'Low',
        zones: ['Läppar', 'Kinder', 'Näsolabialveck'],
        color: '#bae6fd',
        icon: '💧',
        feedLines: ['Volume simulation: calibrated.', 'Lip ratio correction: +12%.', 'Contour balance ready for preview.'],
    },
    {
        id: 'botox',
        name: 'Botulinumtoxin',
        description: 'Muskelavslappnande medel som dämpar dynamiska rynkor och ger ett uppfräschat uttryck.',
        duration: '3-4 månader',
        recovery: '24-48 timmar',
        intensity: 'Low',
        zones: ['Panna', 'Glabella', 'Kråksparkar'],
        color: '#fecdd3',
        icon: '✨',
        feedLines: ['Dynamic wrinkle map: loaded.', 'Muscle tension vector: reduced.', 'Symmetry forecast: stable.'],
    },
    {
        id: 'skinbooster',
        name: 'Skinbooster',
        description: 'Djupgående fuktbehandling med hyaluronsyra för lyster, spänst och bättre hudkvalitet.',
        duration: '4-6 månader',
        recovery: '1-2 dagar',
        intensity: 'Low',
        zones: ['Ansikte', 'Hals', 'Händer'],
        color: '#bbf7d0',
        icon: '🌟',
        feedLines: ['Hydration profile: increasing.', 'Texture equalization: active.', 'Dermal glow projection: confirmed.'],
    },
    {
        id: 'threadlift',
        name: 'Trådlyft',
        description: 'Upplösbara trådar placeras under huden för att lyfta och strama åt vävnad utan traditionell kirurgi.',
        duration: '12-18 månader',
        recovery: '5-10 dagar',
        intensity: 'Medium',
        zones: ['Kinder', 'Käklinje', 'Hals'],
        color: '#fde68a',
        icon: '⚡',
        feedLines: ['Vector lift anchors: staged.', 'Jawline tension mesh: reinforced.', 'Recovery curve: moderate.'],
    },
    {
        id: 'rhinoplasty',
        name: 'Rhinoplasty',
        description: 'Kirurgisk korrigering av näsans form, storlek eller funktion med permanent resultat.',
        duration: 'Permanent',
        recovery: '2-6 veckor',
        intensity: 'High',
        zones: ['Näsa'],
        color: '#c4b5fd',
        icon: '👃',
        feedLines: ['Nasal bridge projection: adjustable.', 'Cartilage plan: surgical scope high.', 'Risk profile: requires specialist review.'],
    },
    {
        id: 'prp',
        name: 'PRP-behandling',
        description: 'Kroppsegen plasma injiceras för att stimulera kollagenproduktion och cellförnyelse.',
        duration: '6-12 månader',
        recovery: '2-5 dagar',
        intensity: 'Medium',
        zones: ['Ansikte', 'Hårbotten'],
        color: '#a5f3fc',
        icon: '🩸',
        feedLines: ['Platelet response: elevated.', 'Collagen trigger: in progress.', 'Tissue vitality estimate: positive.'],
    },
];

function intensityLabel(intensity: Procedure['intensity']) {
    if (intensity === 'Low') return 'Låg invasivitet';
    if (intensity === 'Medium') return 'Mellan invasivitet';
    return 'Hög invasivitet';
}

export default function EducationPage() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [selectedId, setSelectedId] = useState(PROCEDURES[0]?.id ?? '');
    const [typedLine, setTypedLine] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);
    const [glossarySearch, setGlossarySearch] = useState('');
    const [glossaryCategory, setGlossaryCategory] = useState<GlossaryTerm['category'] | 'all'>('all');

    const filteredGlossary = useMemo(() => {
        return GLOSSARY.filter((t) => {
            const matchSearch = !glossarySearch || t.term.toLowerCase().includes(glossarySearch.toLowerCase()) || t.definition.toLowerCase().includes(glossarySearch.toLowerCase());
            const matchCat = glossaryCategory === 'all' || t.category === glossaryCategory;
            return matchSearch && matchCat;
        });
    }, [glossarySearch, glossaryCategory]);

    const selectedProcedure = useMemo(
        () => PROCEDURES.find((procedure) => procedure.id === selectedId) ?? PROCEDURES[0],
        [selectedId],
    );

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-library-reveal]',
                { autoAlpha: 0, y: 30 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out',
                },
            );
        }, root);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const lineCursorInterval = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 520);

        return () => clearInterval(lineCursorInterval);
    }, []);

    useEffect(() => {
        const lines = selectedProcedure.feedLines;
        let lineIndex = 0;
        let charIndex = 0;
        let timeoutId: ReturnType<typeof setTimeout>;

        const type = () => {
            const currentLine = lines[lineIndex] ?? '';
            if (charIndex <= currentLine.length) {
                setTypedLine(currentLine.slice(0, charIndex));
                charIndex += 1;
                timeoutId = setTimeout(type, 30);
                return;
            }

            timeoutId = setTimeout(() => {
                lineIndex = (lineIndex + 1) % lines.length;
                charIndex = 0;
                setTypedLine('');
                type();
            }, 900);
        };

        type();
        return () => clearTimeout(timeoutId);
    }, [selectedProcedure]);

    return (
        <div ref={rootRef} className="min-h-[calc(100vh-5rem)] px-4 md:px-6 pb-8">
            <div className="vf-page-container max-w-6xl flex flex-col gap-4 md:gap-5">
                <section data-library-reveal className="vf-hero-shot min-h-[200px] md:min-h-[250px] p-5 md:p-7">
                    <div
                        className="vf-hero-shot-media"
                        style={{
                            backgroundImage:
                                "url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=2200&q=80')",
                        }}
                    />
                    <div className="vf-hero-shot-overlay" />

                    <div className="vf-hero-shot-content h-full flex flex-col justify-end">
                        <p className="vf-kicker text-[#b9eaff]">Procedure Library</p>
                        <h1 className="mt-2 text-[clamp(1.9rem,4.1vw,3.2rem)] leading-[0.9] font-[var(--font-sora)] text-[#e8f7ff]">
                            Learn procedures with
                            <span className="block vf-dramatic text-[clamp(2.3rem,6vw,4.9rem)] leading-[0.78] text-[#d6f2ff]">
                                Clinical Context.
                            </span>
                        </h1>
                        <p className="mt-2 max-w-[760px] text-sm md:text-base text-[#d3e7f5]">
                            Utforska behandlingar, återhämtning, risknivåer och se hur olika val påverkar rekommenderad
                            behandlingsplan.
                        </p>
                    </div>
                </section>

                <section data-library-reveal className="grid gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
                    <aside className="vf-surface rounded-[2rem] p-4 md:p-5">
                        <p className="vf-kicker mb-2">Treatment Atlas</p>
                        <h2 className="text-xl md:text-2xl font-semibold vf-heading">Välj område</h2>
                        <p className="mt-1 text-sm vf-copy">Klicka på en behandling för att se fördjupning och live feed.</p>

                        <div className="mt-4 space-y-2.5">
                            {PROCEDURES.map((procedure) => {
                                const active = procedure.id === selectedProcedure.id;
                                return (
                                    <button
                                        key={procedure.id}
                                        type="button"
                                        onClick={() => setSelectedId(procedure.id)}
                                        className={`w-full rounded-[1.2rem] border px-3.5 py-3 text-left transition-all hover:-translate-y-px ${active
                                            ? 'border-[#7dd3fc] bg-[#ecfeff] shadow-[0_10px_22px_rgba(14,165,233,0.14)]'
                                            : 'border-[#dbeafe] bg-white/86 hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-white/80 text-lg"
                                                style={{ backgroundColor: `${procedure.color}66` }}
                                            >
                                                {procedure.icon}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[15px] font-semibold text-[#0f172a] truncate">{procedure.name}</p>
                                                <p className="text-[11px] text-[#64748b] mt-0.5">{procedure.duration}</p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <article className="vf-surface-strong rounded-[2rem] p-5 md:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <p className="vf-kicker">Active protocol</p>
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#bae6fd] bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-[#0e7490]">
                                <Activity size={12} />
                                Live Feed
                            </span>
                        </div>

                        <div className="flex items-start gap-4">
                            <span
                                className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] border border-white/90 text-[22px]"
                                style={{ backgroundColor: `${selectedProcedure.color}66` }}
                            >
                                {selectedProcedure.icon}
                            </span>
                            <div>
                                <h3 className="text-2xl md:text-[2.2rem] leading-tight font-semibold vf-heading">
                                    {selectedProcedure.name}
                                </h3>
                                <p className="mt-2 text-sm md:text-[15px] leading-relaxed text-[#475569]">
                                    {selectedProcedure.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                            <div className="rounded-[1rem] border border-[#dbeafe] bg-white/84 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Varaktighet</p>
                                <p className="mt-1 text-sm font-semibold text-[#1E293B]">{selectedProcedure.duration}</p>
                            </div>
                            <div className="rounded-[1rem] border border-[#dbeafe] bg-white/84 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Återhämtning</p>
                                <p className="mt-1 text-sm font-semibold text-[#1E293B]">{selectedProcedure.recovery}</p>
                            </div>
                            <div className="rounded-[1rem] border border-[#dbeafe] bg-white/84 p-3">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">Ingreppsnivå</p>
                                <p className="mt-1 text-sm font-semibold text-[#1E293B]">{intensityLabel(selectedProcedure.intensity)}</p>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {selectedProcedure.zones.map((zone) => (
                                <span
                                    key={zone}
                                    className="rounded-full border border-[#dbeafe] bg-white/86 px-2.5 py-1 text-[11px] font-medium text-[#475569]"
                                >
                                    {zone}
                                </span>
                            ))}
                        </div>

                        <div className="mt-4 rounded-[1.1rem] border border-[#bae6fd]/80 bg-[#031523]/92 px-3.5 py-3 font-mono text-[12px] text-[#86e7ff]">
                            <span className="text-[#7dd3fc]">{'>'}</span> {typedLine}
                            <span className={`ml-0.5 ${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>|</span>
                        </div>

                        {selectedProcedure.intensity === 'High' && (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-[0.9rem] border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] font-medium text-amber-800">
                                <ShieldAlert size={14} />
                                Högre riskprofil: kräver specialistbedömning och längre återhämtning.
                            </div>
                        )}
                    </article>
                </section>

                {/* Glossary section */}
                <section data-library-reveal className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <p className="vf-kicker">Medicinsk ordlista</p>
                            <h2 className="text-xl font-semibold vf-heading">Termer & Definitioner</h2>
                        </div>
                        <input
                            type="text"
                            placeholder="Sök term..."
                            value={glossarySearch}
                            onChange={(e) => setGlossarySearch(e.target.value)}
                            className="vf-input max-w-xs text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(['all', 'anatomy', 'procedure', 'substance', 'condition'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setGlossaryCategory(cat)}
                                className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                                style={{
                                    borderColor: glossaryCategory === cat ? '#134e4a' : '#e2e0dc',
                                    backgroundColor: glossaryCategory === cat ? '#134e4a' : 'white',
                                    color: glossaryCategory === cat ? 'white' : '#52524e',
                                }}
                            >
                                {cat === 'all' ? 'Alla' : CATEGORY_LABELS[cat]}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {filteredGlossary.map((term) => (
                            <GlossaryCard key={term.id} term={term} />
                        ))}
                        {filteredGlossary.length === 0 && (
                            <p className="col-span-full text-center py-8 vf-copy text-sm">Inga termer matchar sökningen.</p>
                        )}
                    </div>
                </section>

                <section data-library-reveal className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {PROCEDURES.map((procedure) => (
                        <article key={procedure.id} className="vf-surface rounded-[1.7rem] p-4 md:p-5 hover:-translate-y-px transition-transform">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <h4 className="text-lg font-semibold text-[#0f172a]">{procedure.name}</h4>
                                    <p className="mt-1 text-xs text-[#64748b]">{intensityLabel(procedure.intensity)}</p>
                                </div>
                                <span
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-white/90 text-lg"
                                    style={{ backgroundColor: `${procedure.color}66` }}
                                >
                                    {procedure.icon}
                                </span>
                            </div>

                            <p className="text-sm leading-relaxed text-[#475569] mb-3">{procedure.description}</p>

                            <div className="flex items-center gap-1.5 text-[12px] text-[#475569]">
                                <Clock3 size={13} />
                                {procedure.duration}
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#475569]">
                                <BookOpenText size={13} />
                                Recovery: {procedure.recovery}
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        </div>
    );
}
