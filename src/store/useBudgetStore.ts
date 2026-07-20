import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetConfig, BudgetPeriod, BudgetCategory } from '@/types/finance';

interface BudgetState {
    config: BudgetConfig;
    categories: BudgetCategory[];
    savedSoFar: number;
    setSavedSoFar: (amount: number) => void;
    setBudget: (targetAmount: number, period: BudgetPeriod) => void;
    setJarPercentage: (pct: number) => void;
    addCategory: (category: Omit<BudgetCategory, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<BudgetCategory>) => void;
    updateCategoriesTarget: (updates: { id: string, targetAmount: number }[]) => void;
    removeCategory: (id: string) => void;
    
    // Sub-category operations
    updateSubCategory: (categoryId: string, subId: string, amount: number) => void;
    addSubCategory: (categoryId: string, name: string) => void;
    removeSubCategory: (categoryId: string, subId: string) => void;

    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
    { id: '1', name: 'Rent', icon: 'Home', color: '#30D158', targetAmount: 0 },
    { id: '2', name: 'Groceries', icon: 'ShoppingBag', color: '#E8A33D', targetAmount: 0 },
    { 
        id: '3', name: 'Utilities', icon: 'Zap', color: '#0A84FF', targetAmount: 0,
        subCategories: [
            { id: 'util-1', name: 'Electricity', amount: 0 },
            { id: 'util-2', name: 'Water', amount: 0 },
            { id: 'util-3', name: 'Internet', amount: 0 },
            { id: 'util-4', name: 'Mobile/Postpaid plans', amount: 0 },
        ]
    },
    { 
        id: '4', name: 'Bills', icon: 'CreditCard', color: '#FF453A', targetAmount: 0,
        subCategories: [
            { id: 'bill-1', name: 'Credit card', amount: 0 },
            { id: 'bill-2', name: 'Subscriptions', amount: 0 },
            { id: 'bill-3', name: 'Shopee/Lazada', amount: 0 },
            { id: 'bill-4', name: 'Parcel', amount: 0 },
            { id: 'bill-5', name: 'Gym', amount: 0 },
        ]
    },
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
            savedSoFar: 0,
            setSavedSoFar: (amount: number) => set({ savedSoFar: amount }),
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
            updateCategoriesTarget: (updates) =>
                set((state) => ({
                    categories: state.categories.map(c => {
                        const match = updates.find(u => u.id === c.id);
                        return match ? { ...c, targetAmount: match.targetAmount } : c;
                    })
                })),
            removeCategory: (id) => 
                set((state) => ({
                    categories: state.categories.filter(c => c.id !== id)
                })),

            // Sub-category operations
            updateSubCategory: (categoryId, subId, amount) => 
                set((state) => ({
                    categories: state.categories.map(c => {
                        if (c.id !== categoryId || !c.subCategories) return c;
                        const newSub = c.subCategories.map(s => s.id === subId ? { ...s, amount } : s);
                        const newTargetAmount = newSub.reduce((acc, curr) => acc + curr.amount, 0);
                        return { ...c, subCategories: newSub, targetAmount: newTargetAmount };
                    })
                })),
            addSubCategory: (categoryId, name) => 
                set((state) => ({
                    categories: state.categories.map(c => {
                        if (c.id !== categoryId) return c;
                        const newSub = [...(c.subCategories || []), { id: Math.random().toString(36).substring(7), name, amount: 0 }];
                        return { ...c, subCategories: newSub };
                    })
                })),
            removeSubCategory: (categoryId, subId) =>
                set((state) => ({
                    categories: state.categories.map(c => {
                        if (c.id !== categoryId || !c.subCategories) return c;
                        const newSub = c.subCategories.filter(s => s.id !== subId);
                        const newTargetAmount = newSub.reduce((acc, curr) => acc + curr.amount, 0);
                        return { ...c, subCategories: newSub, targetAmount: newTargetAmount };
                    })
                }))
        }),
        {
            name: 'duo-budget-storage',
            merge: (persistedState: any, currentState) => {
                const merged = { ...currentState, ...persistedState };
                if (persistedState.categories) {
                    merged.categories = persistedState.categories.map((cat: any) => {
                        const defaultCat = DEFAULT_CATEGORIES.find(d => d.name === cat.name);
                        if (defaultCat?.subCategories && !cat.subCategories) {
                            return { ...cat, subCategories: defaultCat.subCategories };
                        }
                        return cat;
                    });
                }
                return merged;
            },
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.setHasHydrated(true);
                }
            }
        }
    )
);
