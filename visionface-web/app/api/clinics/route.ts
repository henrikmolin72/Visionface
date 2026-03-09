import { NextResponse } from 'next/server';
import {
    FALLBACK_CLINICS,
    buildGoogleMapsSearchUrl,
    buildRecoSearchUrl,
    normalizeDomain,
    scoreFromSources,
    type ClinicProfile,
    type ClinicsApiResponse,
    type ReviewSnapshot,
} from '@/lib/clinicData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type GoogleTextSearchResponse = {
    results?: Array<{
        place_id: string;
        name: string;
        rating?: number;
        user_ratings_total?: number;
        formatted_address?: string;
        geometry?: { location?: { lat?: number; lng?: number } };
    }>;
};

type GooglePlaceDetailsResponse = {
    result?: {
        website?: string;
        international_phone_number?: string;
        formatted_address?: string;
    };
};

function timeoutSignal(ms: number) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    return {
        signal: controller.signal,
        clear: () => clearTimeout(timeout),
    };
}

function clinicMatchesQuery(clinic: ClinicProfile, city: string, query: string) {
    const cityFilter = city.trim().toLowerCase();
    const queryFilter = query.trim().toLowerCase();
    const cityMatch = !cityFilter || clinic.city.toLowerCase().includes(cityFilter);
    if (!cityMatch) return false;
    if (!queryFilter) return true;

    const haystack = `${clinic.name} ${clinic.address} ${clinic.treatments.join(' ')}`.toLowerCase();
    return queryFilter
        .split(' ')
        .filter(Boolean)
        .every((token) => haystack.includes(token));
}

function fallbackByDomainOrName(domain: string | null, name: string) {
    const lowerName = name.toLowerCase();
    return FALLBACK_CLINICS.find((clinic) => {
        const clinicDomain = normalizeDomain(clinic.website);
        if (domain && clinicDomain === domain) return true;
        return lowerName.includes(clinic.name.toLowerCase()) || clinic.name.toLowerCase().includes(lowerName);
    });
}

async function tryFetchTrustpilot(domain: string | null): Promise<ReviewSnapshot> {
    if (!domain) {
        return {
            source: 'trustpilot',
            rating: null,
            reviewCount: null,
            url: null,
            fetched: 'unavailable',
        };
    }

    const url = `https://www.trustpilot.com/review/${domain}`;
    if (process.env.ENABLE_TRUSTPILOT_LOOKUP !== 'true') {
        return {
            source: 'trustpilot',
            rating: null,
            reviewCount: null,
            url,
            fetched: 'unavailable',
        };
    }

    const { signal, clear } = timeoutSignal(2500);
    try {
        const res = await fetch(url, {
            signal,
            headers: {
                'user-agent': 'Mozilla/5.0 (compatible; VisionFaceBot/1.0)',
            },
            cache: 'no-store',
        });
        clear();
        if (!res.ok) {
            return {
                source: 'trustpilot',
                rating: null,
                reviewCount: null,
                url,
                fetched: 'unavailable',
            };
        }

        const html = await res.text();
        const ratingMatch = html.match(/"ratingValue"\s*:\s*"?([0-9.]+)"?/);
        const countMatch = html.match(/"reviewCount"\s*:\s*"?([0-9,]+)"?/);
        const rating = ratingMatch?.[1] ? Number(ratingMatch[1]) : null;
        const reviewCount = countMatch?.[1]
            ? Number(countMatch[1].replace(/,/g, ''))
            : null;

        return {
            source: 'trustpilot',
            rating: Number.isFinite(rating) ? rating : null,
            reviewCount: Number.isFinite(reviewCount) ? reviewCount : null,
            url,
            fetched: Number.isFinite(rating) ? 'live' : 'unavailable',
        };
    } catch {
        clear();
        return {
            source: 'trustpilot',
            rating: null,
            reviewCount: null,
            url,
            fetched: 'unavailable',
        };
    }
}

