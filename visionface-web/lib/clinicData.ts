export type ReviewSource = 'google' | 'trustpilot' | 'reco';

export interface ReviewSnapshot {
    source: ReviewSource;
    rating: number | null;
    reviewCount: number | null;
    url: string | null;
    fetched: 'live' | 'fallback' | 'unavailable';
}

export interface ClinicProfile {
    id: string;
    name: string;
    address: string;
    city: string;
    website: string | null;
    phone: string | null;
    treatments: string[];
    verified: boolean;
    coordinates: { lat: number; lng: number };
    sources: {
        google: ReviewSnapshot;
        trustpilot: ReviewSnapshot;
        reco: ReviewSnapshot;
    };
    trustScore: number;
}

export interface ClinicsApiResponse {
    clinics: ClinicProfile[];
    meta: {
        source: 'google_places' | 'fallback_directory';
        city: string;
        query: string;
        generatedAt: string;
        note?: string;
    };
}

export const FALLBACK_CLINICS: ClinicProfile[] = [
    {
        id: 'akademikliniken-stockholm',
        name: 'Akademikliniken',
        address: 'Storängsvägen 10, Stockholm',
        city: 'Stockholm',
        website: 'https://www.akademikliniken.se',
        phone: null,
        treatments: ['Botox', 'Fillers', 'Rhinoplastik', 'Käklinje'],
        verified: true,
        coordinates: { lat: 59.34737, lng: 18.09321 },
        sources: {
            google: { source: 'google', rating: 4.6, reviewCount: 430, url: 'https://maps.google.com/?q=Akademikliniken+Stockholm', fetched: 'fallback' },
            trustpilot: { source: 'trustpilot', rating: 4.1, reviewCount: 120, url: 'https://www.trustpilot.com/review/akademikliniken.se', fetched: 'fallback' },
            reco: { source: 'reco', rating: 4.3, reviewCount: 70, url: 'https://reco.se/sok?q=Akademikliniken', fetched: 'fallback' },
        },
        trustScore: 4.4,
    },
    {
        id: 'nordiska-kliniken-stockholm',
        name: 'Nordiska Kliniken',
        address: 'Drottninggatan 65, Stockholm',
        city: 'Stockholm',
        website: 'https://nordiskakliniken.se',
        phone: null,
        treatments: ['Fillers', 'Botox', 'Skinboosters'],
        verified: true,
        coordinates: { lat: 59.33693, lng: 18.06076 },
        sources: {
            google: { source: 'google', rating: 4.7, reviewCount: 280, url: 'https://maps.google.com/?q=Nordiska+Kliniken+Stockholm', fetched: 'fallback' },
            trustpilot: { source: 'trustpilot', rating: 4.2, reviewCount: 90, url: 'https://www.trustpilot.com/review/nordiskakliniken.se', fetched: 'fallback' },
            reco: { source: 'reco', rating: 4.4, reviewCount: 52, url: 'https://reco.se/sok?q=Nordiska%20Kliniken', fetched: 'fallback' },
        },
        trustScore: 4.5,
    },
    {
        id: 'astoriakliniken-stockholm',
        name: 'Astoriakliniken',
        address: 'Nybrogatan 16, Stockholm',
        city: 'Stockholm',
        website: 'https://www.astoriakliniken.se',
        phone: null,
        treatments: ['Botox', 'Fillers', 'Näskorrigering'],
        verified: true,
        coordinates: { lat: 59.33784, lng: 18.07852 },
        sources: {
            google: { source: 'google', rating: 4.5, reviewCount: 200, url: 'https://maps.google.com/?q=Astoriakliniken+Stockholm', fetched: 'fallback' },
            trustpilot: { source: 'trustpilot', rating: 3.9, reviewCount: 55, url: 'https://www.trustpilot.com/review/astoriakliniken.se', fetched: 'fallback' },
            reco: { source: 'reco', rating: 4.1, reviewCount: 34, url: 'https://reco.se/sok?q=Astoriakliniken', fetched: 'fallback' },
        },
        trustScore: 4.2,
    },
    {
        id: 'elit-klinik-goteborg',
        name: 'Elite Clinic Göteborg',
        address: 'Kungsportsavenyen 3, Göteborg',
        city: 'Göteborg',
        website: 'https://eliteclinic.se',
        phone: null,
        treatments: ['Käklinje', 'Fillers', 'Botox'],
        verified: true,
        coordinates: { lat: 57.70052, lng: 11.97311 },
        sources: {
            google: { source: 'google', rating: 4.6, reviewCount: 190, url: 'https://maps.google.com/?q=Elite+Clinic+Göteborg', fetched: 'fallback' },
            trustpilot: { source: 'trustpilot', rating: 4, reviewCount: 40, url: 'https://www.trustpilot.com/review/eliteclinic.se', fetched: 'fallback' },
            reco: { source: 'reco', rating: 4.2, reviewCount: 28, url: 'https://reco.se/sok?q=Elite%20Clinic%20Göteborg', fetched: 'fallback' },
        },
        trustScore: 4.3,
    },
    {
        id: 'poseidon-goteborg',
        name: 'Poseidonkliniken',
        address: 'Södra Vägen 10, Göteborg',
        city: 'Göteborg',
        website: 'https://poseidonkliniken.se',
        phone: null,
        treatments: ['Rhinoplastik', 'Ansiktskirurgi', 'Botox'],
        verified: true,
        coordinates: { lat: 57.69792, lng: 11.98603 },
        sources: {
            google: { source: 'google', rating: 4.4, reviewCount: 145, url: 'https://maps.google.com/?q=Poseidonkliniken+Göteborg', fetched: 'fallback' },
            trustpilot: { source: 'trustpilot', rating: 3.8, reviewCount: 33, url: 'https://www.trustpilot.com/review/poseidonkliniken.se', fetched: 'fallback' },
            reco: { source: 'reco', rating: 4, reviewCount: 19, url: 'https://reco.se/sok?q=Poseidonkliniken', fetched: 'fallback' },
        },
        trustScore: 4.1,
    },
    {
        id: 'estetiska-institutet-malmo',
        name: 'Estetiska Institutet Malmö',
        address: 'Stortorget 9, Malmö',
        city: 'Malmö',
        website: 'https://estetiskainstitutet.se',
        phone: null,
        treatments: ['Fillers', 'Läppar', 'Botox'],
        verified: true,
        coordinates: { lat: 55.60517, lng: 13.00073 },
        sources: {
            google: { source: 'google', rating: 4.5, reviewCount: 165, url: 'https://maps.google.com/?q=Estetiska+Institutet+Malmö', fetched: 'fallback' },
            trustpilot: { source: 'trustpilot', rating: 4, reviewCount: 25, url: 'https://www.trustpilot.com/review/estetiskainstitutet.se', fetched: 'fallback' },
            reco: { source: 'reco', rating: 4.2, reviewCount: 22, url: 'https://reco.se/sok?q=Estetiska%20Institutet%20Malmö', fetched: 'fallback' },
        },
        trustScore: 4.3,
    },
];

export function normalizeDomain(rawUrl: string | null): string | null {
    if (!rawUrl) return null;
    try {
        const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
        return url.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
        return null;
    }
}

export function scoreFromSources(sources: ClinicProfile['sources']): number {
    const entries = [
        { value: sources.google.rating, weight: 0.5 },
        { value: sources.trustpilot.rating, weight: 0.3 },
        { value: sources.reco.rating, weight: 0.2 },
    ].filter((entry) => typeof entry.value === 'number') as Array<{ value: number; weight: number }>;

    if (entries.length === 0) return 0;

    const weightedSum = entries.reduce((sum, entry) => sum + entry.value * entry.weight, 0);
    const usedWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
    return Number((weightedSum / usedWeight).toFixed(1));
}

export function buildGoogleMapsSearchUrl(name: string, city: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`;
}

export function buildRecoSearchUrl(name: string) {
    return `https://reco.se/sok?q=${encodeURIComponent(name)}`;
}

