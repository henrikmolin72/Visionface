import React, { useState, createContext, useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import OnboardingStack from './OnboardingStack';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Simple context to toggle onboarding state for the prototype
export const OnboardingContext = createContext({
    completeOnboarding: () => { },
});

export default function RootNavigator() {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    const completeOnboarding = () => setHasCompletedOnboarding(true);

    return (
        <OnboardingContext.Provider value={{ completeOnboarding }}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!hasCompletedOnboarding ? (
                    <Stack.Screen name="Onboarding" component={OnboardingStack} />
                ) : (
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                )}
            </Stack.Navigator>
        </OnboardingContext.Provider>
    );
}
