import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { OnboardingContext } from '../../navigation/RootNavigator';

export default function DisclaimerScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { completeOnboarding } = useContext(OnboardingContext);

    const handleAccept = () => {
        // Signal completion of onboarding
        completeOnboarding();
    };

    return (
        <View className="flex-1 bg-clinicalWhite items-center justify-center p-6">
            <Text className="text-2xl font-semibold text-textDark mb-6 text-center">
                Viktig Information
            </Text>

            <View className="bg-softMint/30 p-6 rounded-2xl mb-8">
                <Text className="text-textDark leading-6 mb-4">
                    <Text className="font-bold">1. Endast Simulering: </Text>
                    Alla bilder som genereras är AI-simuleringar och utgör inga garantier för faktiska medicinska resultat.
                </Text>
                <Text className="text-textDark leading-6 mb-4">
                    <Text className="font-bold">2. Guardrails: </Text>
                    För din säkerhet har vi begränsat möjliga justeringar till anatomiskt realistiska nivåer.
                </Text>
                <Text className="text-textDark leading-6">
                    <Text className="font-bold">3. Verkligheten: </Text>
                    Individuell anatomi påverkar alltid det slutgiltiga resultatet. Rådgör alltid med en legitimerad klinik.
                </Text>
            </View>

            <TouchableOpacity
                className="w-full bg-primary py-4 rounded-xl items-center"
                onPress={handleAccept}
            >
                <Text className="text-textDark font-medium text-lg">Jag förstår och accepterar</Text>
            </TouchableOpacity>
        </View>
    );
}
