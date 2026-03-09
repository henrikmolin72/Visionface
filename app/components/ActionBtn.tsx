import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

type ActionBtnProps = {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
};

export default function ActionBtn({
    title,
    onPress,
    isLoading = false,
    variant = 'primary'
}: ActionBtnProps) {

    const getBgClass = () => {
        switch (variant) {
            case 'primary': return 'bg-primary';
            case 'secondary': return 'bg-roseDust';
            case 'outline': return 'bg-transparent border-2 border-primary';
            default: return 'bg-primary';
        }
    };

    const getTextColor = () => {
        return variant === 'outline' ? 'text-primary' : 'text-textDark';
    };

    return (
        <TouchableOpacity
            className={`w-full py-4 rounded-xl items-center justify-center flex-row ${getBgClass()}`}
            onPress={onPress}
            disabled={isLoading}
            activeOpacity={0.8}
        >
            {isLoading ? (
                <ActivityIndicator color="#1F2937" />
            ) : (
                <Text className={`font-medium text-lg ${getTextColor()}`}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
