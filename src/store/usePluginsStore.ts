import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PluginsState {
    scratchpadContent: string;
    setScratchpadContent: (content: string) => void;
}

export const usePluginsStore = create<PluginsState>()(
    persist(
        (set) => ({
            scratchpadContent: '',
            setScratchpadContent: (content) => set({ scratchpadContent: content }),
        }),
        {
            name: 'duo-plugins-storage',
        }
    )
);
