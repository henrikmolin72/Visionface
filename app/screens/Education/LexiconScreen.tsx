import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function LexiconScreen() {
    return (
        <ScrollView className="flex-1 bg-clinicalWhite p-6 pt-16">
            <Text className="text-3xl font-semibold text-textDark mb-6">Ingreppslexikon</Text>

            <View className="bg-softMint/20 p-5 rounded-2xl mb-4 border border-softMint/50">
                <Text className="text-lg font-bold text-textDark mb-1">Dermal Filler</Text>
                <Text className="text-textMuted mb-2">Injicering av hyaluronsyra för att bygga volym eller skulptera.</Text>
                <Text className="text-sm font-medium text-textDark">Varaktighet: 6–12 månader</Text>
            </View>

            <View className="bg-softMint/20 p-5 rounded-2xl mb-4 border border-softMint/50">
                <Text className="text-lg font-bold text-textDark mb-1">Botulinumtoxin</Text>
                <Text className="text-textMuted mb-2">Muskelavslappnande medel som dämpar dynamiska rynkor.</Text>
                <Text className="text-sm font-medium text-textDark">Varaktighet: 3–4 månader</Text>
            </View>

            <View className="bg-softMint/20 p-5 rounded-2xl mb-4 border border-softMint/50">
                <Text className="text-lg font-bold text-textDark mb-1">Skinboosters</Text>
                <Text className="text-textMuted mb-2">Djupgående fuktbehandling för lyster och spänst.</Text>
                <Text className="text-sm font-medium text-textDark">Varaktighet: 4–6 månader</Text>
            </View>
        </ScrollView>
    );
}
