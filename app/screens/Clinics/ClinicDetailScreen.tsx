import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import TrustBadge from '../../components/TrustBadge';
import ActionBtn from '../../components/ActionBtn';

export default function ClinicDetailScreen() {
    return (
        <ScrollView className="flex-1 bg-clinicalWhite p-6 pt-16">
            <View className="flex-row items-start justify-between mb-4">
                <Text className="text-3xl font-semibold text-textDark w-3/4">Estetiska Kliniken AB</Text>
                <TrustBadge isVerified={true} />
            </View>

            <Text className="text-textMuted mb-8 text-lg">Sturegatan 1, Stockholm</Text>

            <View className="bg-softMint/20 p-5 rounded-2xl mb-8 border border-softMint/50 shadow-sm">
                <Text className="text-textDark font-bold text-lg mb-2">Trust Score: 4.8 / 5.0</Text>
                <Text className="text-textMuted text-sm mb-1">• Google Reviews: 4.7 (120 omdömen)</Text>
                <Text className="text-textMuted text-sm mb-1">• Verifierad Licens: Ja</Text>
                <Text className="text-textMuted text-sm">• VisionFace Recensioner: 4.9 (45 omdömen)</Text>
            </View>

            <Text className="text-xl font-semibold text-textDark mb-4">Behandlingar</Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
                <View className="bg-textDark/5 px-3 py-1 rounded-full"><Text className="text-textDark text-sm">Fillers</Text></View>
                <View className="bg-textDark/5 px-3 py-1 rounded-full"><Text className="text-textDark text-sm">Botox</Text></View>
                <View className="bg-textDark/5 px-3 py-1 rounded-full"><Text className="text-textDark text-sm">Skinboosters</Text></View>
            </View>

            <View className="mt-8 mb-12 border-t border-textDark/10 pt-8 items-center">
                <Text className="text-textMuted text-center italic leading-6 px-4">
                    All tidsbokning sker externt. VisionFace hanterar inga betalningar eller bokningar direkt.
                </Text>
            </View>

            <ActionBtn title="Boka via webbplats" onPress={() => { }} />
        </ScrollView>
    );
}
