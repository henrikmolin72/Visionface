import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface PrivacySetting {
    id: string;
    title: string;
    description: string;
    value: boolean;
}

const INITIAL_SETTINGS: PrivacySetting[] = [
    {
        id: 'storeScans',
        title: 'Spara skanningar lokalt',
        description: 'Lagra ansiktsskanningar på enheten för historik och jämförelser.',
        value: true,
    },
    {
        id: 'analytics',
        title: 'Anonym användningsstatistik',
        description: 'Hjälp oss förbättra appen genom att dela anonym data om hur funktioner används.',
        value: false,
    },
    {
        id: 'locationAlways',
        title: 'Platsdata för kliniksökning',
        description: 'Tillåt platsinformation för att hitta kliniker nära dig.',
        value: true,
    },
    {
        id: 'crashReports',
        title: 'Kraschrapporter',
        description: 'Skicka automatiska felrapporter vid krascher för att hjälpa oss felsöka.',
        value: true,
    },
];

export default function PrivacyScreen() {
    const navigation = useNavigation();
    const [settings, setSettings] = useState<PrivacySetting[]>(INITIAL_SETTINGS);

    function toggle(id: string) {
        setSettings((prev) =>
            prev.map((s) => (s.id === id ? { ...s, value: !s.value } : s)),
        );
    }

    function handleDeleteScans() {
        Alert.alert(
            'Radera alla skanningar',
            'Är du säker? Alla sparade ansiktsskanningar tas bort permanent.',
            [
                { text: 'Avbryt', style: 'cancel' },
                {
                    text: 'Radera',
                    style: 'destructive',
                    onPress: () => Alert.alert('Klart', 'Alla skanningar har raderats.'),
                },
            ],
        );
    }

    function handleDeleteAccount() {
        Alert.alert(
            'Radera konto',
            'Alla dina data, skanningar och inställningar raderas permanent. Denna åtgärd kan inte ångras.',
            [
                { text: 'Avbryt', style: 'cancel' },
                { text: 'Radera konto', style: 'destructive', onPress: () => {} },
            ],
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="bg-textDark pt-16 pb-6 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
                    <Text className="text-softMint text-base">← Tillbaka</Text>
                </TouchableOpacity>
                <Text className="text-clinicalWhite text-2xl font-semibold">Integritet & Data</Text>
                <Text className="text-gray-400 text-sm mt-1">Du äger din data. Kontrollera vad vi lagrar.</Text>
            </View>

            <View className="px-4 pt-5 pb-10">
                {/* Data principles */}
                <View className="bg-softMint/10 border border-softMint/30 rounded-2xl p-5 mb-5">
                    <Text className="text-textDark font-semibold mb-2">🔒 Våra principer</Text>
                    <Text className="text-sm text-textMuted leading-5 mb-1">
                        • Ansiktsskanningar lagras enbart på din enhet — aldrig i molnet
                    </Text>
                    <Text className="text-sm text-textMuted leading-5 mb-1">
                        • Vi säljer aldrig din data till tredje part
                    </Text>
                    <Text className="text-sm text-textMuted leading-5 mb-1">
                        • AI-konsultation sker via krypterad anslutning
                    </Text>
                    <Text className="text-sm text-textMuted leading-5">
                        • Du kan radera all data när som helst
                    </Text>
                </View>

                {/* Toggle settings */}
                <View className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
                    <Text className="text-textDark font-semibold px-5 pt-5 pb-2">Inställningar</Text>
                    {settings.map((setting, index) => (
                        <View
                            key={setting.id}
                            className={`px-5 py-4 flex-row items-center ${index < settings.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <View className="flex-1 mr-4">
                                <Text className="text-sm font-semibold text-textDark">{setting.title}</Text>
                                <Text className="text-xs text-textMuted mt-0.5 leading-4">{setting.description}</Text>
                            </View>
                            <Switch
                                value={setting.value}
                                onValueChange={() => toggle(setting.id)}
                                trackColor={{ false: '#E5E7EB', true: '#6EE7B7' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    ))}
                </View>

                {/* Data management */}
                <View className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
                    <Text className="text-textDark font-semibold px-5 pt-5 pb-2">Datahantering</Text>

                    <TouchableOpacity
                        onPress={handleDeleteScans}
                        className="px-5 py-4 flex-row items-center border-b border-gray-100"
                    >
                        <Text className="text-lg mr-3">🗑</Text>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-textDark">Radera alla skanningar</Text>
                            <Text className="text-xs text-textMuted">Tar bort sparad scan-historik från enheten</Text>
                        </View>
                        <Text className="text-gray-300">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="px-5 py-4 flex-row items-center border-b border-gray-100">
                        <Text className="text-lg mr-3">📤</Text>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-textDark">Exportera min data</Text>
                            <Text className="text-xs text-textMuted">Ladda ned en kopia av all din data (JSON)</Text>
                        </View>
                        <Text className="text-gray-300">›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="px-5 py-4 flex-row items-center">
                        <Text className="text-lg mr-3">📋</Text>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-textDark">Integritetspolicy</Text>
                            <Text className="text-xs text-textMuted">Läs hur vi hanterar din data</Text>
                        </View>
                        <Text className="text-gray-300">›</Text>
                    </TouchableOpacity>
                </View>

                {/* Danger zone */}
                <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <Text className="text-red-500 font-semibold px-5 pt-5 pb-2">Riskzon</Text>
                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        className="px-5 py-4 flex-row items-center"
                    >
                        <Text className="text-lg mr-3">⛔</Text>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-red-500">Radera mitt konto</Text>
                            <Text className="text-xs text-textMuted">Permanent radering av allt. Kan inte ångras.</Text>
                        </View>
                        <Text className="text-gray-300">›</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
