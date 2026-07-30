"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowUp, Loader2 } from 'lucide-react';
import { useAIChatStore } from '@/store/useAIChatStore';
import { buildHouseholdContext } from '@/lib/buildHouseholdContext';
import { DuoAIIcon } from '@/components/ui/DuoAIIcon';

export function AIChatView() {
    const { messages, isStreaming, addUserMessage, startAssistantMessage, appendToMessage, completeMessage, errorMessage, setStreaming, clearChat } = useAIChatStore();
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

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
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05] bg-[#0A0A0A]/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1C1C1E] flex items-center justify-center">
                        <DuoAIIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Duo AI</h2>
                        <p className="text-xs text-white/50">Household Assistant</p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button onClick={clearChat} className="text-xs text-white/40 hover:text-white transition-colors">
                        Clear
                    </button>
                )}
            </div>

            {/* Chat History */}
            <div 
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-6 pb-32"
            >
                {messages.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-full text-center max-w-[280px] mx-auto mt-20"
                    >
                        <div className="relative mb-6">
                            <DuoAIIcon className="w-16 h-16 text-white/20" forceState="star-idle" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[11px] font-bold tracking-[0.2em] text-white/50 pl-[0.3em] mt-[1px]">DUO</span>
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Hi! I'm Duo AI.</h3>
                        <p className="text-sm text-white/60 mb-8 leading-relaxed">
                            Your household finance assistant. I can help with budgeting, spending advice, and local cost-of-living insights.
                        </p>
                        <div className="flex flex-col gap-3 w-full">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(s)}
                                    className="px-4 py-3 rounded-2xl bg-[#1C1C1E] hover:bg-[#2C2C2E] text-sm text-white/80 transition-colors text-left"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-6 h-6 shrink-0 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-1">
                                            {msg.status === 'streaming' ? (
                                                <DuoAIIcon className="w-3.5 h-3.5 text-amber-300" />
                                            ) : (
                                                <DuoAIIcon className="w-3.5 h-3.5 text-white/60" />
                                            )}
                                        </div>
                                    )}
                                    <div 
                                        className={`px-4 py-3 rounded-[20px] text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                                            msg.role === 'user' 
                                                ? 'bg-white text-black rounded-br-md' 
                                                : 'bg-[#1C1C1E] text-white/90 rounded-bl-md border border-white/[0.05]'
                                        } ${msg.status === 'error' ? 'border-red-500/30 text-red-400' : ''}`}
                                    >
                                        {msg.content}
                                        {msg.status === 'streaming' && (
                                            <span className="inline-block w-1.5 h-4 ml-1 bg-white/40 animate-pulse align-middle" />
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-10">
                <div className="relative max-w-lg mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isStreaming && handleSend()}
                        disabled={isStreaming}
                        placeholder={isStreaming ? "Duo AI is thinking..." : "Message Duo AI..."}
                        className="w-full pl-5 pr-14 py-4 rounded-[28px] bg-[#1C1C1E] border border-white/[0.08] text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all disabled:opacity-60 shadow-lg"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputValue.trim() || isStreaming}
                        className="absolute right-2 top-2 bottom-2 w-10 bg-white rounded-full flex items-center justify-center disabled:opacity-30 disabled:bg-white/10 transition-colors"
                    >
                        <ArrowUp className={`w-5 h-5 ${!inputValue.trim() || isStreaming ? 'text-white' : 'text-black'}`} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}
