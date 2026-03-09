import React from 'react';
import { View, Text } from 'react-native';

export default function ClinicMapScreen() {
    return (
        <View className="flex-1 bg-clinicalWhite">
            {/* Map Placeholder */}
            <View className="flex-2 h-2/3 bg-softMint items-center justify-center">
                <Text className="text-textDark font-medium text-lg">Google Maps Vy</Text>
            </View>

            {/* Bottom Sheet Placeholder for Clinic List */}
            <View className="flex-1 bg-clinicalWhite rounded-t-3xl -mt-6 p-6 shadow-lg">
                <Text className="text-2xl font-semibold mb-4 text-textDark">Topprankade Kliniker</Text>
                <Text className="text-textMuted">Här listas kliniker sorterade på customTrustScore.</Text>
            </View>
        </View>
    );
}
