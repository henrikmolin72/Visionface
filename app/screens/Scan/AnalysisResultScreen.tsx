import React from 'react';
import { View, Text } from 'react-native';
import ActionBtn from '../../components/ActionBtn';

export default function AnalysisResultScreen() {
    return (
        <View className="flex-1 bg-textDark relative">
            {/* Fake Face Image Background */}
            <View className="flex-1 opacity-60 bg-gray-600" />

            {/* Overlay Analysis Points */}
            <View className="absolute top-1/3 left-1/4 bg-roseDust p-2 rounded-full">
                <Text className="text-xs font-bold text-textDark">Käkelinje: 85/100</Text>
            </View>

            <View className="absolute bottom-10 px-6 w-full">
                <View className="bg-clinicalWhite p-6 rounded-3xl mb-4 shadow-xl">
                    <Text className="text-2xl font-semibold mb-2 text-textDark">Analys Klar</Text>
                    <Text className="text-textMuted mb-4">
                        Dina proportioner är analyserade. Välj ett område för att utforska ingrepp och simulera resultat.
                    </Text>
                    <ActionBtn title="Utforska Ingrepp" onPress={() => { }} />
                </View>
            </View>
        </View>
    );
}
