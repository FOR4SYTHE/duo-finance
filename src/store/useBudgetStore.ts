import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetConfig, BudgetPeriod } from '@/types/finance';

interface BudgetState {
    config: BudgetConfig;
    setBudget: (amount: number, period: BudgetPeriod) => void;
}

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set) => ({
            config: {
                targetAmount: 30000, // Default 30k PHP
                period: 'monthly'
            },
            setBudget: (targetAmount: number, period: BudgetPeriod) => 
                set({ config: { targetAmount, period } })
        }),
        {
            name: 'duo-budget-storage'
        }
    )
);
