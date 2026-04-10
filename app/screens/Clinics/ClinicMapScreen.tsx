import React, { useEffect, useState, useMemo } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import NativeMap from '../../components/NativeMap';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ClinicStackParamList } from '../../navigation/types';
import { Clinic, ClinicFilter } from '../../types/clinic';
import { requestLocation, filterAndSortClinics, formatDistance, UserLocation } from '../../services/LocationService';
import TrustBadge from '../../components/TrustBadge';
import { PROCEDURES } from '../../data/procedures';

type Nav = NativeStackNavigationProp<ClinicStackParamList, 'ClinicList'>;
type Route = RouteProp<ClinicStackParamList, 'ClinicList'>;

const SORT_OPTIONS: { key: ClinicFilter['sortBy']; label: string }[] = [
    { key: 'rating', label: 'Betyg' },
    { key: 'distance', label: 'Avstånd' },
    { key: 'reviews', label: 'Recensioner' },
];

const PRICING_OPTIONS = [
    { key: undefined, label: 'Alla priser' },
    { key: 'budget' as const, label: 'Budget' },
    { key: 'mid' as const, label: 'Mid' },
    { key: 'premium' as const, label: 'Premium' },
];

const PRICING_COLOR = { budget: '#6EE7B7', mid: '#93C5FD', premium: '#C4B5FD' };

function StarRow({ rating, count }: { rating: number; count: number }) {
    const stars = Math.round(rating);
    return (
        <View className="flex-row items-center">
            <Text className="text-yellow-400 text-xs mr-1">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</Text>
            <Text className="text-xs text-textMuted">{rating.toFixed(1)} ({count})</Text>
        </View>
    );
}

