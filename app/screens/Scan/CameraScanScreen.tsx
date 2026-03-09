import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();

    if (!permission) {
        // Camera permissions are still loading.
        return <View className="flex-1 bg-textDark" />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View className="flex-1 bg-textDark items-center justify-center p-6">
                <Text className="text-clinicalWhite text-center text-lg mb-6">
                    Vi behöver din tillåtelse för att använda kameran för ansiktsscanning.
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-softMint px-8 py-4 rounded-full"
                >
                    <Text className="text-textDark font-bold text-lg">Ge tillåtelse</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-textDark items-center justify-center relative">
            {/* Header Text */}
            <Text className="text-clinicalWhite text-xl z-20 top-20 absolute text-center px-4">
                Positionera ansiktet i ovalen
            </Text>

            {/* Camera View Wrapper */}
            <View className="w-full h-full absolute inset-0">
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="front"
                />
            </View>

            {/* Clinical Overlay Oval */}
            <View
                className="w-64 h-96 border-4 border-softMint rounded-[100px] items-center justify-center"
                style={{ backgroundColor: 'transparent' }}
            >
                {/* Visual feedback or guide could go here */}
            </View>

            {/* Subtle Guide Text */}
            <View className="absolute bottom-20">
                <Text className="text-clinicalWhite text-lg opacity-80 animate-pulse">
                    Håll stilla för analys...
                </Text>
            </View>

            {/* Dark contrast overlays for focus (simplified version of a masking layer) */}
            <View className="absolute inset-0 z-10 pointer-events-none border-[100px] border-textDark/40" pointerEvents="none" />
        </View>
    );
}
