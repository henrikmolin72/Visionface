import React from 'react';
import { View, Text } from 'react-native';
import { Clinic } from '../types/clinic';
import { UserLocation } from '../services/LocationService';

interface Props {
    clinics: Clinic[];
    mapRegion: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
    location: UserLocation | null;
    onClinicPress: (clinicId: string) => void;
}

// Web fallback — react-native-maps is native only
export default function NativeMap({ clinics }: Props) {
    return (
        <View className="h-[220px] bg-softMint/20 items-center justify-center border-b border-gray-100">
            <Text className="text-2xl mb-2">🗺</Text>
            <Text className="text-textDark font-medium text-sm">Kartvy tillgänglig i mobilappen</Text>
            <Text className="text-textMuted text-xs mt-1">{clinics.length} kliniker i listan nedan</Text>
        </View>
    );
}
