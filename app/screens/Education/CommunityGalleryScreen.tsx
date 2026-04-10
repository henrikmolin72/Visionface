import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PROCEDURES } from '../../data/procedures';

interface GalleryEntry {
    id: string;
    procedureId: string;
    monthsPostOp: number;
    rating: number;
    comment: string;
    scoreChange: number; // delta in VisionFace score
    anonymous: boolean;
    initials: string;
    verified: boolean;
}

const GALLERY: GalleryEntry[] = [
    {
        id: 'g1',
        procedureId: 'rhinoplasty',
        monthsPostOp: 6,
        rating: 5,
        comment: 'Resultatet översteg mina förväntningar. Näsan ser naturlig ut och passar mitt ansikte perfekt. Återhämtningen tog ca 2 veckor.',
        scoreChange: 12,
        anonymous: true,
        initials: 'A.K.',
        verified: true,
    },
    {
        id: 'g2',
        procedureId: 'jawlineContouring',
        monthsPostOp: 3,
        rating: 5,
        comment: 'Käklinjekonturering med filler. Subtle men tydlig skillnad — exakt vad jag ville ha. Ingen driftstopp.',
        scoreChange: 8,
        anonymous: true,
        initials: 'M.T.',
        verified: true,
    },
    {
        id: 'g3',
        procedureId: 'lipFiller',
        monthsPostOp: 1,
        rating: 4,
        comment: 'Nöjd med resultatet, men svullnaden tog längre tid än förväntat — hela 5 dagar. Nu ser det bra ut.',
        scoreChange: 5,
        anonymous: false,
        initials: 'Sofia L.',
        verified: true,
    },
    {
        id: 'g4',
        procedureId: 'chinAugmentation',
        monthsPostOp: 12,
        rating: 5,
        comment: 'Hakförstärkning med implantat. Liv-förändrande. Profilen ser helt annorlunda ut. Kirurgen var fantastisk.',
        scoreChange: 15,
        anonymous: true,
        initials: 'P.J.',
        verified: true,
    },
    {
        id: 'g5',
        procedureId: 'botox',
        monthsPostOp: 2,
        rating: 4,
        comment: 'Botox för masseter (käklinje). Märkbar smalare käke efter 4 veckor. Lite ömt direkt efter men inget allvarligt.',
        scoreChange: 6,
        anonymous: true,
        initials: 'E.H.',
        verified: false,
    },
    {
        id: 'g6',
        procedureId: 'cheekAugmentation',
        monthsPostOp: 4,
        rating: 5,
        comment: 'Kindförstärkning med filler. Kindbenens definition är nu precis vad jag drömt om. Rekommenderas varmt.',
        scoreChange: 10,
        anonymous: true,
        initials: 'L.N.',
        verified: true,
    },
];

const PROCEDURE_FILTERS = ['all', ...Object.keys(PROCEDURES)];

function StarRow({ rating }: { rating: number }) {
    return (
        <Text className="text-yellow-400 text-sm">
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
        </Text>
    );
}

