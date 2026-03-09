import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import AgeVerificationScreen from '../screens/Onboarding/AgeVerificationScreen';
import DisclaimerScreen from '../screens/Onboarding/DisclaimerScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AgeVerification" component={AgeVerificationScreen} />
            <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
        </Stack.Navigator>
    );
}
