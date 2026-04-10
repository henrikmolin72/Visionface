import * as ExpoLocation from 'expo-location';
import { Clinic, ClinicFilter } from '../types/clinic';
import { CLINICS } from '../data/clinics';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

/** Haversine formula — returns distance in km. */
export function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const chord =
    sinLat * sinLat +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

export async function requestLocation(): Promise<UserLocation | null> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const loc = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
  return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
}

/** Return clinics with distanceKm populated and sorted/filtered. */
export function filterAndSortClinics(
  filter: ClinicFilter,
  userLocation: UserLocation | null,
): Clinic[] {
  let result = CLINICS.map((clinic) => ({
    ...clinic,
    distanceKm: userLocation
      ? Math.round(haversineKm(userLocation, clinic.coords) * 10) / 10
      : undefined,
  }));

  if (filter.procedureId) {
    result = result.filter((c) => c.procedureIds.includes(filter.procedureId!));
  }
  if (filter.city) {
    result = result.filter((c) => c.city.toLowerCase() === filter.city!.toLowerCase());
  }
  if (filter.pricingTier) {
    result = result.filter((c) => c.pricingTier === filter.pricingTier);
  }
  if (filter.verifiedOnly) {
    result = result.filter((c) => c.isVerified);
  }

  result.sort((a, b) => {
    if (filter.sortBy === 'distance' && a.distanceKm != null && b.distanceKm != null) {
      return a.distanceKm - b.distanceKm;
    }
    if (filter.sortBy === 'reviews') {
      return b.googleReviewCount + b.visionFaceReviewCount - (a.googleReviewCount + a.visionFaceReviewCount);
    }
    return b.trustScore - a.trustScore; // default: rating
  });

  return result;
}

export function formatDistance(km: number | undefined): string {
  if (km == null) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
