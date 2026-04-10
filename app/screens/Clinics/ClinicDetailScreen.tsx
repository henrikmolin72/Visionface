import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ClinicStackParamList } from '../../navigation/types';
import { CLINICS } from '../../data/clinics';
import { PROCEDURES } from '../../data/procedures';
import { formatDistance } from '../../services/LocationService';
import TrustBadge from '../../components/TrustBadge';
import ActionBtn from '../../components/ActionBtn';
import { ClinicReview } from '../../types/clinic';

type Route = RouteProp<ClinicStackParamList, 'ClinicDetail'>;

const PRICING_LABEL = { budget: 'Budget', mid: 'Mellanklass', premium: 'Premium' };
const PRICING_COLOR = { budget: '#6EE7B7', mid: '#93C5FD', premium: '#C4B5FD' };

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
    const filled = Math.round(rating);
    const textClass = size === 'lg' ? 'text-2xl' : 'text-xs';
    return (
        <Text className={`text-yellow-400 ${textClass}`}>
            {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
        </Text>
    );
}

function ReviewCard({ review }: { review: ClinicReview }) {
    const procedureName = review.procedureId ? PROCEDURES[review.procedureId]?.name : null;
    return (
        <View className="border-b border-gray-100 pb-4 mb-4">
            <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                    <Text className="font-semibold text-sm text-textDark">{review.author}</Text>
                    {review.verified && (
                        <View className="bg-softMint/30 px-1.5 py-0.5 rounded-full">
                            <Text className="text-xs text-textDark">✓ Verifierad</Text>
                        </View>
                    )}
                </View>
                <Text className="text-xs text-textMuted">
                    {new Date(review.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
            </View>
            <StarRow rating={review.rating} />
            {procedureName && (
                <Text className="text-xs text-textMuted mt-1">Ingrepp: {procedureName}</Text>
            )}
            <Text className="text-sm text-textDark mt-2 leading-5">{review.comment}</Text>
        </View>
    );
}

function ScoreBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
    const pct = (value / max) * 100;
    return (
        <View className="mb-2">
            <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-textMuted">{label}</Text>
                <Text className="text-xs font-semibold text-textDark">{value.toFixed(1)}</Text>
            </View>
            <View className="h-1.5 bg-gray-100 rounded-full">
                <View className="h-1.5 bg-softMint rounded-full" style={{ width: `${pct}%` }} />
            </View>
        </View>
    );
}

export default function ClinicDetailScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation();
    const clinic = CLINICS.find((c) => c.id === route.params.clinicId);

    if (!clinic) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-textDark">Klinik hittades inte.</Text>
            </View>
        );
    }

    function openWebsite() {
        Linking.canOpenURL(clinic!.website).then((supported) => {
            if (supported) Linking.openURL(clinic!.website);
            else Alert.alert('Fel', 'Kan inte öppna webbplatsen.');
        });
    }

    function callClinic() {
        Linking.openURL(`tel:${clinic!.phone}`);
    }

    const totalReviews = clinic.googleReviewCount + clinic.visionFaceReviewCount;

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-textDark pt-16 pb-8 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
                    <Text className="text-softMint text-base">← Tillbaka</Text>
                </TouchableOpacity>
                <View className="flex-row items-start justify-between mb-2">
                    <Text className="text-clinicalWhite text-2xl font-semibold flex-1 mr-3">{clinic.name}</Text>
                    <TrustBadge isVerified={clinic.isVerified} />
                </View>
                <Text className="text-gray-400 text-sm">{clinic.address}, {clinic.city}</Text>
                {clinic.distanceKm != null && (
                    <Text className="text-gray-500 text-xs mt-1">{formatDistance(clinic.distanceKm)} bort</Text>
                )}

                {/* Quick stats */}
                <View className="flex-row mt-5 gap-4">
                    <View className="items-center">
                        <Text className="text-clinicalWhite text-2xl font-bold">{clinic.trustScore.toFixed(1)}</Text>
                        <StarRow rating={clinic.trustScore} size="sm" />
                        <Text className="text-gray-400 text-xs mt-0.5">{totalReviews} rec.</Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center">
                        <Text className="text-clinicalWhite text-2xl font-bold">{clinic.yearsInOperation}</Text>
                        <Text className="text-gray-400 text-xs">år verksam</Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center">
                        <Text className="text-clinicalWhite text-2xl font-bold">{clinic.surgeonCount}</Text>
                        <Text className="text-gray-400 text-xs">kirurger</Text>
                    </View>
                    <View className="w-px bg-white/20" />
                    <View className="items-center">
                        <View
                            className="px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: PRICING_COLOR[clinic.pricingTier] + '33' }}
                        >
                            <Text className="text-xs font-bold" style={{ color: PRICING_COLOR[clinic.pricingTier] }}>
                                {PRICING_LABEL[clinic.pricingTier]}
                            </Text>
                        </View>
                        <Text className="text-gray-400 text-xs mt-1">prisnivå</Text>
                    </View>
                </View>
            </View>

            <View className="px-4 pt-5 pb-10">
                {/* Credentials */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-textDark mb-3">Certifieringar</Text>
                    <View className="flex-row items-center mb-2">
                        <Text className="mr-2">{clinic.boardCertified ? '✅' : '⚠️'}</Text>
                        <Text className="text-sm text-textDark">
                            {clinic.boardCertified ? 'Styrelseauktoriserad kirurg' : 'Ej styrelseauktoriserad'}
                        </Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                        <Text className="mr-2">{clinic.isVerified ? '✅' : '⚠️'}</Text>
                        <Text className="text-sm text-textDark">
                            {clinic.isVerified ? 'VisionFace Verified' : 'Ej verifierad av VisionFace'}
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="mr-2">📋</Text>
                        <Text className="text-sm text-textDark">Licensnummer: SE-{clinic.id.toUpperCase().slice(0, 6)}</Text>
                    </View>
                </View>

                {/* Rating breakdown */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-textDark mb-3">Betygsöversikt</Text>
                    <ScoreBar label="Google Reviews" value={clinic.googleRating} />
                    <ScoreBar label={`VisionFace (${clinic.visionFaceReviewCount} rec.)`} value={clinic.visionFaceRating} />
                    <ScoreBar label="Trust Score" value={clinic.trustScore} />
                </View>

                {/* Procedures */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-textDark mb-3">Behandlingar</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {clinic.procedureIds.map((pid) => {
                            const proc = PROCEDURES[pid];
                            if (!proc) return null;
                            return (
                                <View key={pid} className="bg-softMint/20 border border-softMint/40 px-3 py-1.5 rounded-xl">
                                    <Text className="text-sm font-medium text-textDark">{proc.name}</Text>
                                    <Text className="text-xs text-textMuted">
                                        {proc.costRangeSEK[0].toLocaleString('sv-SE')}–{proc.costRangeSEK[1].toLocaleString('sv-SE')} kr
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Reviews */}
                <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
                    <Text className="text-lg font-semibold text-textDark mb-3">
                        Patientrecensioner ({clinic.reviews.length})
                    </Text>
                    {clinic.reviews.map((review, i) => (
                        <ReviewCard key={i} review={review} />
                    ))}
                    {clinic.reviews.length === 0 && (
                        <Text className="text-sm text-textMuted text-center py-4">Inga recensioner ännu.</Text>
                    )}
                </View>

                {/* Disclaimer */}
                <View className="p-4 bg-roseDust/20 rounded-xl mb-4">
                    <Text className="text-xs text-textMuted text-center leading-5">
                        All tidsbokning sker direkt med kliniken. VisionFace hanterar inga betalningar eller bokningar.
                        Kontrollera alltid klinikers legitimation innan du bokar.
                    </Text>
                </View>

                {/* CTA buttons */}
                <View className="gap-3">
                    <ActionBtn title="Boka konsultation via webbplats" onPress={openWebsite} />
                    <ActionBtn title={`Ring: ${clinic.phone}`} onPress={callClinic} variant="outline" />
                </View>
            </View>
        </ScrollView>
    );
}
