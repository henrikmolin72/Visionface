import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScanStackParamList } from '../../navigation/types';
import { extractLandmarks, computeMeasurements, computeOverallScore } from '../../services/FaceDetectionService';
import { Ethnicity, ScanResult } from '../../types/facial';
import { ETHNICITY_LABELS } from '../../data/facialProportions';

type Nav = NativeStackNavigationProp<ScanStackParamList, 'Camera'>;

const ETHNICITIES = Object.entries(ETHNICITY_LABELS) as [Ethnicity, string][];

export default function CameraScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [faceDetected, setFaceDetected] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [ethnicity, setEthnicity] = useState<Ethnicity>('european');
    const lastFaceRef = useRef<FaceDetector.FaceFeature | null>(null);
    const navigation = useNavigation<Nav>();

    if (!permission) {
        return <View className="flex-1 bg-textDark" />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-textDark items-center justify-center p-6">
                <Text className="text-clinicalWhite text-center text-lg mb-6">
                    Vi behöver din tillåtelse för att använda kameran för ansiktsscanning.
                </Text>
                <TouchableOpacity onPress={requestPermission} className="bg-softMint px-8 py-4 rounded-full">
                    <Text className="text-textDark font-bold text-lg">Ge tillåtelse</Text>
                </TouchableOpacity>
            </View>
        );
    }

    function handleFacesDetected({ faces }: FaceDetector.FaceDetectionResult) {
        if (scanning) return;
        if (faces.length > 0) {
            lastFaceRef.current = faces[0];
            setFaceDetected(true);
        } else {
            lastFaceRef.current = null;
            setFaceDetected(false);
        }
    }

    function handleScan() {
        if (!lastFaceRef.current || scanning) return;
        setScanning(true);

        setTimeout(() => {
            const face = lastFaceRef.current!;
            const landmarks = extractLandmarks(face as any);

            if (!landmarks) {
                setScanning(false);
                return;
            }

            const measurements = computeMeasurements(landmarks);
            const overallScore = computeOverallScore(measurements, ethnicity);

            const result: ScanResult = {
                measurements,
                ethnicity,
                overallScore,
                capturedAt: new Date().toISOString(),
            };

            setScanning(false);
            navigation.navigate('AnalysisResult', { result });
        }, 1200);
    }

    return (
        <View className="flex-1 bg-textDark items-center justify-center relative">
            {/* Header */}
            <Text className="text-clinicalWhite text-xl z-20 top-16 absolute text-center px-4">
                Positionera ansiktet i ovalen
            </Text>

            {/* Camera */}
            <View className="w-full h-full absolute inset-0">
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="front"
                    onFacesDetected={handleFacesDetected}
                    faceDetectorSettings={{
                        mode: FaceDetector.FaceDetectorMode.fast,
                        detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                        runClassifications: FaceDetector.FaceDetectorClassifications.none,
                        minDetectionInterval: 200,
                        tracking: true,
                    }}
                />
            </View>

            {/* Oval overlay */}
            <View
                className="w-64 h-96 rounded-[100px] items-center justify-center z-10"
                style={{
                    borderWidth: 3,
                    borderColor: faceDetected ? '#6EE7B7' : '#9CA3AF',
                    backgroundColor: 'transparent',
                }}
            />

            {/* Face status indicator */}
            <View className="absolute top-32 z-20 items-center">
                <View
                    className="px-4 py-1 rounded-full"
                    style={{ backgroundColor: faceDetected ? 'rgba(110,231,183,0.2)' : 'rgba(156,163,175,0.2)' }}
                >
                    <Text className="text-sm font-medium" style={{ color: faceDetected ? '#6EE7B7' : '#9CA3AF' }}>
                        {faceDetected ? 'Ansikte detekterat' : 'Söker ansikte...'}
                    </Text>
                </View>
            </View>

            {/* Ethnicity selector */}
            <View className="absolute bottom-44 z-20 w-full px-4">
                <Text className="text-clinicalWhite text-xs text-center mb-2 opacity-70">
                    Välj etnisk bakgrund för kalibrering
                </Text>
                <View className="flex-row flex-wrap justify-center gap-2">
                    {ETHNICITIES.map(([key, label]) => (
                        <TouchableOpacity
                            key={key}
                            onPress={() => setEthnicity(key)}
                            className="px-3 py-1 rounded-full"
                            style={{
                                backgroundColor: ethnicity === key ? '#6EE7B7' : 'rgba(255,255,255,0.15)',
                            }}
                        >
                            <Text
                                className="text-xs font-medium"
                                style={{ color: ethnicity === key ? '#1F2937' : '#FFFFFF' }}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Scan button */}
            <View className="absolute bottom-16 z-20">
                {scanning ? (
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#6EE7B7" />
                        <Text className="text-clinicalWhite text-sm mt-2">Analyserar...</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleScan}
                        disabled={!faceDetected}
                        className="px-12 py-4 rounded-full"
                        style={{
                            backgroundColor: faceDetected ? '#6EE7B7' : 'rgba(255,255,255,0.2)',
                        }}
                    >
                        <Text
                            className="font-bold text-lg"
                            style={{ color: faceDetected ? '#1F2937' : '#9CA3AF' }}
                        >
                            Skanna ansikte
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Dark vignette overlay */}
            <View
                className="absolute inset-0 z-[5] pointer-events-none"
                style={{ borderWidth: 80, borderColor: 'rgba(17,24,39,0.5)' }}
                pointerEvents="none"
            />
        </View>
    );
}
