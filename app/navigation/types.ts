import { NavigatorScreenParams } from '@react-navigation/native';
import { ScanResult } from '../types/facial';

export type OnboardingStackParamList = {
    Welcome: undefined;
    AgeVerification: undefined;
    Disclaimer: undefined;
};

export type ScanStackParamList = {
    Camera: undefined;
    AnalysisResult: { result: ScanResult };
    Consultation: { result: ScanResult };
};

export type ClinicStackParamList = {
    ClinicList: { procedureId?: string } | undefined;
    ClinicDetail: { clinicId: string };
};

export type EducationStackParamList = {
    Lexicon: undefined;
    ProcedureDetail: { procedureId: string };
    CommunityGallery: undefined;
};

export type ProfileStackParamList = {
    Profile: undefined;
    Privacy: undefined;
};

export type MainTabParamList = {
    ScanTab: NavigatorScreenParams<ScanStackParamList>;
    ClinicsTab: NavigatorScreenParams<ClinicStackParamList>;
    EducationTab: NavigatorScreenParams<EducationStackParamList>;
    ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
    Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
    Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
