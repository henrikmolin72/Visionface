import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';

type TrustBadgeProps = {
    isVerified: boolean;
    boardCertified?: boolean;
    yearsInOperation?: number;
};

export default function TrustBadge({ isVerified, boardCertified, yearsInOperation }: TrustBadgeProps) {
    const [showDetail, setShowDetail] = useState(false);

    if (!isVerified) {
        return (
            <View className="bg-gray-100 px-2 py-1 rounded-md flex-row items-center self-start">
                <Text className="text-xs font-medium text-gray-400">⚠ Overifierad</Text>
            </View>
        );
    }

    return (
        <>
            <TouchableOpacity
                onPress={() => setShowDetail(true)}
                className="bg-softMint/40 px-2 py-1 rounded-md flex-row items-center self-start"
                activeOpacity={0.7}
            >
                <Text className="text-xs font-semibold text-textDark">✓ VisionFace Verified</Text>
                <Text className="text-xs text-textDark/50 ml-1">ⓘ</Text>
            </TouchableOpacity>

            <Modal transparent visible={showDetail} animationType="fade" onRequestClose={() => setShowDetail(false)}>
                <Pressable
                    className="flex-1 bg-black/50 items-center justify-center px-6"
                    onPress={() => setShowDetail(false)}
                >
                    <Pressable className="bg-white rounded-2xl p-6 w-full max-w-sm" onPress={() => {}}>
                        <Text className="text-lg font-bold text-textDark mb-1">VisionFace Verified</Text>
                        <Text className="text-sm text-textMuted mb-4 leading-5">
                            Kliniken har granskats och uppfyller VisionFaces kvalitetsstandarder.
                        </Text>

                        <View className="mb-2 flex-row items-center">
                            <Text className="mr-2">✅</Text>
                            <Text className="text-sm text-textDark">Giltig verksamhetslicens verifierad</Text>
                        </View>
                        <View className="mb-2 flex-row items-center">
                            <Text className="mr-2">{boardCertified ? '✅' : '⚠️'}</Text>
                            <Text className="text-sm text-textDark">
                                {boardCertified ? 'Styrelseauktoriserad personal' : 'Ej styrelseauktoriserad'}
                            </Text>
                        </View>
                        <View className="mb-2 flex-row items-center">
                            <Text className="mr-2">✅</Text>
                            <Text className="text-sm text-textDark">Godkänd patientrecension-granskning</Text>
                        </View>
                        <View className="mb-4 flex-row items-center">
                            <Text className="mr-2">✅</Text>
                            <Text className="text-sm text-textDark">
                                {yearsInOperation ? `${yearsInOperation} år i verksamhet` : 'Verifierad verksamhetstid'}
                            </Text>
                        </View>

                        <View className="bg-softMint/20 p-3 rounded-xl mb-4">
                            <Text className="text-xs text-textMuted leading-4 text-center">
                                Verifiering innebär inte en garanti för resultat. Gör alltid din egen research innan du bokar.
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowDetail(false)}
                            className="bg-textDark py-3 rounded-xl items-center"
                        >
                            <Text className="text-clinicalWhite font-semibold">Stäng</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}
