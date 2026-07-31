import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    status: 'sending' | 'streaming' | 'complete' | 'error';
    scanContext?: ScanContext;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    isPinned: boolean;
    isScan?: boolean;
    updatedAt: number;
}

export interface ScanContext {
    itemName: string;
    brand: string | null;
    description: string;
    listings: { name: string; price_php: number; source: string; url: string }[];
}

interface AIChatState {
    chats: ChatSession[];
    currentChatId: string | null;
    isStreaming: boolean;
    activeTab: 'chat' | 'scanner' | 'scratchpad' | 'plugins' | 'receipt-vault' | 'relocation-hub';
    
    // Settings
    aiSettings: {
        personality: 'general' | 'strict' | 'shopper' | 'custom';
        customInstructions: string;
    };

    // Actions
    addUserMessage: (content: string, options?: { isScan?: boolean; scanContext?: ScanContext }) => void;
    startAssistantMessage: () => string; // returns new message id
    appendToMessage: (id: string, text: string) => void;
    completeMessage: (id: string) => void;
    errorMessage: (id: string, error: string) => void;
    setStreaming: (streaming: boolean) => void;
    setActiveTab: (tab: 'chat' | 'scanner' | 'scratchpad' | 'plugins' | 'receipt-vault' | 'relocation-hub') => void;
    
    // Chat History Actions
    startNewChat: () => void;
    loadChat: (id: string) => void;
    deleteChat: (id: string) => void;
    togglePinChat: (id: string) => void;
    renameChat: (id: string, newTitle: string) => void;
    clearAllHistory: () => void;
    updateAISettings: (settings: Partial<AIChatState['aiSettings']>) => void;
    
    // For testing
    isFirstVisit: boolean;
    toggleFirstVisit: () => void;
    userName: string;
    
    // Scanner UI state for header coordination
    isScannerHasResults: boolean;
    setScannerHasResults: (hasResults: boolean) => void;
    isScannerExpanded: boolean;
    setScannerExpanded: (expanded: boolean) => void;
    
    // Pending scan context for handoff to chat
    pendingScanContext: ScanContext | null;
    setPendingScanContext: (ctx: ScanContext | null) => void;
}

export const useAIChatStore = create<AIChatState>()(
    persist(
        (set) => ({
            chats: [],
            currentChatId: null,
            isStreaming: false,
            activeTab: 'chat',
            aiSettings: {
                personality: 'general',
                customInstructions: '',
            },

            addUserMessage: (content: string, options?: { isScan?: boolean; scanContext?: ScanContext }) => set((state) => {
                const newMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: 'user',
                    content,
                    timestamp: Date.now(),
                    status: 'complete', // Optimistic UI
                    scanContext: options?.scanContext
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
                        isScan: options?.isScan,
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
            setActiveTab: (tab: 'chat' | 'scanner' | 'scratchpad' | 'plugins' | 'receipt-vault' | 'relocation-hub') => set({ activeTab: tab }),
            
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

            updateAISettings: (settings) => set((state) => ({
                aiSettings: {
                    ...state.aiSettings,
                    ...settings
                }
            })),
            
            isFirstVisit: true,
            toggleFirstVisit: () => set((state) => ({ isFirstVisit: !state.isFirstVisit })),
            
            userName: "Alex",
            
            isScannerHasResults: false,
            setScannerHasResults: (hasResults) => set({ isScannerHasResults: hasResults }),
            isScannerExpanded: false,
            setScannerExpanded: (expanded) => set({ isScannerExpanded: expanded }),
            
            pendingScanContext: null,
            setPendingScanContext: (ctx) => set({ pendingScanContext: ctx })
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
