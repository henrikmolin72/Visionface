import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = {
    navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
    return (
        <View className="flex-1 bg-clinicalWhite items-center justify-center p-6">
            <Text className="text-4xl font-light text-textDark mb-4">VisionFace</Text>
            <Text className="text-textMuted text-center mb-12 px-4 leading-6">
                Demokratiserar tillgången till expertutlåtanden inom estetiska ingrepp.
            </Text>

            <TouchableOpacity
                className="w-full bg-primary py-4 rounded-xl items-center"
                onPress={() => navigation.navigate('AgeVerification')}
            >
                <Text className="text-textDark font-medium text-lg">Kom igång</Text>
            </TouchableOpacity>
        </View>
    );
}
