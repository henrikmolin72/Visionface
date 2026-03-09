import React from 'react';
import { View, Text } from 'react-native';

type TrustBadgeProps = {
    isVerified: boolean;
};

export default function TrustBadge({ isVerified }: TrustBadgeProps) {
    if (!isVerified) return null;

    return (
        <View className="bg-softMint/40 px-2 py-1 rounded-md flex-row items-center self-start">
            <Text className="text-xs font-semibold text-textDark">✓ VisionFace Verified</Text>
        </View>
    );
}
