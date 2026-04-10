import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { MainTabParamList } from './types';
import ScanStackNavigator from './ScanStackNavigator';
import ClinicStackNavigator from './ClinicStackNavigator';
import EducationStackNavigator from './EducationStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, string> = {
    ScanTab: '🔍',
    ClinicsTab: '🏥',
    EducationTab: '📚',
    ProfileTab: '👤',
};

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E3F2FD',
                    paddingBottom: 4,
                    height: 60,
                },
                tabBarActiveTintColor: '#1F2937',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarIcon: ({ focused }) => (
                    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>
                        {TAB_ICONS[route.name]}
                    </Text>
                ),
            })}
        >
            <Tab.Screen
                name="ScanTab"
                component={ScanStackNavigator}
                options={{ tabBarLabel: 'Scan' }}
            />
            <Tab.Screen
                name="ClinicsTab"
                component={ClinicStackNavigator}
                options={{ tabBarLabel: 'Kliniker' }}
            />
            <Tab.Screen
                name="EducationTab"
                component={EducationStackNavigator}
                options={{ tabBarLabel: 'Utbildning' }}
            />
            <Tab.Screen
                name="ProfileTab"
                component={ProfileStackNavigator}
                options={{ tabBarLabel: 'Profil' }}
            />
        </Tab.Navigator>
    );
}