function GalleryCard({ entry }: { entry: GalleryEntry }) {
    const procedure = PROCEDURES[entry.procedureId];
    if (!procedure) return null;

    return (
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-3">
                    <Text className="text-base font-bold text-textDark">{procedure.name}</Text>
                    <Text className="text-xs text-textMuted">{entry.monthsPostOp} månader efter ingreppet</Text>
                </View>
                <View className="items-end">
                    <View className="bg-softMint/20 px-2 py-0.5 rounded-full">
                        <Text className="text-xs font-bold text-textDark">+{entry.scoreChange} poäng</Text>
                    </View>
                    {entry.verified && (
                        <Text className="text-xs text-softMint mt-1">✓ Verifierad</Text>
                    )}
                </View>
            </View>

            <StarRow rating={entry.rating} />

            <Text className="text-sm text-textDark leading-5 mt-2 mb-3">{entry.comment}</Text>

            <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
                <Text className="text-xs text-textMuted">
                    {entry.anonymous ? `Anonym (${entry.initials})` : entry.initials}
                </Text>
                <View className="flex-row gap-2">
                    {procedure.risks.slice(0, 1).map((r, i) => (
                        <View key={i} className="bg-gray-100 px-2 py-0.5 rounded-full">
                            <Text className="text-xs text-textMuted">{procedure.category}</Text>
                        </View>
                    ))}
                    <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-textMuted">
                            {procedure.costRangeSEK[0].toLocaleString('sv-SE')}+ kr
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function CommunityGalleryScreen() {
    const navigation = useNavigation();
    const [activeFilter, setActiveFilter] = useState('all');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const filtered = GALLERY.filter((e) => {
        const matchProc = activeFilter === 'all' || e.procedureId === activeFilter;
        const matchVerified = !verifiedOnly || e.verified;
        return matchProc && matchVerified;
    });

    const avgScoreChange = filtered.length
        ? Math.round(filtered.reduce((s, e) => s + e.scoreChange, 0) / filtered.length)
        : 0;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-textDark pt-16 pb-5 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
                    <Text className="text-softMint text-base">← Tillbaka</Text>
                </TouchableOpacity>
                <Text className="text-clinicalWhite text-2xl font-semibold">Patientgalleri</Text>
                <Text className="text-gray-400 text-sm mt-1">
                    Anonyma erfarenheter från verkliga patienter
                </Text>

                {/* Summary stats */}
                <View className="flex-row mt-4 gap-3">
                    <View className="bg-white/10 rounded-xl px-4 py-2 items-center flex-1">
                        <Text className="text-clinicalWhite font-bold text-lg">{GALLERY.length}</Text>
                        <Text className="text-gray-400 text-xs">berättelser</Text>
                    </View>
                    <View className="bg-white/10 rounded-xl px-4 py-2 items-center flex-1">
                        <Text className="text-clinicalWhite font-bold text-lg">+{avgScoreChange}</Text>
                        <Text className="text-gray-400 text-xs">snitt poäng</Text>
                    </View>
                    <View className="bg-white/10 rounded-xl px-4 py-2 items-center flex-1">
                        <Text className="text-clinicalWhite font-bold text-lg">
                            {GALLERY.filter((e) => e.verified).length}
                        </Text>
                        <Text className="text-gray-400 text-xs">verifierade</Text>
                    </View>
                </View>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="bg-white border-b border-gray-100 py-3 px-4"
                contentContainerStyle={{ gap: 8 }}
            >
                <TouchableOpacity
                    onPress={() => setActiveFilter('all')}
                    className="px-3 py-1.5 rounded-full border"
                    style={{ borderColor: activeFilter === 'all' ? '#1F2937' : '#E5E7EB', backgroundColor: activeFilter === 'all' ? '#1F2937' : '#FFF' }}
                >
                    <Text className="text-xs" style={{ color: activeFilter === 'all' ? '#FFF' : '#6B7280' }}>Alla</Text>
                </TouchableOpacity>
                {Object.values(PROCEDURES).map((proc) => (
                    <TouchableOpacity
                        key={proc.id}
                        onPress={() => setActiveFilter(proc.id)}
                        className="px-3 py-1.5 rounded-full border"
                        style={{ borderColor: activeFilter === proc.id ? '#1F2937' : '#E5E7EB', backgroundColor: activeFilter === proc.id ? '#1F2937' : '#FFF' }}
                    >
                        <Text className="text-xs" style={{ color: activeFilter === proc.id ? '#FFF' : '#6B7280' }}>{proc.name}</Text>
                    </TouchableOpacity>
                ))}
                <View className="w-px bg-gray-200 mx-1" />
                <TouchableOpacity
                    onPress={() => setVerifiedOnly(!verifiedOnly)}
                    className="px-3 py-1.5 rounded-full border"
                    style={{ borderColor: verifiedOnly ? '#6EE7B7' : '#E5E7EB', backgroundColor: verifiedOnly ? '#6EE7B7' + '33' : '#FFF' }}
                >
                    <Text className="text-xs" style={{ color: verifiedOnly ? '#1F2937' : '#6B7280' }}>✓ Verifierade</Text>
                </TouchableOpacity>
            </ScrollView>

            <View className="px-4 pt-4 pb-10">
                <Text className="text-xs text-textMuted mb-3">{filtered.length} berättelser</Text>
                {filtered.map((entry) => <GalleryCard key={entry.id} entry={entry} />)}
                {filtered.length === 0 && (
                    <View className="items-center py-12">
                        <Text className="text-4xl mb-3">📸</Text>
                        <Text className="text-textDark font-semibold">Inga berättelser hittades</Text>
                        <Text className="text-textMuted text-sm mt-1">Prova ett annat filter</Text>
                    </View>
                )}

                <View className="mt-4 p-4 bg-roseDust/20 rounded-xl">
                    <Text className="text-xs text-textMuted text-center leading-5">
                        Berättelserna är anonymiserade och baserade på frivilliga patientbidrag.
                        Individuella resultat varierar. Konsultera alltid en läkare.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
