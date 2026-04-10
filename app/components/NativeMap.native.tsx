import React from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Platform } from 'react-native';
import { Clinic } from '../types/clinic';
import { UserLocation } from '../services/LocationService';

interface Props {
    clinics: Clinic[];
    mapRegion: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
    location: UserLocation | null;
    onClinicPress: (clinicId: string) => void;
}

export default function NativeMap({ clinics, mapRegion, location, onClinicPress }: Props) {
    return (
        <MapView
            style={{ height: 220 }}
            provider={Platform.OS === 'android' ? undefined : PROVIDER_DEFAULT}
            region={mapRegion}
            showsUserLocation={location != null}
        >
            {clinics.map((clinic) => (
                <Marker
                    key={clinic.id}
                    coordinate={clinic.coords}
                    title={clinic.name}
                    description={`${clinic.trustScore.toFixed(1)} ★`}
                    onCalloutPress={() => onClinicPress(clinic.id)}
                />
            ))}
        </MapView>
    );
}
