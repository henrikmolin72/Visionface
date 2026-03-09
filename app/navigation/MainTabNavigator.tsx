import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import CameraScanScreen from '../screens/Scan/CameraScanScreen';
import ClinicMapScreen from '../screens/Clinics/ClinicMapScreen';
import LexiconScreen from '../screens/Education/LexiconScreen';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

function ProfilePlaceholder() {
    return (
        <View className="flex-1 items-center justify-center bg-clinicalWhite">
            <Text className="text-textDark font-bold text-lg">Profil</Text>
        </View>
    );
}

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E3F2FD', // softMint
                },
                tabBarActiveTintColor: '#1F2937',
                tabBarInactiveTintColor: '#6B7280',
            }}
        >
            <Tab.Screen
                name="ScanTab"
                component={CameraScanScreen}
                options={{ tabBarLabel: 'Scan' }}
            />
            <Tab.Screen
                name="ClinicsTab"
                component={ClinicMapScreen}
                options={{ tabBarLabel: 'Kliniker' }}
            />
            <Tab.Screen
                name="EducationTab"
                component={LexiconScreen}
                options={{ tabBarLabel: 'Utbildning' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfilePlaceholder}
                options={{ tabBarLabel: 'Profil' }}
            />
        </Tab.Navigator>
    );
}
