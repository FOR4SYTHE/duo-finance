import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VaultDocument {
    id: string;
    title: string;
    category: 'receipt' | 'warranty' | 'visa' | 'other';
    date: string;
    amount?: number;
    tags: string[];
    thumbnailBase64?: string; // Extremely downscaled thumbnail only
    currency?: 'PHP' | 'ZAR';
}

export interface FlightConfig {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    date: string;
    layover?: string;
    connectingFlightNumber?: string;
}

interface PluginsState {
    scratchpadContent: string;
    setScratchpadContent: (content: string) => void;
    
    // Receipt Vault
    documents: VaultDocument[];
    addDocument: (doc: VaultDocument) => void;
    deleteDocument: (id: string) => void;

    // Relocation Hub
    relocationTasks: { id: string; text: string; completed: boolean }[];
    toggleRelocationTask: (id: string) => void;
    addRelocationTask: (text: string) => void;
    deleteRelocationTask: (id: string) => void;
    shippingRateZarPerKg: number;
    setShippingRateZarPerKg: (rate: number) => void;
    flightConfig: FlightConfig | null;
    setFlightConfig: (config: FlightConfig | null) => void;

    // Exchange Alerts
    targetExchangeRate: number | null;
    setTargetExchangeRate: (rate: number | null) => void;

    // Pinned Plugins
    pinnedPlugins: string[];
    togglePinnedPlugin: (id: string) => void;
}

export const usePluginsStore = create<PluginsState>()(
    persist(
        (set) => ({
            scratchpadContent: '',
            setScratchpadContent: (content) => set({ scratchpadContent: content }),
            
            documents: [],
            addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
            deleteDocument: (id) => set((state) => ({ documents: state.documents.filter(d => d.id !== id) })),

            // Relocation Hub defaults
            relocationTasks: [
                { id: '1', text: 'Cancel SA bank accounts & set up international transfers', completed: false },
                { id: '2', text: 'Book excess baggage for MNL flight', completed: false },
                { id: '3', text: 'Apply for PH visitor visa extension', completed: false },
                { id: '4', text: 'Pack summer wardrobe & essentials', completed: false }
            ],
            toggleRelocationTask: (id) => set((state) => ({
                relocationTasks: state.relocationTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
            })),
            addRelocationTask: (text) => set((state) => ({
                relocationTasks: [...state.relocationTasks, { id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `task_${Date.now()}`, text, completed: false }]
            })),
            deleteRelocationTask: (id) => set((state) => ({
                relocationTasks: state.relocationTasks.filter(t => t.id !== id)
            })),
            shippingRateZarPerKg: 350, // Average rate for airfreight per KG from SA to PH
            setShippingRateZarPerKg: (rate) => set({ shippingRateZarPerKg: rate }),
            flightConfig: null,
            setFlightConfig: (config) => set({ flightConfig: config }),

            // Exchange Alerts
            targetExchangeRate: null,
            setTargetExchangeRate: (rate) => set({ targetExchangeRate: rate }),

            // Pinned Plugins
            pinnedPlugins: [],
            togglePinnedPlugin: (id) => set((state) => ({
                pinnedPlugins: state.pinnedPlugins.includes(id) 
                    ? state.pinnedPlugins.filter(p => p !== id)
                    : [...state.pinnedPlugins, id]
            }))
        }),
        {
            name: 'duo-plugins-storage',
        }
    )
);
