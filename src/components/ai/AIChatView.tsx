"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowUp, Loader2, Copy, Share2, Check, Plus, Mic } from 'lucide-react';
import { useAIChatStore } from '@/store/useAIChatStore';
import { buildHouseholdContext } from '@/lib/buildHouseholdContext';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AIChatView() {
    const { chats, currentChatId, isStreaming, addUserMessage, startAssistantMessage, appendToMessage, completeMessage, errorMessage, setStreaming, startNewChat, isFirstVisit, userName } = useAIChatStore();
    const [inputValue, setInputValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 56), 200)}px`;
        }
    }, [inputValue]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const currentChat = chats.find(c => c.id === currentChatId);
    const messages = currentChat?.messages || [];

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };
    
    // For randomized returning greetings without hydration errors
    const [greeting, setGreeting] = useState(`Ready to check your budget today, ${userName}?`);
    useEffect(() => {
        if (chats.length > 0) {
            const greetings = [
                `Ready to check your budget today, ${userName}?`,
                `Let's review this week's spending, ${userName}.`,
                `How are we tracking against our goals, ${userName}?`,
                `What's on your financial mind today, ${userName}?`
            ];
            setGreeting(greetings[Math.floor(Math.random() * greetings.length)]);
        }
    }, [chats.length, userName]);

    const scrollToBottom = () => {
        if (!isScrolledUp && scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming]);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
        setIsScrolledUp(!isNearBottom);
    };

    const handleSend = async (presetMessage?: string) => {
        const content = presetMessage || inputValue.trim();
        if (!content || isStreaming) return;

        setInputValue('');
        addUserMessage(content);

        // Keep last 10 messages for context (20 roles)
        const recentMessages = [...messages, { role: 'user', content }].slice(-20);
        const householdContext = buildHouseholdContext();

        const assistantMsgId = startAssistantMessage();

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: recentMessages, householdContext })
            });

            if (!response.ok || !response.body) {
                throw new Error('Failed to connect to AI');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    completeMessage(assistantMsgId);
                    break;
                }
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.slice(6).trim();
                        if (dataStr === '[DONE]') continue;
                        
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.text) {
                                appendToMessage(assistantMsgId, data.text);
                            }
                            if (data.error) {
                                errorMessage(assistantMsgId, data.error);
                            }
                        } catch (e) {
                            console.warn("Failed to parse stream chunk", e);
                        }
                    }
                }
            }
        } catch (error: any) {
            errorMessage(assistantMsgId, error.message || 'Something went wrong.');
        }
    };

    const suggestions = [
        "How's our budget this month?",
        "What can we save on?",
        "Compare PHP vs ZAR trends"
    ];

    return (
        <div className="flex flex-col h-full bg-[#050505] relative">
            {/* Chat History */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 pb-32 no-scrollbar flex flex-col items-center"
            >
                <div className="w-full max-w-3xl flex flex-col gap-6">
                    {messages.length > 0 && (
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`flex flex-col gap-1 w-full`}>
                                        <div 
                                            className={`text-[15px] leading-[1.7] ${
                                                msg.role === 'user' 
                                                    ? 'px-5 py-3.5 bg-[#2C2C2E] text-white rounded-[24px] rounded-br-[6px] self-end max-w-[85%] whitespace-pre-wrap' 
                                                    : 'text-white/90 w-full self-start [&>p]:mb-5 [&>ul]:mb-5 [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-2 [&>h1]:text-xl [&>h1]:font-bold [&>h1]:mb-3 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mb-3 [&>h3]:text-base [&>h3]:font-bold [&>h3]:mb-2 [&>strong]:font-semibold [&>strong]:text-white last:[&>*]:mb-0'
                                            } ${msg.status === 'error' ? 'text-red-400' : ''}`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                msg.status === 'streaming' && !msg.content ? (
                                                    <div className="py-2">
                                                        <DuoAIIcon className="w-6 h-6 animate-spin text-white/70" forceState="star-idle" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <ReactMarkdown 
                                                            remarkPlugins={[remarkGfm]}
                                                            components={{
                                                                hr: () => <div className="h-6" />
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                        {msg.status === 'streaming' && (
                                                            <span className="inline-block w-1.5 h-4 ml-1 bg-white/40 animate-pulse align-middle" />
                                                        )}
                                                    </>
                                                )
                                            ) : (
                                                msg.content
                                            )}
                                        </div>

                                        {msg.role === 'assistant' && msg.status !== 'streaming' && (
                                            <div className="flex items-center gap-4 mt-1">
                                                <button 
                                                    onClick={() => handleCopy(msg.id, msg.content)}
                                                    className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/80 transition-colors"
                                                >
                                                    {copiedId === msg.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                                <button className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/80 transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Dynamic Premium Input Area */}
            <motion.div 
                layout
                className={`w-full px-4 z-20 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    messages.length === 0 
                        ? 'absolute top-1/2 left-0 -translate-y-1/2' 
                        : 'absolute bottom-0 left-0 pb-6'
                }`}
            >
                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center justify-center text-center mb-8"
                        >
                            {chats.length === 0 ? (
                                <>
                                    <div className="relative mb-6 mx-auto w-16 h-16">
                                        <DuoAIIcon className="w-16 h-16 text-white/20" forceState="star-idle" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-[11px] font-bold tracking-[0.2em] text-white/50 pl-[0.3em] mt-[1px]">DUO</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-light text-white mb-2 tracking-tight">
                                        Hi, {userName}. I'm DUO AI.
                                    </h3>
                                    <p className="text-[14px] text-white/40 max-w-sm mx-auto leading-relaxed">
                                        Your household finance assistant. I can help with budgeting, spending advice, and local cost-of-living insights.
                                    </p>
                                </>
                            ) : (
                                <h3 className="text-3xl font-light text-white mb-2 tracking-tight">
                                    {greeting}
                                </h3>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {!isStreaming && (
                        <motion.div 
                            key="input"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative max-w-2xl mx-auto flex items-end bg-[#1C1C1E] rounded-3xl border border-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* High-Performance CSS Mono Beam */}
                            <div className="absolute top-0 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.4)] opacity-80" />
                            
                            {/* Plus / Features Menu Button */}
                            <button 
                                className="w-12 h-14 flex items-center justify-center shrink-0 text-white/40 hover:text-white transition-colors relative z-10"
                                onClick={() => {}}
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                            
                            <textarea
                                ref={textareaRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (!isStreaming) handleSend();
                                    }
                                }}
                                placeholder="Ask DUO AI"
                                className="flex-1 py-[17px] bg-transparent text-white placeholder-white/40 focus:outline-none transition-all text-[15px] font-medium relative z-10 resize-none min-h-[56px] max-h-[200px]"
                                rows={1}
                            />
                            
                            <div className="pr-2 pl-1 h-14 flex items-center relative z-10 gap-1 shrink-0">
                                <button className="w-9 h-9 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim()}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${!inputValue.trim() ? 'bg-white/10 text-white/30' : 'bg-white text-black shadow-md scale-105'}`}
                                >
                                    <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {messages.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="mt-6 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto"
                        >
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(s)}
                                    className="px-4 py-2 rounded-full bg-[#1C1C1E]/60 hover:bg-[#2C2C2E] border border-white/[0.05] text-[13px] text-white/70 transition-colors shadow-sm"
                                >
                                    {s}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
