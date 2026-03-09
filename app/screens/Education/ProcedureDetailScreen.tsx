import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ActionBtn from '../../components/ActionBtn';

export default function ProcedureDetailScreen() {
    return (
        <ScrollView className="flex-1 bg-clinicalWhite p-6 pt-16">
            <Text className="text-3xl font-semibold text-textDark mb-2">Dermal Filler</Text>
            <Text className="text-primary font-bold text-lg mb-8 uppercase tracking-wider">Läppar, Käklinje</Text>

            <View className="mb-8">
                <Text className="text-xl font-semibold text-textDark mb-2">Medicinsk definition</Text>
                <Text className="text-textDark leading-6">
                    Injicering av hyaluronsyra för att bygga volym eller skulptera utvalda ansiktszoner.
                </Text>
            </View>

            <View className="mb-8">
                <Text className="text-xl font-semibold text-textDark mb-2">Förväntat resultat</Text>
                <Text className="text-textDark leading-6">
                    Omedelbar volymökning och ökad fuktnivå i huden.
                </Text>
            </View>

            <View className="bg-roseDust/40 p-5 rounded-2xl mb-8">
                <Text className="text-xl font-semibold text-textDark mb-2">Risker & Biverkningar</Text>
                <Text className="text-textDark leading-6 mb-2">
                    • Svullnad och blåmärken första veckan.
                </Text>
                <Text className="text-textDark leading-6">
                    • Risk för klumpar eller inkapsling (ovanligt vid korrekt utförande).
                </Text>
            </View>

            <View className="mt-4 mb-8">
                <ActionBtn title="Se kliniker för detta ingrepp" onPress={() => { }} />
            </View>
        </ScrollView>
    );
}
