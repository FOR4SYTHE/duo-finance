import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetConfig, BudgetPeriod, BudgetCategory } from '@/types/finance';

interface BudgetState {
    config: BudgetConfig;
    categories: BudgetCategory[];
    setBudget: (targetAmount: number, period: BudgetPeriod) => void;
    setJarPercentage: (pct: number) => void;
    addCategory: (category: Omit<BudgetCategory, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<BudgetCategory>) => void;
    removeCategory: (id: string) => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
    { id: '1', name: 'Rent', icon: 'Home', color: '#30D158', targetAmount: 0 },
    { id: '2', name: 'Groceries', icon: 'ShoppingBag', color: '#E8A33D', targetAmount: 0 },
    { id: '3', name: 'Utilities', icon: 'Zap', color: '#0A84FF', targetAmount: 0 },
    { id: '4', name: 'Bills', icon: 'CreditCard', color: '#FF453A', targetAmount: 0 },
    { id: '5', name: 'Kids Tuition', icon: 'GraduationCap', color: '#BF5AF2', targetAmount: 0 },
];

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set) => ({
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            config: {
                targetAmount: 0,
                period: 'monthly',
                jarAllowedPercentage: 0
            },
            categories: DEFAULT_CATEGORIES,
            setBudget: (targetAmount: number, period: BudgetPeriod) => 
                set((state) => ({ config: { ...state.config, targetAmount, period } })),
            setJarPercentage: (percentage: number) => 
                set((state) => ({ config: { ...state.config, jarAllowedPercentage: percentage } })),
            addCategory: (category) => 
                set((state) => ({ 
                    categories: [...state.categories, { ...category, id: Math.random().toString(36).substring(7) }] 
                })),
            updateCategory: (id, updates) => 
                set((state) => ({
                    categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c)
                })),
            removeCategory: (id) => 
                set((state) => ({
                    categories: state.categories.filter(c => c.id !== id)
                }))
        }),
        {
            name: 'duo-budget-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            }
        }
    )
);
