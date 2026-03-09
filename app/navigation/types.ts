import { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
    Welcome: undefined;
    AgeVerification: undefined;
    Disclaimer: undefined;
};

export type MainTabParamList = {
    ScanTab: undefined;
    ClinicsTab: undefined;
    EducationTab: undefined;
    ProfileTab: undefined;
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
