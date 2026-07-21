import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetConfig, BudgetPeriod, BudgetCategory, AppNotification } from '@/types/finance';

export interface Goal {
    id: string;
    name: string;
    icon: string;
    targetAmount: number;
    targetDate?: string;
    savedAmount: number;
}

interface BudgetState {
    config: BudgetConfig;
    categories: BudgetCategory[];
    goals: Goal[];
    notifications: AppNotification[];
    setBudget: (targetAmount: number, period: BudgetPeriod) => void;
    
    // Config Operations
    setJarPercentage: (pct: number) => void;
    setRunwayMultiplier: (multiplier: number) => void;
    setCardSkin: (skin: string) => void;
    setCardName: (name: string) => void;
    setActiveMonth: (month: string) => void;
    setLastSeenMonth: (month: string) => void;
    addCategory: (category: Omit<BudgetCategory, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<BudgetCategory>) => void;
    updateCategoriesTarget: (updates: { id: string, targetAmount: number }[]) => void;
    removeCategory: (id: string) => void;
    
    // Sub-category operations
    updateSubCategory: (categoryId: string, subId: string, amount: number) => void;
    addSubCategory: (categoryId: string, name: string) => void;
    removeSubCategory: (categoryId: string, subId: string) => void;

    // Goals operations
    addGoal: (goal: Omit<Goal, 'id'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    removeGoal: (id: string) => void;
    addMoneyToGoal: (id: string, amount: number) => void;

    // Notifications Operations
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;

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
    { 
        id: '5', name: 'Child Care', icon: 'GraduationCap', color: '#BF5AF2', targetAmount: 0,
        subCategories: [
            { id: 'child-1', name: 'School Supplies', amount: 0 },
            { id: 'child-2', name: 'Uniforms', amount: 0 },
            { id: 'child-3', name: 'Field Trips/Activities', amount: 0 },
            { id: 'child-4', name: 'Extracurricular', amount: 0 },
        ]
    },
];

const DEFAULT_GOALS: Goal[] = [
    { id: 'goal-1', name: 'Emergency Fund', icon: 'ShieldAlert', targetAmount: 0, savedAmount: 0 }
];

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set) => ({
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            config: {
                targetAmount: 0,
                period: 'monthly',
                jarAllowedPercentage: 0,
                runwayMultiplier: 3,
                cardSkin: 'default-dark',
                cardName: 'BL',
                activeMonth: new Date().toISOString().slice(0, 7), // "YYYY-MM" format
                lastSeenMonth: new Date().toISOString().slice(0, 7)
            },
            categories: DEFAULT_CATEGORIES,
            goals: DEFAULT_GOALS,
            notifications: [],
            setBudget: (targetAmount: number, period: BudgetPeriod) => 
                set((state) => ({ config: { ...state.config, targetAmount, period } })),
            setJarPercentage: (percentage: number) => 
                set((state) => ({ config: { ...state.config, jarAllowedPercentage: percentage } })),
            setRunwayMultiplier: (multiplier: number) =>
                set((state) => {
                    const newConfig = { ...state.config, runwayMultiplier: multiplier };
                    const monthlyBaseline = state.categories.reduce((sum, cat) => sum + cat.targetAmount, 0);
                    const targetRunway = monthlyBaseline * multiplier;
                    const goals = state.goals.map(g => g.id === 'goal-1' ? { ...g, targetAmount: targetRunway } : g);
                    return { config: newConfig, goals };
                }),
            setCardSkin: (skin: string) =>
                set((state) => ({ config: { ...state.config, cardSkin: skin } })),
            setCardName: (name: string) =>
                set((state) => ({ config: { ...state.config, cardName: name } })),
            setActiveMonth: (month: string) =>
                set((state) => ({ config: { ...state.config, activeMonth: month } })),
            setLastSeenMonth: (month: string) =>
                set((state) => ({ config: { ...state.config, lastSeenMonth: month } })),
            addCategory: (category) => 
                set((state) => {
                    const defaultMatch = DEFAULT_CATEGORIES.find(d => d.name.toLowerCase() === category.name.toLowerCase());
                    const subCategories = defaultMatch?.subCategories ? defaultMatch.subCategories : undefined;
                    return { 
                        categories: [...state.categories, { ...category, id: Math.random().toString(36).substring(7), subCategories }] 
                    };
                }),
            updateCategory: (id, updates) => 
                set((state) => {
                    const newCats = state.categories.map(c => c.id === id ? { ...c, ...updates } : c);
                    const monthlyBaseline = newCats.reduce((sum, cat) => sum + cat.targetAmount, 0);
                    const targetRunway = monthlyBaseline * (state.config.runwayMultiplier || 3);
                    const goals = state.goals.map(g => g.id === 'goal-1' ? { ...g, targetAmount: targetRunway } : g);
                    return { categories: newCats, goals };
                }),
            updateCategoriesTarget: (updates) =>
                set((state) => {
                    const newCats = state.categories.map(c => {
                        const match = updates.find(u => u.id === c.id);
                        return match ? { ...c, targetAmount: match.targetAmount } : c;
                    });
                    const monthlyBaseline = newCats.reduce((sum, cat) => sum + cat.targetAmount, 0);
                    const targetRunway = monthlyBaseline * (state.config.runwayMultiplier || 3);
                    const goals = state.goals.map(g => g.id === 'goal-1' ? { ...g, targetAmount: targetRunway } : g);
                    return { categories: newCats, goals };
                }),
            removeCategory: (id) => 
                set((state) => {
                    const newCats = state.categories.filter(c => c.id !== id);
                    const monthlyBaseline = newCats.reduce((sum, cat) => sum + cat.targetAmount, 0);
                    const targetRunway = monthlyBaseline * (state.config.runwayMultiplier || 3);
                    const goals = state.goals.map(g => g.id === 'goal-1' ? { ...g, targetAmount: targetRunway } : g);
                    return { categories: newCats, goals };
                }),

            // Sub-category operations
            updateSubCategory: (categoryId, subId, amount) => 
                set((state) => {
                    const newCats = state.categories.map(c => {
                        if (c.id !== categoryId || !c.subCategories) return c;
                        const newSub = c.subCategories.map(s => s.id === subId ? { ...s, amount } : s);
                        const newTargetAmount = newSub.reduce((acc, curr) => acc + curr.amount, 0);
                        return { ...c, subCategories: newSub, targetAmount: newTargetAmount };
                    });
                    const monthlyBaseline = newCats.reduce((sum, cat) => sum + cat.targetAmount, 0);
                    const targetRunway = monthlyBaseline * (state.config.runwayMultiplier || 3);
                    const goals = state.goals.map(g => g.id === 'goal-1' ? { ...g, targetAmount: targetRunway } : g);
                    return { categories: newCats, goals };
                }),
            addSubCategory: (categoryId, name) => 
                set((state) => ({
                    categories: state.categories.map(c => {
                        if (c.id !== categoryId) return c;
                        const newSub = [...(c.subCategories || []), { id: Math.random().toString(36).substring(7), name, amount: 0 }];
                        return { ...c, subCategories: newSub };
                    })
                })),
            removeSubCategory: (categoryId, subId) =>
                set((state) => {
                    const newCats = state.categories.map(c => {
                        if (c.id !== categoryId || !c.subCategories) return c;
                        const newSub = c.subCategories.filter(s => s.id !== subId);
                        const newTargetAmount = newSub.reduce((acc, curr) => acc + curr.amount, 0);
                        return { ...c, subCategories: newSub, targetAmount: newTargetAmount };
                    });
                    const monthlyBaseline = newCats.reduce((sum, cat) => sum + cat.targetAmount, 0);
                    const targetRunway = monthlyBaseline * (state.config.runwayMultiplier || 3);
                    const goals = state.goals.map(g => g.id === 'goal-1' ? { ...g, targetAmount: targetRunway } : g);
                    return { categories: newCats, goals };
                }),

            // Goals operations
            addGoal: (goal) => 
                set((state) => ({ 
                    goals: [...state.goals, { ...goal, id: Math.random().toString(36).substring(7), savedAmount: 0 }] 
                })),
            updateGoal: (id, updates) => 
                set((state) => ({
                    goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
                })),
            removeGoal: (id) => 
                set((state) => {
                    if (id === 'goal-1') return state; // Protect Emergency Fund from deletion
                    return { goals: state.goals.filter(g => g.id !== id) };
                }),
            addMoneyToGoal: (id, amount) =>
                set((state) => ({
                    goals: state.goals.map(g => g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g)
                })),
                
            // Notifications operations
            addNotification: (notif) => 
                set((state) => ({
                    notifications: [
                        { ...notif, id: Math.random().toString(36).substring(7), timestamp: Date.now() },
                        ...state.notifications
                    ]
                })),
            markNotificationRead: (id) =>
                set((state) => ({
                    notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
                })),
            markAllNotificationsRead: () =>
                set((state) => ({
                    notifications: state.notifications.map(n => ({ ...n, read: true }))
                })),
            removeNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.filter(n => n.id !== id)
                })),
            clearAllNotifications: () =>
                set({ notifications: [] })
        }),
        {
            name: 'duo-budget-storage',
            merge: (persistedState: any, currentState) => {
                if (!persistedState) return currentState;
                const merged = { ...currentState, ...persistedState };
                if (persistedState.categories) {
                    merged.categories = persistedState.categories.map((cat: any) => {
                        // Migration for Kids Tuition -> Child Care
                        if (cat.name === 'Kids Tuition') {
                            cat.name = 'Child Care';
                        }
                        
                        const defaultCat = DEFAULT_CATEGORIES.find(d => d.name === cat.name);
                        if (defaultCat?.subCategories && (!cat.subCategories || cat.subCategories.length === 0)) {
                            return { ...cat, subCategories: defaultCat.subCategories };
                        }
                        return cat;
                    });
                }
                
                // Ensure config has all required fields, including activeMonth
                if (!merged.config) {
                    merged.config = currentState.config;
                } else if (!merged.config.activeMonth) {
                    merged.config.activeMonth = new Date().toISOString().slice(0, 7);
                }
                if (!merged.config.lastSeenMonth) {
                    merged.config.lastSeenMonth = merged.config.activeMonth || new Date().toISOString().slice(0, 7);
                }
                if (!merged.config.cardSkin) merged.config.cardSkin = 'default-dark';
                if (!merged.config.cardName) merged.config.cardName = 'BL';
                if (!persistedState.goals) {
                    merged.goals = DEFAULT_GOALS;
                } else {
                    const hasEmergency = persistedState.goals.some((g: any) => g.id === 'goal-1');
                    if (!hasEmergency) {
                        merged.goals = [DEFAULT_GOALS[0], ...persistedState.goals];
                    }
                }
                
                // Recalculate targetAmount for the emergency goal based on the loaded categories
                if (merged.categories && merged.goals) {
                    const monthlyBaseline = merged.categories.reduce((sum: any, cat: any) => sum + (cat.targetAmount || 0), 0);
                    const multiplier = merged.config?.runwayMultiplier || 3;
                    const targetRunway = monthlyBaseline * multiplier;
                    
                    merged.goals = merged.goals.map((g: any) => 
                        g.id === 'goal-1' ? { ...g, targetAmount: targetRunway } : g
                    );
                }
                
                if (!merged.notifications) {
                    merged.notifications = [];
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