async function fetchGoogleClinics(city: string, query: string, apiKey: string): Promise<ClinicProfile[]> {
    const searchQuery = `${query} estetisk klinik ${city} Sverige`.trim();
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('query', searchQuery);
    searchUrl.searchParams.set('language', 'sv');
    searchUrl.searchParams.set('region', 'se');
    searchUrl.searchParams.set('key', apiKey);

    const { signal, clear } = timeoutSignal(5000);
    const response = await fetch(searchUrl.toString(), {
        signal,
        cache: 'no-store',
    });
    clear();

    if (!response.ok) {
        throw new Error(`Google Places search failed: ${response.status}`);
    }

    const data = (await response.json()) as GoogleTextSearchResponse;
    const results = data.results ?? [];

    const topResults = results.slice(0, 10);
    const clinics = await Promise.all(
        topResults.map(async (place, index) => {
            const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
            detailsUrl.searchParams.set('place_id', place.place_id);
            detailsUrl.searchParams.set('fields', 'website,international_phone_number,formatted_address');
            detailsUrl.searchParams.set('language', 'sv');
            detailsUrl.searchParams.set('key', apiKey);

            let details: GooglePlaceDetailsResponse['result'] | undefined;
            try {
                const detailsRes = await fetch(detailsUrl.toString(), { cache: 'no-store' });
                if (detailsRes.ok) {
                    const detailsData = (await detailsRes.json()) as GooglePlaceDetailsResponse;
                    details = detailsData.result;
                }
            } catch {
                details = undefined;
            }

            const website = details?.website ?? null;
            const domain = normalizeDomain(website);
            const fallbackMatch = fallbackByDomainOrName(domain, place.name);
            const trustpilot = await tryFetchTrustpilot(domain);

            const recoSnapshot: ReviewSnapshot = fallbackMatch?.sources.reco
                ? { ...fallbackMatch.sources.reco, fetched: 'fallback' }
                : {
                    source: 'reco',
                    rating: null,
                    reviewCount: null,
                    url: buildRecoSearchUrl(place.name),
                    fetched: 'unavailable',
                };

            const googleSnapshot: ReviewSnapshot = {
                source: 'google',
                rating: typeof place.rating === 'number' ? Number(place.rating.toFixed(1)) : null,
                reviewCount: typeof place.user_ratings_total === 'number' ? place.user_ratings_total : null,
                url: buildGoogleMapsSearchUrl(place.name, city),
                fetched: typeof place.rating === 'number' ? 'live' : 'unavailable',
            };

            const sources = {
                google: googleSnapshot,
                trustpilot: trustpilot.rating !== null
                    ? trustpilot
                    : fallbackMatch?.sources.trustpilot
                        ? { ...fallbackMatch.sources.trustpilot, fetched: 'fallback' as const }
                        : trustpilot,
                reco: recoSnapshot,
            };

            return {
                id: `google-${place.place_id}-${index}`,
                name: place.name,
                address: details?.formatted_address ?? place.formatted_address ?? city,
                city,
                website,
                phone: details?.international_phone_number ?? null,
                treatments: fallbackMatch?.treatments ?? ['Botox', 'Fillers', 'Hudförbättring'],
                verified: true,
                coordinates: {
                    lat: place.geometry?.location?.lat ?? 0,
                    lng: place.geometry?.location?.lng ?? 0,
                },
                sources,
                trustScore: scoreFromSources(sources),
            } satisfies ClinicProfile;
        })
    );

    return clinics
        .filter((clinic) => clinic.coordinates.lat !== 0 && clinic.coordinates.lng !== 0)
        .sort((a, b) => b.trustScore - a.trustScore);
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const city = (url.searchParams.get('city') ?? 'Stockholm').trim();
    const query = (url.searchParams.get('q') ?? 'estetik').trim();
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    try {
        if (googleApiKey) {
            const clinics = await fetchGoogleClinics(city, query, googleApiKey);
            if (clinics.length > 0) {
                const payload: ClinicsApiResponse = {
                    clinics,
                    meta: {
                        source: 'google_places',
                        city,
                        query,
                        generatedAt: new Date().toISOString(),
                        note: 'Google omdömen är live. Trustpilot/Reco hämtas live när möjligt, annars fallback.',
                    },
                };
                return NextResponse.json(payload, { status: 200 });
            }
        }

        const fallbackClinics = FALLBACK_CLINICS
            .filter((clinic) => clinicMatchesQuery(clinic, city, query))
            .sort((a, b) => b.trustScore - a.trustScore);

        const payload: ClinicsApiResponse = {
            clinics: fallbackClinics.length > 0 ? fallbackClinics : FALLBACK_CLINICS,
            meta: {
                source: 'fallback_directory',
                city,
                query,
                generatedAt: new Date().toISOString(),
                note: 'Fallback-katalog används. Lägg till GOOGLE_PLACES_API_KEY för live-sökning av kliniker och webbplatser.',
            },
        };

        return NextResponse.json(payload, { status: 200 });
    } catch (error) {
        const payload: ClinicsApiResponse = {
            clinics: FALLBACK_CLINICS,
            meta: {
                source: 'fallback_directory',
                city,
                query,
                generatedAt: new Date().toISOString(),
                note: 'Live-hämtning misslyckades, fallback-katalog visas.',
            },
        };
        return NextResponse.json(payload, { status: 200 });
    }
}
