import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClinicStackParamList } from './types';
import ClinicMapScreen from '../screens/Clinics/ClinicMapScreen';
import ClinicDetailScreen from '../screens/Clinics/ClinicDetailScreen';

const Stack = createNativeStackNavigator<ClinicStackParamList>();

export default function ClinicStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ClinicList" component={ClinicMapScreen} />
            <Stack.Screen name="ClinicDetail" component={ClinicDetailScreen} />
        </Stack.Navigator>
    );
}
