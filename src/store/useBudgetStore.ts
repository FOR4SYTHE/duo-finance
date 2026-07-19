import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetConfig, BudgetPeriod } from '@/types/finance';

interface BudgetState {
    config: BudgetConfig;
    setBudget: (amount: number, period: BudgetPeriod) => void;
    setJarPercentage: (percentage: number) => void;
}

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set) => ({
            config: {
                targetAmount: 30000, // Default 30k PHP
                period: 'monthly',
                jarAllowedPercentage: 20 // Default 20%
            },
            setBudget: (targetAmount: number, period: BudgetPeriod) => 
                set((state) => ({ config: { ...state.config, targetAmount, period } })),
            setJarPercentage: (percentage: number) => 
                set((state) => ({ config: { ...state.config, jarAllowedPercentage: percentage } }))
        }),
        {
            name: 'duo-budget-storage'
        }
    )
);
