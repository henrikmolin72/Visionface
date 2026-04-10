import Anthropic from '@anthropic-ai/sdk';
import { ScanResult } from '../types/facial';
import { ProcedureSuggestion } from '../types/facial';
import { ETHNICITY_LABELS } from '../data/facialProportions';

const client = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
  // Required for browser/React Native environments
  dangerouslyAllowBrowser: true,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildSystemPrompt(result: ScanResult, suggestions: ProcedureSuggestion[]): string {
  const ethnicityLabel = ETHNICITY_LABELS[result.ethnicity];
  const suggestionSummary = suggestions
    .map(
      (s, i) =>
        `${i + 1}. ${s.procedure.name} (${s.area}) — konfidensgrad ${Math.round(s.confidence * 100)}%, uppskattad förbättring +${s.improvementEstimate}%`,
    )
    .join('\n');

  return `Du är en professionell och empatisk AI-konsult för estetisk medicin på plattformen VisionFace.
Du hjälper användare förstå ansiktsanalysresultat, kosmetiska ingrepp, risker och vad de kan förvänta sig.

ANVÄNDARENS ANALYSRESULTAT:
- Övergripande poäng: ${result.overallScore}/100
- Etnisk bakgrund: ${ethnicityLabel}
- Symmetripoäng: ${result.measurements.symmetryScore}/100
- Käklinjepoäng: ${result.measurements.jawlineScore}/100
- Gyllene snittet: ${result.measurements.goldenRatioScore}/100
- Kindbensprominens: ${result.measurements.cheekboneProminence}/100

REKOMMENDERADE INGREPP:
${suggestionSummary || 'Inga specifika ingrepp rekommenderade — utmärkta proportioner.'}

REGLER:
- Svara alltid på svenska
- Var informativ men aldrig överdrivet teknisk utan att förklara termer
- Betona alltid att konsultation med legitimerad läkare krävs innan beslut
- Var empatisk och neutral — varken övertala eller avskräcka
- Om frågan handlar om specifika risker, ge faktabaserade svar med sannolikheter
- Håll svar kortfattade (2–4 meningar) om inget annat ombeds
- Avsluta ALDRIG med generiska fraser som "Hoppas det hjälper!"`;
}

export async function* streamConsultation(
  messages: ChatMessage[],
  result: ScanResult,
  suggestions: ProcedureSuggestion[],
): AsyncGenerator<string> {
  const systemPrompt = buildSystemPrompt(result, suggestions);

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text;
    }
  }
}

export const SUGGESTED_QUESTIONS = [
  'Vad betyder mitt symmetripoäng i praktiken?',
  'Hur smärtsam är läppfiller-behandlingen?',
  'Hur länge håller resultaten av botox?',
  'Vilka risker bör jag tänka på med näsplastik?',
  'Hur hittar jag en bra kirurg?',
  'Vad är återhämtningstiden för hakförstärkning?',
];
