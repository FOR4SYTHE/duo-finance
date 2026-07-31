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

interface PluginsState {
    scratchpadContent: string;
    setScratchpadContent: (content: string) => void;
    
    // Receipt Vault
    documents: VaultDocument[];
    addDocument: (doc: VaultDocument) => void;
    deleteDocument: (id: string) => void;
}

export const usePluginsStore = create<PluginsState>()(
    persist(
        (set) => ({
            scratchpadContent: '',
            setScratchpadContent: (content) => set({ scratchpadContent: content }),
            
            documents: [],
            addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
            deleteDocument: (id) => set((state) => ({ documents: state.documents.filter(d => d.id !== id) })),
        }),
        {
            name: 'duo-plugins-storage',
        }
    )
);
