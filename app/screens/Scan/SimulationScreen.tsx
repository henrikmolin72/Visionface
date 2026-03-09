import React from 'react';
import { View, Text } from 'react-native';
import ActionBtn from '../../components/ActionBtn';

export default function SimulationScreen() {
    return (
        <View className="flex-1 bg-clinicalWhite">
            {/* Before / After View */}
            <View className="flex-3 h-3/5 bg-gray-200 items-center justify-center relative">
                <Text className="text-textMuted">Här ligger Real-time 2.5D simulering</Text>
                <View className="absolute bottom-4 bg-black/50 px-3 py-1 rounded-full">
                    <Text className="text-clinicalWhite text-xs">AI-Simulering. Resultat kan variera.</Text>
                </View>
            </View>

            {/* Controls */}
            <View className="flex-2 bg-clinicalWhite rounded-t-3xl -mt-6 p-6 shadow-2xl">
                <Text className="text-xl font-semibold text-textDark mb-1">Volym: Läppar</Text>
                <Text className="text-textMuted text-sm mb-6">Maximal anatomisk gräns applicerad.</Text>

                {/* Fake Slider */}
                <View className="h-2 bg-roseDust rounded-full w-full mb-8 relative">
                    <View className="absolute left-1/2 w-4 h-4 bg-primary rounded-full -mt-1 shadow" />
                </View>

                <ActionBtn title="Hitta kliniker för detta" onPress={() => { }} />
            </View>
        </View>
    );
}