function ClinicCard({ clinic, onPress }: { clinic: Clinic; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
        >
            <View className="flex-row justify-between items-start mb-1">
                <View className="flex-1 mr-2">
                    <Text className="text-base font-bold text-textDark">{clinic.name}</Text>
                    <Text className="text-sm text-textMuted">{clinic.address}, {clinic.city}</Text>
                </View>
                <View className="items-end">
                    {clinic.isVerified && <TrustBadge isVerified />}
                    {clinic.distanceKm != null && (
                        <Text className="text-xs text-textMuted mt-1">{formatDistance(clinic.distanceKm)}</Text>
                    )}
                </View>
            </View>

            <View className="flex-row items-center justify-between mt-2">
                <StarRow rating={clinic.trustScore} count={clinic.googleReviewCount + clinic.visionFaceReviewCount} />
                <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: (PRICING_COLOR[clinic.pricingTier] ?? '#E5E7EB') + '33' }}
                >
                    <Text className="text-xs capitalize font-medium" style={{ color: PRICING_COLOR[clinic.pricingTier] }}>
                        {clinic.pricingTier}
                    </Text>
                </View>
            </View>

            <View className="flex-row flex-wrap mt-3 gap-1">
                {clinic.procedureIds.slice(0, 4).map((pid) => (
                    <View key={pid} className="bg-gray-100 px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-textMuted">{PROCEDURES[pid]?.name ?? pid}</Text>
                    </View>
                ))}
                {clinic.procedureIds.length > 4 && (
                    <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                        <Text className="text-xs text-textMuted">+{clinic.procedureIds.length - 4}</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function ClinicMapScreen() {
    const navigation = useNavigation<Nav>();
    const route = useRoute<Route>();
    const procedureId = route.params?.procedureId;

    const [location, setLocation] = useState<UserLocation | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);
    const [sortBy, setSortBy] = useState<ClinicFilter['sortBy']>('rating');
    const [pricingTier, setPricingTier] = useState<ClinicFilter['pricingTier'] | undefined>(undefined);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [activeProcedure, setActiveProcedure] = useState<string | undefined>(procedureId);

    useEffect(() => {
        requestLocation().then((loc) => {
            setLocation(loc);
            if (loc) setSortBy('distance');
            setLocationLoading(false);
        });
    }, []);

    const clinics = useMemo(() => filterAndSortClinics(
        { sortBy, pricingTier, verifiedOnly, procedureId: activeProcedure },
        location,
    ), [location, sortBy, pricingTier, verifiedOnly, activeProcedure]);

    const mapRegion = location
        ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 1.5, longitudeDelta: 1.5 }
        : { latitude: 59.334, longitude: 18.063, latitudeDelta: 3, longitudeDelta: 3 };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-textDark pt-16 pb-4 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-clinicalWhite text-2xl font-semibold">Kliniker</Text>
                    <TouchableOpacity
                        onPress={() => setShowMap(!showMap)}
                        className="bg-white/10 px-3 py-1.5 rounded-full"
                    >
                        <Text className="text-clinicalWhite text-sm">{showMap ? '☰ Lista' : '🗺 Karta'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Sort */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {SORT_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={opt.key}
                            onPress={() => setSortBy(opt.key)}
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: sortBy === opt.key ? '#6EE7B7' : 'rgba(255,255,255,0.15)' }}
                        >
                            <Text className="text-xs font-medium" style={{ color: sortBy === opt.key ? '#1F2937' : '#FFF' }}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View className="w-px bg-white/20 mx-1" />
                    <TouchableOpacity
                        onPress={() => setVerifiedOnly(!verifiedOnly)}
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: verifiedOnly ? '#6EE7B7' : 'rgba(255,255,255,0.15)' }}
                    >
                        <Text className="text-xs font-medium" style={{ color: verifiedOnly ? '#1F2937' : '#FFF' }}>
                            ✓ Verifierade
                        </Text>
                    </TouchableOpacity>
                    {PRICING_OPTIONS.map((opt) => (
                        <TouchableOpacity
                            key={String(opt.key)}
                            onPress={() => setPricingTier(opt.key)}
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: pricingTier === opt.key ? '#6EE7B7' : 'rgba(255,255,255,0.15)' }}
                        >
                            <Text className="text-xs font-medium" style={{ color: pricingTier === opt.key ? '#1F2937' : '#FFF' }}>
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Map view — native only */}
            {showMap && Platform.OS !== 'web' && (
                <NativeMap
                    clinics={clinics}
                    mapRegion={mapRegion}
                    location={location}
                    onClinicPress={(id) => navigation.navigate('ClinicDetail', { clinicId: id })}
                />
            )}

            {/* Procedure filter strip */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="bg-white border-b border-gray-100 py-2 px-4"
                contentContainerStyle={{ gap: 8 }}
            >
                <TouchableOpacity
                    onPress={() => setActiveProcedure(undefined)}
                    className="px-3 py-1 rounded-full border"
                    style={{ borderColor: !activeProcedure ? '#1F2937' : '#E5E7EB', backgroundColor: !activeProcedure ? '#1F2937' : '#FFF' }}
                >
                    <Text className="text-xs" style={{ color: !activeProcedure ? '#FFF' : '#6B7280' }}>Alla ingrepp</Text>
                </TouchableOpacity>
                {Object.values(PROCEDURES).map((proc) => (
                    <TouchableOpacity
                        key={proc.id}
                        onPress={() => setActiveProcedure(proc.id)}
                        className="px-3 py-1 rounded-full border"
                        style={{ borderColor: activeProcedure === proc.id ? '#1F2937' : '#E5E7EB', backgroundColor: activeProcedure === proc.id ? '#1F2937' : '#FFF' }}
                    >
                        <Text className="text-xs" style={{ color: activeProcedure === proc.id ? '#FFF' : '#6B7280' }}>
                            {proc.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results */}
            {locationLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#1F2937" />
                    <Text className="text-textMuted mt-2 text-sm">Hämtar plats...</Text>
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 30 }}>
                    <Text className="text-xs text-textMuted mb-3">
                        {clinics.length} kliniker{activeProcedure ? ` för ${PROCEDURES[activeProcedure]?.name}` : ''}
                    </Text>
                    {clinics.map((clinic) => (
                        <ClinicCard
                            key={clinic.id}
                            clinic={clinic}
                            onPress={() => navigation.navigate('ClinicDetail', { clinicId: clinic.id })}
                        />
                    ))}
                    {clinics.length === 0 && (
                        <View className="items-center py-12">
                            <Text className="text-4xl mb-3">🔍</Text>
                            <Text className="text-textDark font-semibold">Inga kliniker hittades</Text>
                            <Text className="text-textMuted text-sm mt-1">Prova att ändra filtren</Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}
