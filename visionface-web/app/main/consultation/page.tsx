'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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

const SUGGESTED_QUESTIONS = [
    'Vad innebär mitt resultat i praktiken?',
    'Vilka ingrepp rekommenderar du för mig?',
    'Hur smärtsam är filler-behandling?',
    'Hur länge håller botox?',
    'Vilka risker bör jag tänka på?',
    'Hur hittar jag en bra klinik?',
];

const ETHNICITY_LABELS: Record<string, string> = {
    caucasian: 'Kaukasisk',
    eastAsian: 'Östasiatisk',
    southAsian: 'Sydasiatisk',
    african: 'Afrikansk',
    middleEastern: 'Mellanöstern',
    hispanic: 'Latinamerikansk',
};

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-4 py-3">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#2dd4a8]"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.18}s infinite` }}
                />
            ))}
            <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
        </div>
    );
}

/** Renders markdown-like **bold** and newlines safely without innerHTML */
function MessageText({ content }: { content: string }) {
    const parts: React.ReactNode[] = [];
    const segments = content.split(/(\*\*[^*]+\*\*|\n)/g);
    segments.forEach((seg, i) => {
        if (seg === '\n') {
            parts.push(<br key={i} />);
        } else if (seg.startsWith('**') && seg.endsWith('**')) {
            parts.push(<strong key={i}>{seg.slice(2, -2)}</strong>);
        } else {
            parts.push(seg);
        }
    });
    return <>{parts}</>;
}

export default function ConsultationPage() {
    const router = useRouter();
    const [scan, setScan] = useState<ScanSummary | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [streaming, setStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const raw = sessionStorage.getItem('vf_scan_for_consultation');
        if (!raw) return;
        const parsed: ScanSummary = JSON.parse(raw);
        setScan(parsed);

        const ethLabel = ETHNICITY_LABELS[parsed.ethnicity] ?? parsed.ethnicity;
        setMessages([{
            role: 'assistant',
            content: `Välkommen! Jag har analyserat ditt ansiktsresultat — övergripande poäng **${parsed.overallScore}/100** med ${ethLabel} profil. Ställ gärna frågor om dina resultat, rekommenderade ingrepp, risker eller hur du hittar en klinik.`,
        }]);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (text: string) => {
        if (!text.trim() || streaming || !scan) return;
        setInput('');
        const userMsg: ChatMessage = { role: 'user', content: text.trim() };
        const history = [...messages, userMsg];
        setMessages(history);
        setStreaming(true);

        const placeholderIdx = history.length;
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        try {
            const res = await fetch('/api/consultation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, scan }),
            });

            if (!res.body) throw new Error('No stream');
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let accumulated = '';

            for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                accumulated += decoder.decode(value, { stream: true });
                setMessages((prev) => {
                    const copy = [...prev];
                    copy[placeholderIdx] = { role: 'assistant', content: accumulated };
                    return copy;
                });
            }
        } catch {
            setMessages((prev) => {
                const copy = [...prev];
                copy[placeholderIdx] = { role: 'assistant', content: 'Något gick fel. Försök igen.' };
                return copy;
            });
        } finally {
            setStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send(input);
        }
    };

    const showSuggestions = messages.length <= 1 && !streaming;

    if (!scan) {
        return (
            <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center px-6 gap-4">
                <p className="vf-kicker">AI-konsultation</p>
                <p className="text-lg font-semibold vf-heading text-center">Inget skanresultat hittades</p>
                <p className="vf-copy text-sm text-center max-w-xs">
                    Skanna ditt ansikte först för att aktivera AI-konsultationen.
                </p>
                <button
                    onClick={() => router.push('/main/scan')}
                    className="mt-2 px-6 py-3 rounded-[1rem] bg-[#134e4a] text-white font-semibold text-sm hover:bg-[#0d9373] transition-colors"
                >
                    Gå till skanning
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] px-4 md:px-6 pb-2">
            <div className="vf-page-container max-w-3xl flex flex-col h-full gap-3 pt-2">

                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <p className="vf-kicker">AI-konsultation</p>
                        <h1 className="text-xl font-semibold vf-heading">Fråga AI-konsulten</h1>
                    </div>
                    <div className="vf-surface px-3 py-1.5 text-xs font-medium vf-copy rounded-[0.9rem]">
                        Poäng: <span className="font-bold text-[#0d9373]">{scan.overallScore}/100</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto vf-surface p-4 flex flex-col gap-3 min-h-0">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-[linear-gradient(135deg,#2dd4a8,#0d9373)] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="none">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6H6z" />
                                    </svg>
                                </div>
                            )}
                            <div
                                className={`max-w-[82%] rounded-[1.1rem] px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'bg-[#134e4a] text-white rounded-br-sm'
                                        : 'vf-surface-strong text-[#1a1a1a] rounded-bl-sm'
                                    }`}
                            >
                                {msg.content
                                    ? <MessageText content={msg.content} />
                                    : <TypingDots />
                                }
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested questions */}
                {showSuggestions && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                        {SUGGESTED_QUESTIONS.map((q) => (
                            <button
                                key={q}
                                onClick={() => send(q)}
                                className="text-xs px-3 py-1.5 rounded-full border border-[#2dd4a8]/40 bg-white/70 text-[#134e4a] font-medium hover:bg-[#f0fdf8] transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <div className="vf-surface flex items-end gap-2 p-2 shrink-0">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Skriv din fråga..."
                        rows={1}
                        disabled={streaming}
                        className="flex-1 bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#a8a29e] outline-none resize-none py-2 px-2 max-h-32"
                    />
                    <button
                        onClick={() => send(input)}
                        disabled={!input.trim() || streaming}
                        className="w-9 h-9 rounded-[0.8rem] bg-[#134e4a] flex items-center justify-center text-white disabled:opacity-40 hover:bg-[#0d9373] transition-colors shrink-0"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>

                <p className="text-[10px] text-center vf-copy shrink-0 pb-1">
                    AI-rådgivning ersätter inte medicinsk konsultation med legitimerad läkare.
                </p>
            </div>
        </div>
    );
}
