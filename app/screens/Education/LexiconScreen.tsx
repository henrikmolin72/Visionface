import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EducationStackParamList } from '../../navigation/types';
import { MEDICAL_GLOSSARY, GLOSSARY_CATEGORIES, GlossaryTerm } from '../../data/medicalGlossary';

type Nav = NativeStackNavigationProp<EducationStackParamList, 'Lexicon'>;

const CATEGORY_FILTERS = ['all', 'anatomy', 'procedure', 'substance', 'condition'] as const;
type Filter = typeof CATEGORY_FILTERS[number];

function TermCard({ term }: { term: GlossaryTerm }) {
    const [expanded, setExpanded] = useState(false);
    const categoryColor: Record<string, string> = {
        anatomy: '#6EE7B7',
        procedure: '#93C5FD',
        substance: '#FCD34D',
        condition: '#F9A8D4',
    };

    return (
        <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.85}
            className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-gray-100"
        >
            <View className="flex-row items-start justify-between">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-textDark">{term.term}</Text>
                    {term.pronunciation && (
                        <Text className="text-xs text-textMuted italic mb-1">/{term.pronunciation}/</Text>
                    )}
                </View>
                <View
                    className="px-2 py-0.5 rounded-full ml-2"
                    style={{ backgroundColor: (categoryColor[term.category] ?? '#E5E7EB') + '33' }}
                >
                    <Text className="text-xs font-medium" style={{ color: categoryColor[term.category] ?? '#6B7280' }}>
                        {GLOSSARY_CATEGORIES[term.category]}
                    </Text>
                </View>
            </View>

            <Text className="text-textMuted text-sm leading-5 mt-2" numberOfLines={expanded ? undefined : 2}>
                {term.definition}
            </Text>

            {expanded && term.relatedProcedures.length > 0 && (
                <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-xs font-semibold text-textDark mb-2">Relaterade ingrepp</Text>
                    <View className="flex-row flex-wrap gap-1">
                        {term.relatedProcedures.map((p) => (
                            <View key={p} className="bg-softMint/20 px-2 py-0.5 rounded-full">
                                <Text className="text-xs text-textDark capitalize">{p}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            <Text className="text-xs text-softMint mt-2 text-right">
                {expanded ? 'Dölj ▲' : 'Läs mer ▼'}
            </Text>
        </TouchableOpacity>
    );
}

export default function LexiconScreen() {
    const navigation = useNavigation<Nav>();
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<Filter>('all');

    const filtered = useMemo(() => {
        return MEDICAL_GLOSSARY.filter((term) => {
            const matchesCategory = activeFilter === 'all' || term.category === activeFilter;
            const matchesQuery =
                query.trim() === '' ||
                term.term.toLowerCase().includes(query.toLowerCase()) ||
                term.definition.toLowerCase().includes(query.toLowerCase());
            return matchesCategory && matchesQuery;
        });
    }, [query, activeFilter]);

    return (
        <ScrollView className="flex-1 bg-gray-50" keyboardShouldPersistTaps="handled">
            <View className="bg-textDark pt-16 pb-6 px-6">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-clinicalWhite text-2xl font-semibold">Ingreppslexikon</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('CommunityGallery')}
                        className="bg-white/10 px-3 py-1.5 rounded-full"
                    >
                        <Text className="text-clinicalWhite text-xs">📸 Patientgalleri</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-white/10 rounded-xl flex-row items-center px-4 py-3">
                    <Text className="text-gray-400 mr-2">🔍</Text>
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Sök begrepp..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 text-clinicalWhite text-base"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')}>
                            <Text className="text-gray-400 text-lg">×</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Category filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="py-4 px-4"
                contentContainerStyle={{ gap: 8 }}
            >
                {CATEGORY_FILTERS.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        onPress={() => setActiveFilter(cat)}
                        className="px-4 py-2 rounded-full"
                        style={{
                            backgroundColor: activeFilter === cat ? '#1F2937' : '#FFFFFF',
                            borderWidth: 1,
                            borderColor: activeFilter === cat ? '#1F2937' : '#E5E7EB',
                        }}
                    >
                        <Text
                            className="text-sm font-medium"
                            style={{ color: activeFilter === cat ? '#FFFFFF' : '#6B7280' }}
                        >
                            {cat === 'all' ? 'Alla' : GLOSSARY_CATEGORIES[cat as keyof typeof GLOSSARY_CATEGORIES]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Results count */}
            <View className="px-4 pb-2">
                <Text className="text-xs text-textMuted">
                    {filtered.length} {filtered.length === 1 ? 'begrepp' : 'begrepp'} hittades
                </Text>
            </View>

            {/* Terms */}
            <View className="px-4 pb-10">
                {filtered.length === 0 ? (
                    <View className="items-center py-12">
                        <Text className="text-4xl mb-3">🔬</Text>
                        <Text className="text-textDark font-semibold">Inga begrepp hittades</Text>
                        <Text className="text-textMuted text-sm mt-1">Prova ett annat sökord</Text>
                    </View>
                ) : (
                    filtered.map((term) => <TermCard key={term.id} term={term} />)
                )}
            </View>
        </ScrollView>
    );
}
