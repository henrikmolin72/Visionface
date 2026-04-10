import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ScanSummary {
    overallScore: number;
    ethnicity: string;
    scores: Record<string, number>;
    recommendations: { zone: string; procedure: string; severity: string }[];
}

function buildSystemPrompt(scan: ScanSummary): string {
    const recList = scan.recommendations
        .map((r) => `- ${r.zone}: ${r.procedure} (${r.severity})`)
        .join('\n');

    return `Du är en professionell och empatisk AI-konsult för estetisk medicin på plattformen VisionFace.
Du hjälper användare förstå ansiktsanalysresultat, kosmetiska ingrepp, risker och vad de kan förvänta sig.

ANVÄNDARENS ANALYSRESULTAT:
- Övergripande poäng: ${scan.overallScore}/100
- Etnisk profil: ${scan.ethnicity}
- Zonspoäng: Panna ${scan.scores.forehead ?? '–'}/100, Ögon ${scan.scores.eyes ?? '–'}/100, Näsa ${scan.scores.nose ?? '–'}/100, Läppar ${scan.scores.lips ?? '–'}/100, Käklinje ${scan.scores.jaw ?? '–'}/100, Kindben ${scan.scores.cheeks ?? '–'}/100, Symmetri ${scan.scores.symmetry ?? '–'}/100

REKOMMENDERADE INGREPP:
${recList || 'Inga specifika ingrepp — utmärkta proportioner.'}

REGLER:
- Svara alltid på svenska
- Var informativ men aldrig överdrivet teknisk utan att förklara termer
- Betona alltid att konsultation med legitimerad läkare krävs innan beslut
- Var empatisk och neutral — varken övertala eller avskräcka
- Om frågan handlar om specifika risker, ge faktabaserade svar
- Håll svar kortfattade (2–4 meningar) om inget annat ombeds
- Avsluta ALDRIG med generiska fraser som "Hoppas det hjälper!"`;
}

export async function POST(req: NextRequest) {
    const { messages, scan }: { messages: ChatMessage[]; scan: ScanSummary } = await req.json();

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const claudeStream = client.messages.stream({
                model: 'claude-sonnet-4-6',
                max_tokens: 1024,
                system: buildSystemPrompt(scan),
                messages: messages.map((m) => ({ role: m.role, content: m.content })),
            });

            for await (const event of claudeStream) {
                if (
                    event.type === 'content_block_delta' &&
                    event.delta.type === 'text_delta'
                ) {
                    controller.enqueue(encoder.encode(event.delta.text));
                }
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
        },
    });
}
