import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExpenseEntry } from '@/types/finance';

interface SpendState {
    entries: ExpenseEntry[];
    addExpense: (amount: number, currency: 'PHP' | 'ZAR', category?: string, note?: string) => void;
    removeExpense: (id: string) => void;
}

export const useSpendStore = create<SpendState>()(
    persist(
        (set) => ({
            entries: [],
            
            addExpense: (amount, currency, category, note) => set((state) => {
                const newEntry: ExpenseEntry = {
                    id: crypto.randomUUID(),
                    amount,
                    currency,
                    category,
                    note,
                    timestamp: Date.now()
                };
                return { entries: [newEntry, ...state.entries] };
            }),

            removeExpense: (id) => set((state) => ({
                entries: state.entries.filter(e => e.id !== id)
            }))
        }),
        {
            name: 'duo-spend-storage'
        }
    )
);
