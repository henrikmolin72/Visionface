import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScanStackParamList } from '../../navigation/types';
import { ScanResult } from '../../types/facial';
import { ETHNICITY_LABELS } from '../../data/facialProportions';
import { Ethnicity } from '../../types/facial';

type Nav = NativeStackNavigationProp<ScanStackParamList, 'Camera'>;

// Demo result for web preview — shows the full analysis flow without a camera
const DEMO_RESULT: ScanResult = {
    measurements: {
        faceWidthHeightRatio: 1.28,
        eyeSpacingRatio: 0.44,
        noseWidthRatio: 0.30,
        jawlineScore: 74,
        symmetryScore: 81,
        goldenRatioScore: 68,
        chinProjection: 10,
        cheekboneProminence: 69,
    },
    ethnicity: 'european',
    overallScore: 74,
    capturedAt: new Date().toISOString(),
};

export default function CameraScanScreen() {
    const navigation = useNavigation<Nav>();

    return (
        <ScrollView className="flex-1 bg-textDark">
            {/* Header */}
            <View className="pt-16 pb-6 px-6 items-center">
                <Text className="text-clinicalWhite text-2xl font-semibold mb-2">VisionFace Scan</Text>
                <Text className="text-gray-400 text-sm text-center leading-5">
                    Kameraskanning kräver mobilappen.{'\n'}
                    Prova ett demo-resultat direkt i webbläsaren.
                </Text>
            </View>

            {/* Camera placeholder */}
            <View className="mx-6 rounded-3xl overflow-hidden bg-gray-800 items-center justify-center" style={{ height: 360 }}>
                <View className="w-48 h-72 border-4 border-softMint rounded-[100px] items-center justify-center mb-4">
                    <Text className="text-6xl">👤</Text>
                </View>
                <Text className="text-gray-400 text-sm">Kamera ej tillgänglig på webb</Text>
            </View>

            {/* Ethnicity info */}
            <View className="mx-6 mt-6 bg-white/10 rounded-2xl p-4">
                <Text className="text-clinicalWhite text-sm font-semibold mb-2">Demo-kalibrering</Text>
                <View className="flex-row flex-wrap gap-2">
                    {(Object.entries(ETHNICITY_LABELS) as [Ethnicity, string][]).map(([key, label]) => (
                        <View
                            key={key}
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: DEMO_RESULT.ethnicity === key ? '#6EE7B7' : 'rgba(255,255,255,0.1)' }}
                        >
                            <Text className="text-xs" style={{ color: DEMO_RESULT.ethnicity === key ? '#1F2937' : '#9CA3AF' }}>
                                {label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Mobile app CTA */}
            <View className="mx-6 mt-4 bg-softMint/10 border border-softMint/30 rounded-2xl p-4">
                <Text className="text-clinicalWhite text-sm font-semibold mb-1">📱 Fullständig analys</Text>
                <Text className="text-gray-400 text-xs leading-5">
                    Ladda ned mobilappen för ansiktsskanning med AI-landmärkesdetektering,
                    etniska proportionsjämförelser och realtidsåterkoppling.
                </Text>
            </View>

            {/* Demo button */}
            <View className="mx-6 mt-6 mb-10">
                <TouchableOpacity
                    onPress={() => navigation.navigate('AnalysisResult', { result: DEMO_RESULT })}
                    className="bg-softMint py-4 rounded-2xl items-center"
                >
                    <Text className="text-textDark font-bold text-lg">Visa demo-analys</Text>
                </TouchableOpacity>
                <Text className="text-gray-500 text-xs text-center mt-2">
                    Visar ett exempelresultat med alla funktioner
                </Text>
            </View>
        </ScrollView>
    );
}
