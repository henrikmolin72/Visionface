import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'AgeVerification'>;
};

export default function AgeVerificationScreen({ navigation }: Props) {
    return (
        <View className="flex-1 bg-clinicalWhite items-center justify-center p-6">
            <View className="bg-roseDust/20 p-8 rounded-full mb-8">
                <Text className="text-4xl">18+</Text>
            </View>

            <Text className="text-2xl font-semibold text-textDark mb-4 text-center">
                Åldersgräns
            </Text>
            <Text className="text-textMuted text-center mb-12 px-4 leading-6">
                För din säkerhet måste du vara över 18 år för att använda VisionFace och utföra simuleringar för estetiska ingrepp.
            </Text>

            <TouchableOpacity
                className="w-full bg-primary py-4 rounded-xl items-center mb-4"
                onPress={() => navigation.navigate('Disclaimer')}
            >
                <Text className="text-textDark font-medium text-lg">Jag är över 18 år</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="w-full py-4 rounded-xl items-center"
                // In a real app this would exit or show an error
                onPress={() => { }}
            >
                <Text className="text-textMuted font-medium text-lg">Jag är under 18 år</Text>
            </TouchableOpacity>
        </View>
    );
}
