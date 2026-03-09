'use client';

import { useMemo } from 'react';
import type { ClinicProfile } from '@/lib/clinicData';

interface ClinicsMapProps {
    clinics: ClinicProfile[];
    selectedClinicId: string | null;
    onSelectClinic: (clinicId: string) => void;
}

type BoundingBox = {
    west: number;
    south: number;
    east: number;
    north: number;
};

function buildBoundingBox(clinics: ClinicProfile[]): BoundingBox {
    const lats = clinics.map((c) => c.coordinates.lat);
    const lngs = clinics.map((c) => c.coordinates.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latPad = Math.max(0.12, (maxLat - minLat) * 0.22);
    const lngPad = Math.max(0.12, (maxLng - minLng) * 0.22);

    return {
        west: minLng - lngPad,
        south: minLat - latPad,
        east: maxLng + lngPad,
        north: maxLat + latPad,
    };
}

function markerPositionPercent(clinic: ClinicProfile, bbox: BoundingBox) {
    const x = ((clinic.coordinates.lng - bbox.west) / (bbox.east - bbox.west)) * 100;
    const y = ((bbox.north - clinic.coordinates.lat) / (bbox.north - bbox.south)) * 100;

    return {
        left: `${Math.max(2, Math.min(98, x))}%`,
        top: `${Math.max(4, Math.min(96, y))}%`,
    };
}

export default function ClinicsMap({ clinics, selectedClinicId, onSelectClinic }: ClinicsMapProps) {
    const bbox = useMemo(() => buildBoundingBox(clinics), [clinics]);

    const embedUrl = useMemo(() => {
        const bboxParam = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bboxParam)}&layer=mapnik`;
    }, [bbox]);

    const openStreetMapUrl = useMemo(() => {
        const centerLat = (bbox.north + bbox.south) / 2;
        const centerLng = (bbox.east + bbox.west) / 2;
        return `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=8/${centerLat}/${centerLng}`;
    }, [bbox]);

    return (
        <div className="relative w-full h-72 md:h-80 rounded-3xl overflow-hidden border border-[#bae6fd]/70 shadow-[0_18px_34px_rgba(14,116,144,0.12)] bg-white/90 backdrop-blur-sm">
            <iframe
                title="Klinikkarta"
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="absolute inset-0 pointer-events-none">
                {clinics.map((clinic, index) => {
                    const isSelected = clinic.id === selectedClinicId;
                    return (
                        <button
                            key={clinic.id}
                            type="button"
                            onClick={() => onSelectClinic(clinic.id)}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 text-[11px] font-bold pointer-events-auto transition-all ${isSelected
                                ? 'bg-[#0f172a] text-white border-white scale-110 shadow-lg'
                                : 'bg-white/95 text-[#1E293B] border-[#1E293B]/20 shadow'
                                }`}
                            style={markerPositionPercent(clinic, bbox)}
                            aria-label={`Visa ${clinic.name} på karta`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            <a
                href={openStreetMapUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute right-2 bottom-2 bg-white/92 backdrop-blur px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#475569] border border-[#dbeafe] shadow-sm"
            >
                Öppna i OSM
            </a>
        </div>
    );
}
