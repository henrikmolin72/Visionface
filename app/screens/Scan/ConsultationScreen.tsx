import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, ScrollView, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { ScanStackParamList } from '../../navigation/types';
import { ChatMessage, streamConsultation, SUGGESTED_QUESTIONS } from '../../services/ClaudeService';
import { generateSuggestions } from '../../services/ProcedureSuggestions';

type Route = RouteProp<ScanStackParamList, 'Consultation'>;

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';
    return (
        <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
            {!isUser && (
                <View className="flex-row items-center mb-1">
                    <View className="w-5 h-5 rounded-full bg-softMint items-center justify-center mr-1">
                        <Text className="text-xs font-bold text-textDark">AI</Text>
                    </View>
                    <Text className="text-xs text-textMuted">VisionFace AI</Text>
                </View>
            )}
            <View
                className="max-w-[82%] px-4 py-3 rounded-2xl"
                style={{
                    backgroundColor: isUser ? '#1F2937' : '#FFFFFF',
                    borderBottomRightRadius: isUser ? 4 : 16,
                    borderBottomLeftRadius: isUser ? 16 : 4,
                }}
            >
                <Text
                    className="text-sm leading-5"
                    style={{ color: isUser ? '#FFFFFF' : '#1F2937' }}
                >
                    {message.content}
                </Text>
            </View>
        </View>
    );
}

function TypingIndicator() {
    return (
        <View className="items-start mb-3">
            <View className="flex-row items-center mb-1">
                <View className="w-5 h-5 rounded-full bg-softMint items-center justify-center mr-1">
                    <Text className="text-xs font-bold text-textDark">AI</Text>
                </View>
                <Text className="text-xs text-textMuted">VisionFace AI</Text>
            </View>
            <View className="bg-white px-4 py-3 rounded-2xl rounded-bl-[4px]">
                <ActivityIndicator size="small" color="#6B7280" />
            </View>
        </View>
    );
}

export default function ConsultationScreen() {
    const route = useRoute<Route>();
    const navigation = useNavigation();
    const { result } = route.params;
    const suggestions = generateSuggestions(result.measurements, result.ethnicity);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: `Hej! Jag är din AI-konsult på VisionFace. Din analys visar ett övergripande poäng på ${result.overallScore}/100${suggestions.length > 0 ? ` och jag har identifierat ${suggestions.length} möjliga ingrepp` : ' — utmärkta proportioner'}. Vad vill du veta mer om?`,
        },
    ]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isStreaming) return;

        const userMessage: ChatMessage = { role: 'user', content: text.trim() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsStreaming(true);

        // Add empty assistant message to stream into
        const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
        setMessages([...updatedMessages, assistantMessage]);

        try {
            let fullText = '';
            for await (const chunk of streamConsultation(updatedMessages, result, suggestions)) {
                fullText += chunk;
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: fullText };
                    return updated;
                });
                scrollRef.current?.scrollToEnd({ animated: false });
            }
        } catch {
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: 'Kunde inte ansluta till AI-tjänsten. Kontrollera din anslutning och försök igen.',
                };
                return updated;
            });
        } finally {
            setIsStreaming(false);
            scrollRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages, isStreaming, result, suggestions]);

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            {/* Header */}
            <View className="bg-textDark pt-16 pb-4 px-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-3">
                    <Text className="text-softMint text-base">← Tillbaka</Text>
                </TouchableOpacity>
                <Text className="text-clinicalWhite text-xl font-semibold">AI-konsultation</Text>
                <Text className="text-gray-400 text-sm">Ställ frågor om din analys och ingrepp</Text>
            </View>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                className="flex-1 px-4 pt-4"
                contentContainerStyle={{ paddingBottom: 16 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
                {messages.map((msg, i) => (
                    <MessageBubble key={i} message={msg} />
                ))}
                {isStreaming && messages[messages.length - 1]?.content === '' && <TypingIndicator />}

                {/* Suggested questions — only when just the intro message shown */}
                {messages.length === 1 && (
                    <View className="mt-2">
                        <Text className="text-xs text-textMuted mb-2 ml-1">Vanliga frågor:</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {SUGGESTED_QUESTIONS.map((q) => (
                                <TouchableOpacity
                                    key={q}
                                    onPress={() => sendMessage(q)}
                                    className="bg-white border border-gray-200 px-3 py-2 rounded-xl"
                                >
                                    <Text className="text-xs text-textDark">{q}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Disclaimer */}
                <View className="mt-4 p-3 bg-roseDust/20 rounded-xl">
                    <Text className="text-xs text-textMuted text-center leading-4">
                        AI-konsultation ersätter inte medicinsk rådgivning. Konsultera alltid en legitimerad läkare.
                    </Text>
                </View>
            </ScrollView>

            {/* Input */}
            <View className="bg-white border-t border-gray-100 px-4 py-3 flex-row items-end gap-3">
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Skriv din fråga..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    maxLength={500}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-textDark"
                    style={{ maxHeight: 100 }}
                    editable={!isStreaming}
                />
                <TouchableOpacity
                    onPress={() => sendMessage(input)}
                    disabled={!input.trim() || isStreaming}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: input.trim() && !isStreaming ? '#1F2937' : '#E5E7EB' }}
                >
                    <Text className="text-lg" style={{ color: input.trim() && !isStreaming ? '#6EE7B7' : '#9CA3AF' }}>
                        ↑
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
