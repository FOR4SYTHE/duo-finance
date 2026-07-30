import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    status: 'sending' | 'streaming' | 'complete' | 'error';
}

interface AIChatState {
    messages: ChatMessage[];
    isStreaming: boolean;
    activeTab: 'chat' | 'scanner';

    // Actions
    addUserMessage: (content: string) => void;
    startAssistantMessage: () => string; // returns new message id
    appendToMessage: (id: string, text: string) => void;
    completeMessage: (id: string) => void;
    errorMessage: (id: string, error: string) => void;
    setStreaming: (streaming: boolean) => void;
    setActiveTab: (tab: 'chat' | 'scanner') => void;
    clearChat: () => void;
    
    // For testing
    isFirstVisit: boolean;
    toggleFirstVisit: () => void;
    userName: string;
    
    // Scanner UI state for header coordination
    isScannerHasResults: boolean;
    setScannerHasResults: (hasResults: boolean) => void;
    isScannerExpanded: boolean;
    setScannerExpanded: (expanded: boolean) => void;
}

export const useAIChatStore = create<AIChatState>()(
    persist(
        (set) => ({
            messages: [],
            isStreaming: false,
            activeTab: 'chat',

            addUserMessage: (content: string) => set((state) => {
                const newMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: 'user',
                    content,
                    timestamp: Date.now(),
                    status: 'complete' // Optimistic UI
                };
                return { messages: [...state.messages, newMessage] };
            }),

            startAssistantMessage: () => {
                const id = crypto.randomUUID();
                set((state) => {
                    const newMessage: ChatMessage = {
                        id,
                        role: 'assistant',
                        content: '',
                        timestamp: Date.now(),
                        status: 'streaming'
                    };
                    return {
                        messages: [...state.messages, newMessage],
                        isStreaming: true
                    };
                });
                return id;
            },

            appendToMessage: (id: string, text: string) => set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.id === id ? { ...msg, content: msg.content + text } : msg
                )
            })),

            completeMessage: (id: string) => set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.id === id ? { ...msg, status: 'complete' } : msg
                ),
                isStreaming: false
            })),

            errorMessage: (id: string, error: string) => set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.id === id ? { ...msg, status: 'error', content: error } : msg
                ),
                isStreaming: false
            })),

            setStreaming: (streaming: boolean) => set({ isStreaming: streaming }),
            setActiveTab: (tab: 'chat' | 'scanner') => set({ activeTab: tab }),
            clearChat: () => set({ messages: [], isStreaming: false }),
            
            isFirstVisit: true,
            toggleFirstVisit: () => set((state) => ({ isFirstVisit: !state.isFirstVisit })),
            
            userName: "Alex",
            
            isScannerHasResults: false,
            setScannerHasResults: (hasResults) => set({ isScannerHasResults: hasResults }),
            isScannerExpanded: false,
            setScannerExpanded: (expanded) => set({ isScannerExpanded: expanded })
        }),
        {
            name: 'duo-ai-chat-storage',
            partialize: (state) => ({ 
                messages: state.messages, 
                activeTab: state.activeTab, 
                isFirstVisit: state.isFirstVisit,
                userName: state.userName 
            }),
        }
    )
);
