export interface ClinicCoords {
  latitude: number;
  longitude: number;
}

export interface ClinicReview {
  author: string;
  rating: number; // 1–5
  comment: string;
  date: string; // ISO
  procedureId?: string;
  verified: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string;
  coords: ClinicCoords;
  phone: string;
  website: string;
  isVerified: boolean;

  // Ratings
  googleRating: number;
  googleReviewCount: number;
  visionFaceRating: number;
  visionFaceReviewCount: number;
  trustScore: number; // computed 0–5

  // Specializations
  procedureIds: string[]; // matches PROCEDURES keys
  surgeonCount: number;
  yearsInOperation: number;
  boardCertified: boolean;

  // Pricing (ranges in SEK)
  pricingTier: 'budget' | 'mid' | 'premium';

  // Reviews
  reviews: ClinicReview[];

  // Distance (km) — populated at runtime by LocationService
  distanceKm?: number;
}

export type ClinicFilter = {
  procedureId?: string;
  city?: string;
  pricingTier?: Clinic['pricingTier'];
  verifiedOnly?: boolean;
  sortBy: 'distance' | 'rating' | 'reviews';
};
