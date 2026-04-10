import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScanStackParamList } from './types';
import CameraScanScreen from '../screens/Scan/CameraScanScreen';
import AnalysisResultScreen from '../screens/Scan/AnalysisResultScreen';
import ConsultationScreen from '../screens/Scan/ConsultationScreen';

const Stack = createNativeStackNavigator<ScanStackParamList>();

export default function ScanStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Camera" component={CameraScanScreen} />
            <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
            <Stack.Screen name="Consultation" component={ConsultationScreen} />
        </Stack.Navigator>
    );
}
