'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IconSparkles,
    IconX,
    IconSend,
    IconBrandWhatsapp,
    IconLoader2,
} from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';

type Message = {
    id: string;
    role: 'user' | 'model';
    content: string;
};

// Stable unique ID generator — avoids same-millisecond collisions
let _seq = 0;
function newId(prefix: string) {
    return `${prefix}-${Date.now()}-${++_seq}`;
}

export function FloatingAIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isCheckingPing, setIsCheckingPing] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-1',
            role: 'model',
            content:
                'Hello! I am your An-Nisa Bot. How can I help you discover our premium embroidery and abaya collections today?',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [wantsHuman, setWantsHuman] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const whatsappNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '+8801877910384';
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    const handleOpenChat = async () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        const cachedPing = sessionStorage.getItem('ai_ping_v2');
        if (cachedPing === 'true') {
            setIsOpen(true);
            return;
        }

        setIsCheckingPing(true);
        try {
            const res = await fetch('/api/ai/check?t=' + Date.now());
            const data = await res.json();
            if (data.ok) {
                sessionStorage.setItem('ai_ping_v2', 'true');
                setIsOpen(true);
            } else {
                sessionStorage.setItem('ai_ping_v2', 'false');
                window.open(whatsappUrl, '_blank');
            }
        } catch {
            window.open(whatsappUrl, '_blank');
        } finally {
            setIsCheckingPing(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const newUserMsg = inputValue.trim();

        // Snapshot history BEFORE mutating state — `messages` in closure is the
        // previous value; we want that for the API call, not the post-update value.
        const historySnapshot = messages
            .filter((m) => m.id !== 'init-1')
            .map((m) => ({ role: m.role, content: m.content }));

        // Add user message to UI immediately, then clear input and show loading.
        setMessages((prev) => [
            ...prev,
            { id: newId('u'), role: 'user', content: newUserMsg },
        ]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: historySnapshot,
                    userMessage: newUserMsg,
                }),
            });

            const data = await res.json();

            if (data.wantsHuman) setWantsHuman(true);

            setMessages((prev) => [
                ...prev,
                {
                    id: newId('bot'),
                    role: 'model',
                    content: data.reply || 'Something went wrong.',
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: newId('bot'),
                    role: 'model',
                    content: "I'm having trouble connecting. You can talk to a real person instead!",
                },
            ]);
            setWantsHuman(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={handleOpenChat}
                    disabled={isCheckingPing}
                    aria-label="Toggle chat assistant"
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-[#fcc4c8]/50 bg-white/75 shadow-soft backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#fcc4c8]/15 hover:border-[#fcc4c8] active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#fcc4c8]/20 disabled:cursor-not-allowed"
                >
                    {/* Ping ring — only when idle */}
                    {!isOpen && !isCheckingPing && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#fcc4c8] opacity-20 group-hover:animate-none" />
                    )}

                    {/* Hover glow */}
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#fcc4c8]/10 to-[#fcc4c8]/20 opacity-0 blur transition duration-300 group-hover:opacity-100" />

                    <div className="relative z-10 flex items-center justify-center">
                        {isCheckingPing ? (
                            <IconLoader2 className="h-6 w-6 animate-spin text-[#fcc4c8]" />
                        ) : isOpen ? (
                            <IconX className="h-5 w-5 text-[#0b0b0f]/75 transition-transform duration-300 group-hover:rotate-90" />
                        ) : (
                            <IconSparkles className="h-6 w-6 text-[#fcc4c8] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                        )}
                    </div>

                    {/* Tooltip — vertically centered, hidden on xs */}
                    {!isOpen && (
                        <span className="pointer-events-none absolute right-[calc(100%+0.625rem)] top-1/2 hidden -translate-y-1/2 -translate-x-1 whitespace-nowrap rounded-xl border border-[#fcc4c8]/25 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#0b0b0f]/65 shadow-softSm opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 sm:block">
                            Ask An-Nisa Bot
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed bottom-24 right-4 z-50 flex h-[34rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl sm:right-6 sm:w-[22rem]"
                        style={{
                            background: 'rgba(255, 248, 248, 0.88)',
                            backdropFilter: 'blur(24px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                            border: '1px solid rgba(252, 196, 200, 0.3)',
                            boxShadow: '0 10px 30px rgba(11, 11, 15, 0.08)',
                        }}
                    >
                        {/* Stitch accent line */}
                        <div className="h-[2px] w-full shrink-0 bg-gradient-to-r from-[#fcc4c8]/0 via-[#fcc4c8] to-[#fcc4c8]/0 animate-stitch bg-[length:200%_100%]" />

                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b border-[#fcc4c8]/20 bg-[#fff8f8]/70 px-4 py-3.5 backdrop-blur-sm">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#fcc4c8]/40 bg-[#fcc4c8]/20 shadow-sm">
                                    <IconSparkles className="h-4 w-4 text-[#0b0b0f]/70" stroke={1.8} />
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-1.5 font-serif text-[15px] font-bold leading-none text-[#0b0b0f]">
                                        An-Nisa
                                        <span className="rounded-full border border-[#fcc4c8]/40 bg-[#fcc4c8]/30 px-2 py-0.5 font-sans text-[10px] font-bold tracking-wide text-[#0b0b0f]/70">
                                            Bot
                                        </span>
                                    </h3>
                                    <div className="mt-1 flex items-center gap-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-sans text-[9px] font-semibold uppercase tracking-widest text-[#0b0b0f]/40">
                                            Online
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Close chat"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#fcc4c8]/30 text-[#0b0b0f]/40 transition-all duration-200 hover:border-[#fcc4c8]/60 hover:bg-[#fcc4c8]/15 hover:text-[#0b0b0f]"
                            >
                                <IconX className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="sidebar-scroll flex-1 overflow-y-auto space-y-3 bg-gradient-to-b from-[#fff8f8]/30 via-white/60 to-white/40 px-4 py-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-[#0b0b0f] px-4 py-2.5 font-sans text-[13.5px] font-medium leading-relaxed text-white shadow-softSm">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="max-w-[82%] rounded-2xl rounded-tl-sm border border-[#fcc4c8]/30 bg-white px-4 py-2.5 font-sans text-[13.5px] leading-relaxed text-[#0b0b0f] shadow-softSm">
                                            <ReactMarkdown
                                                urlTransform={(url) => url}
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className="mb-1.5 last:mb-0">{children}</p>
                                                    ),
                                                    strong: ({ children }) => (
                                                        <strong className="font-semibold text-brand-black">{children}</strong>
                                                    ),
                                                    em: ({ children }) => (
                                                        <em className="italic">{children}</em>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="list-disc list-inside space-y-1 mt-1">{children}</ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="list-decimal list-inside space-y-1 mt-1">{children}</ol>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="text-sm">{children}</li>
                                                    ),
                                                    a: ({ href, children }) => (
                                                        <a
                                                            href={href}
                                                            target={href?.startsWith('/') ? '_self' : '_blank'}
                                                            rel={href?.startsWith('/') ? undefined : 'noopener noreferrer'}
                                                            className="text-brand-pink underline hover:opacity-80 font-medium"
                                                        >
                                                            {children}
                                                        </a>
                                                    ),
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isLoading && (
                                <div className="flex animate-fade-in-up justify-start">
                                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-[#fcc4c8]/30 bg-white px-4 py-3 shadow-softSm">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#fcc4c8] animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#fcc4c8]/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#fcc4c8]/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}

                            {/* WhatsApp fallback */}
                            {wantsHuman && (
                                <div className="flex animate-fade-in-up justify-center pt-1">
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition-all duration-300 hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <IconBrandWhatsapp className="h-4 w-4" />
                                        Contact our team on WhatsApp
                                    </a>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="shrink-0 border-t border-[#fcc4c8]/20 bg-white/80 px-3.5 py-3 backdrop-blur-sm">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask a question..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    disabled={isLoading}
                                    className="flex-1 rounded-full border border-[#fcc4c8]/30 bg-[#fff8f8]/60 px-4 py-2.5 text-[13.5px] text-[#0b0b0f] placeholder:text-[#0b0b0f]/35 transition-all duration-200 focus:border-[#fcc4c8]/60 focus:bg-white focus:outline-none disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    aria-label="Send message"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fcc4c8] text-[#0b0b0f] shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#fcc4c8]/85 active:scale-95 disabled:bg-[#f5f5f5] disabled:text-[#0b0b0f]/25 disabled:scale-100 disabled:shadow-none"
                                >
                                    <IconSend className="h-[16px] w-[16px]" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
