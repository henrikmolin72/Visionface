import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ETHNICITY_LABELS } from '../../data/facialProportions';
import { Ethnicity } from '../../types/facial';

// Mock scan history — in production this comes from AsyncStorage/SQLite
const MOCK_SCANS = [
    {
        id: 's1',
        overallScore: 74,
        ethnicity: 'european' as Ethnicity,
        capturedAt: '2026-04-08T14:22:00Z',
        suggestionCount: 3,
    },
    {
        id: 's2',
        overallScore: 71,
        ethnicity: 'european' as Ethnicity,
        capturedAt: '2026-03-22T09:11:00Z',
        suggestionCount: 4,
    },
    {
        id: 's3',
        overallScore: 68,
        ethnicity: 'european' as Ethnicity,
        capturedAt: '2026-03-01T18:45:00Z',
        suggestionCount: 4,
    },
];

function ScoreDelta({ current, previous }: { current: number; previous: number }) {
    const delta = current - previous;
    if (delta === 0) return <Text className="text-xs text-textMuted">±0</Text>;
    return (
        <Text className="text-xs font-semibold" style={{ color: delta > 0 ? '#6EE7B7' : '#F87171' }}>
            {delta > 0 ? '+' : ''}{delta}
        </Text>
    );
}

function ScanHistoryCard({
    scan,
    previousScore,
    onPress,
}: {
    scan: typeof MOCK_SCANS[0];
    previousScore?: number;
    onPress: () => void;
}) {
    const date = new Date(scan.capturedAt).toLocaleDateString('sv-SE', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
    const scoreColor = scan.overallScore >= 75 ? '#6EE7B7' : scan.overallScore >= 50 ? '#FBBF24' : '#F87171';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="bg-white rounded-2xl p-5 mb-3 flex-row items-center shadow-sm border border-gray-100"
        >
            <View
                className="w-14 h-14 rounded-full items-center justify-center mr-4 border-2"
                style={{ borderColor: scoreColor }}
            >
                <Text className="text-xl font-bold" style={{ color: scoreColor }}>{scan.overallScore}</Text>
            </View>
            <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-0.5">
                    <Text className="text-sm font-semibold text-textDark">{date}</Text>
                    {previousScore != null && (
                        <ScoreDelta current={scan.overallScore} previous={previousScore} />
                    )}
                </View>
                <Text className="text-xs text-textMuted">
                    {ETHNICITY_LABELS[scan.ethnicity]} · {scan.suggestionCount} rekommendationer
                </Text>
            </View>
            <Text className="text-gray-300 text-lg">›</Text>
        </TouchableOpacity>
    );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <View className="bg-white rounded-2xl p-4 flex-1 items-center shadow-sm">
            <Text className="text-2xl font-bold text-textDark">{value}</Text>
            {sub && <Text className="text-xs text-softMint font-medium">{sub}</Text>}
            <Text className="text-xs text-textMuted mt-1 text-center">{label}</Text>
        </View>
    );
}

export default function ProfileScreen() {
    const navigation = useNavigation();
    const [scans] = useState(MOCK_SCANS);

    const latest = scans[0];
    const oldest = scans[scans.length - 1];
    const trend = latest && oldest ? latest.overallScore - oldest.overallScore : 0;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-textDark pt-16 pb-8 px-6">
                <Text className="text-clinicalWhite text-2xl font-semibold mb-1">Min Profil</Text>
                <Text className="text-gray-400 text-sm">Spårning och historik</Text>

                {/* Stats row */}
                <View className="flex-row gap-3 mt-5">
                    <StatCard label="Skanningar" value={String(scans.length)} />
                    <StatCard
                        label="Senaste poäng"
                        value={latest ? String(latest.overallScore) : '–'}
                        sub="/100"
                    />
                    <StatCard
                        label="Trend"
                        value={trend >= 0 ? `+${trend}` : String(trend)}
                        sub={trend >= 0 ? '↑' : '↓'}
                    />
                </View>
            </View>

            <View className="px-4 pt-5 pb-10">
                {/* Scan history */}
                <Text className="text-lg font-semibold text-textDark mb-3">Skanningshistorik</Text>
                {scans.length === 0 ? (
                    <View className="bg-white rounded-2xl p-8 items-center shadow-sm">
                        <Text className="text-4xl mb-3">📷</Text>
                        <Text className="text-textDark font-semibold">Inga skanningar än</Text>
                        <Text className="text-textMuted text-sm mt-1 text-center">
                            Gå till Scan-fliken för att analysera ditt ansikte.
                        </Text>
                    </View>
                ) : (
                    scans.map((scan, i) => (
                        <ScanHistoryCard
                            key={scan.id}
                            scan={scan}
                            previousScore={scans[i + 1]?.overallScore}
                            onPress={() => {}}
                        />
                    ))
                )}

                {/* Settings links */}
                <Text className="text-lg font-semibold text-textDark mt-6 mb-3">Inställningar</Text>
                <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <TouchableOpacity
                        onPress={() => (navigation as any).navigate('Privacy')}
                        className="px-5 py-4 flex-row items-center border-b border-gray-100"
                    >
                        <Text className="text-lg mr-3">🔒</Text>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-textDark">Integritet & Data</Text>
                            <Text className="text-xs text-textMuted">Hantera vad vi lagrar om dig</Text>
                        </View>
                        <Text className="text-gray-300">›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-5 py-4 flex-row items-center border-b border-gray-100">
                        <Text className="text-lg mr-3">🔔</Text>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-textDark">Notifikationer</Text>
                            <Text className="text-xs text-textMuted">Påminnelser och uppdateringar</Text>
                        </View>
                        <Text className="text-gray-300">›</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="px-5 py-4 flex-row items-center">
                        <Text className="text-lg mr-3">ℹ️</Text>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-textDark">Om VisionFace</Text>
                            <Text className="text-xs text-textMuted">Version 1.0.0</Text>
                        </View>
                        <Text className="text-gray-300">›</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
