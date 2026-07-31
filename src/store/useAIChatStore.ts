import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    status: 'sending' | 'streaming' | 'complete' | 'error';
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    isPinned: boolean;
    updatedAt: number;
}

interface AIChatState {
    chats: ChatSession[];
    currentChatId: string | null;
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
    
    // Chat History Actions
    startNewChat: () => void;
    loadChat: (id: string) => void;
    deleteChat: (id: string) => void;
    togglePinChat: (id: string) => void;
    renameChat: (id: string, newTitle: string) => void;
    clearAllHistory: () => void;
    
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
            chats: [],
            currentChatId: null,
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

                let newChats = [...state.chats];
                let chatId = state.currentChatId;

                if (!chatId) {
                    chatId = crypto.randomUUID();
                    const newChat: ChatSession = {
                        id: chatId,
                        title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
                        messages: [newMessage],
                        isPinned: false,
                        updatedAt: Date.now()
                    };
                    newChats.unshift(newChat);
                } else {
                    newChats = newChats.map(c => 
                        c.id === chatId 
                            ? { ...c, messages: [...c.messages, newMessage], updatedAt: Date.now() }
                            : c
                    );
                }

                return { chats: newChats, currentChatId: chatId };
            }),

            startAssistantMessage: () => {
                const id = crypto.randomUUID();
                set((state) => {
                    if (!state.currentChatId) return state;
                    const newMessage: ChatMessage = {
                        id,
                        role: 'assistant',
                        content: '',
                        timestamp: Date.now(),
                        status: 'streaming'
                    };
                    return {
                        chats: state.chats.map(c => 
                            c.id === state.currentChatId
                                ? { ...c, messages: [...c.messages, newMessage], updatedAt: Date.now() }
                                : c
                        ),
                        isStreaming: true
                    };
                });
                return id;
            },

            appendToMessage: (id: string, text: string) => set((state) => {
                if (!state.currentChatId) return state;
                return {
                    chats: state.chats.map(c => 
                        c.id === state.currentChatId
                            ? { 
                                ...c, 
                                messages: c.messages.map(msg => 
                                    msg.id === id ? { ...msg, content: msg.content + text } : msg
                                ) 
                              }
                            : c
                    )
                };
            }),

            completeMessage: (id: string) => set((state) => {
                if (!state.currentChatId) return state;
                return {
                    chats: state.chats.map(c => 
                        c.id === state.currentChatId
                            ? { 
                                ...c, 
                                messages: c.messages.map(msg => 
                                    msg.id === id ? { ...msg, status: 'complete' } : msg
                                ) 
                              }
                            : c
                    ),
                    isStreaming: false
                };
            }),

            errorMessage: (id: string, error: string) => set((state) => {
                if (!state.currentChatId) return state;
                return {
                    chats: state.chats.map(c => 
                        c.id === state.currentChatId
                            ? { 
                                ...c, 
                                messages: c.messages.map(msg => 
                                    msg.id === id ? { ...msg, status: 'error', content: error } : msg
                                ) 
                              }
                            : c
                    ),
                    isStreaming: false
                };
            }),

            setStreaming: (streaming: boolean) => set({ isStreaming: streaming }),
            setActiveTab: (tab: 'chat' | 'scanner') => set({ activeTab: tab }),
            
            startNewChat: () => set({ currentChatId: null, isStreaming: false }),
            loadChat: (id: string) => set({ currentChatId: id, isStreaming: false }),
            deleteChat: (id: string) => set((state) => {
                const newChats = state.chats.filter(c => c.id !== id);
                return { 
                    chats: newChats,
                    currentChatId: state.currentChatId === id ? null : state.currentChatId
                };
            }),
            togglePinChat: (id: string) => set((state) => ({
                chats: state.chats.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c)
            })),
            renameChat: (id: string, newTitle: string) => set((state) => ({
                chats: state.chats.map(c => c.id === id ? { ...c, title: newTitle } : c)
            })),
            clearAllHistory: () => set({ chats: [], currentChatId: null }),
            
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
                chats: state.chats, 
                activeTab: state.activeTab, 
                isFirstVisit: state.isFirstVisit,
                userName: state.userName 
            }),
        }
    )
);
