import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EducationStackParamList } from './types';
import LexiconScreen from '../screens/Education/LexiconScreen';
import ProcedureDetailScreen from '../screens/Education/ProcedureDetailScreen';
import CommunityGalleryScreen from '../screens/Education/CommunityGalleryScreen';

const Stack = createNativeStackNavigator<EducationStackParamList>();

export default function EducationStackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Lexicon" component={LexiconScreen} />
            <Stack.Screen name="ProcedureDetail" component={ProcedureDetailScreen} />
            <Stack.Screen name="CommunityGallery" component={CommunityGalleryScreen} />
        </Stack.Navigator>
    );
}
