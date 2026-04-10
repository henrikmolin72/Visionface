import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScanStackParamList } from '../../navigation/types';
import { generateSuggestions } from '../../services/ProcedureSuggestions';
import { ProcedureSuggestion, RiskLevel } from '../../types/facial';
import { ETHNICITY_LABELS } from '../../data/facialProportions';

type Route = RouteProp<ScanStackParamList, 'AnalysisResult'>;
type Nav = NativeStackNavigationProp<ScanStackParamList, 'AnalysisResult'>;

const PRIORITY_COLOR: Record<string, string> = {
    critical: '#F87171',
    high: '#FB923C',
    medium: '#FBBF24',
    low: '#6EE7B7',
};

const PRIORITY_LABEL: Record<string, string> = {
    critical: 'Kritisk',
    high: 'Hög',
    medium: 'Medel',
    low: 'Låg',
};

const RISK_COLOR: Record<RiskLevel, string> = {
    low: '#6EE7B7',
    moderate: '#FBBF24',
    high: '#F87171',
};

function ScoreRing({ score }: { score: number }) {
    const color = score >= 75 ? '#6EE7B7' : score >= 50 ? '#FBBF24' : '#F87171';
    return (
        <View className="items-center justify-center w-28 h-28 rounded-full border-4" style={{ borderColor: color }}>
            <Text className="text-4xl font-bold" style={{ color }}>{score}</Text>
            <Text className="text-xs text-textMuted">/100</Text>
        </View>
    );
}

function SuggestionCard({ suggestion }: { suggestion: ProcedureSuggestion }) {
    const { procedure, area, priority, confidence, improvementEstimate, reason } = suggestion;
    return (
        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-2">
                    <Text className="text-lg font-semibold text-textDark">{procedure.name}</Text>
                    <Text className="text-sm text-textMuted">{area}</Text>
                </View>
                <View
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLOR[priority] + '33' }}
                >
                    <Text className="text-xs font-bold" style={{ color: PRIORITY_COLOR[priority] }}>
                        {PRIORITY_LABEL[priority]}
                    </Text>
                </View>
            </View>

            <Text className="text-sm text-textMuted mb-3 leading-5">{reason}</Text>

            <View className="flex-row items-center mb-3">
                <View className="flex-1 h-2 bg-gray-100 rounded-full mr-3">
                    <View
                        className="h-2 rounded-full"
                        style={{
                            width: `${Math.round(confidence * 100)}%`,
                            backgroundColor: PRIORITY_COLOR[priority],
                        }}
                    />
                </View>
                <Text className="text-xs text-textMuted">{Math.round(confidence * 100)}% match</Text>
            </View>

            <View className="flex-row justify-between items-center">
                <Text className="text-xs text-textMuted">
                    Uppskattad förbättring: <Text className="font-bold text-textDark">+{improvementEstimate}%</Text>
                </Text>
                <Text className="text-xs text-textMuted">
                    {procedure.costRangeSEK[0].toLocaleString('sv-SE')}–{procedure.costRangeSEK[1].toLocaleString('sv-SE')} kr
                </Text>
            </View>

            {procedure.risks.length > 0 && (
                <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-xs font-semibold text-textDark mb-1">Risker</Text>
                    {procedure.risks.slice(0, 2).map((risk, i) => (
                        <View key={i} className="flex-row items-center mb-1">
                            <View
                                className="w-2 h-2 rounded-full mr-2"
                                style={{ backgroundColor: RISK_COLOR[risk.level] }}
                            />
                            <Text className="text-xs text-textMuted">{risk.label}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

function MeasurementRow({ label, value, unit = '' }: { label: string; value: number; unit?: string }) {
    return (
        <View className="flex-row justify-between py-2 border-b border-gray-100">
            <Text className="text-sm text-textMuted">{label}</Text>
            <Text className="text-sm font-semibold text-textDark">{value}{unit}</Text>
        </View>
    );
}

export default function AnalysisResultScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation<Nav>();
    const { result } = route.params;
    const { measurements, ethnicity, overallScore, capturedAt } = result;

    const suggestions = useMemo(
        () => generateSuggestions(measurements, ethnicity),
        [measurements, ethnicity],
    );

    const date = new Date(capturedAt).toLocaleDateString('sv-SE', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-textDark pt-16 pb-8 px-6 items-center">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="absolute left-6 top-16"
                >
                    <Text className="text-softMint text-base">← Tillbaka</Text>
                </TouchableOpacity>
                <Text className="text-clinicalWhite text-2xl font-semibold mb-1">Analysresultat</Text>
                <Text className="text-gray-400 text-sm mb-6">{date} · {ETHNICITY_LABELS[ethnicity]}</Text>
                <ScoreRing score={overallScore} />
                <Text className="text-gray-400 text-sm mt-3">Övergripande poäng</Text>
            </View>

            <View className="px-4 pt-6 pb-10">
                {/* Measurements */}
                <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
                    <Text className="text-lg font-semibold text-textDark mb-3">Ansiktsmått</Text>
                    <MeasurementRow label="Bredd/Höjd-ratio" value={measurements.faceWidthHeightRatio} />
                    <MeasurementRow label="Ögonmellanrum" value={Math.round(measurements.eyeSpacingRatio * 100)} unit="%" />
                    <MeasurementRow label="Näsbredd" value={Math.round(measurements.noseWidthRatio * 100)} unit="%" />
                    <MeasurementRow label="Käklinjepoäng" value={measurements.jawlineScore} unit="/100" />
                    <MeasurementRow label="Symmetripoäng" value={measurements.symmetryScore} unit="/100" />
                    <MeasurementRow label="Gyllene snittet" value={measurements.goldenRatioScore} unit="/100" />
                    <MeasurementRow label="Kindbensprominens" value={measurements.cheekboneProminence} unit="/100" />
                </View>

                {/* Suggestions */}
                <Text className="text-xl font-semibold text-textDark mb-4">
                    Rekommenderade ingrepp ({suggestions.length})
                </Text>
                {suggestions.length === 0 ? (
                    <View className="bg-white rounded-2xl p-6 items-center">
                        <Text className="text-4xl mb-2">✓</Text>
                        <Text className="text-textDark font-semibold text-lg">Utmärkta proportioner</Text>
                        <Text className="text-textMuted text-sm text-center mt-1">
                            Dina ansiktsmått ligger nära optimala värden för din etniska bakgrund.
                        </Text>
                    </View>
                ) : (
                    suggestions.map((s) => (
                        <SuggestionCard key={s.procedure.id} suggestion={s} />
                    ))
                )}

                {/* AI Consultation CTA */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Consultation', { result })}
                    className="bg-textDark rounded-2xl p-5 mb-4 flex-row items-center"
                >
                    <View className="w-10 h-10 rounded-full bg-softMint items-center justify-center mr-4">
                        <Text className="text-lg">💬</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-clinicalWhite font-semibold text-base">Fråga AI-konsulten</Text>
                        <Text className="text-gray-400 text-sm">Få svar på dina frågor om ingrepp och risker</Text>
                    </View>
                    <Text className="text-softMint text-lg">→</Text>
                </TouchableOpacity>

                {/* Disclaimer */}
                <View className="mt-2 p-4 bg-roseDust/20 rounded-xl">
                    <Text className="text-xs text-textMuted text-center leading-5">
                        Denna analys är enbart informativ och ersätter inte professionell medicinsk rådgivning.
                        Konsultera alltid en legitimerad läkare eller plastikkirurg innan du genomgår några ingrepp.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
