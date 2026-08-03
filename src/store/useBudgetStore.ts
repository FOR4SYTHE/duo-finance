import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BudgetConfig, BudgetPeriod, BudgetCategory, AppNotification, ExpenseEntry, Goal } from '@/types/finance';
import { createClient } from '@/utils/supabase/client';

interface BudgetState {
    config: BudgetConfig;
    categories: BudgetCategory[];
    notifications: AppNotification[];
    setBudget: (targetAmount: number, period: BudgetPeriod) => void;
    
    // Config Operations
    setJarPercentage: (pct: number) => void;
    setRunwayMultiplier: (multiplier: number) => void;
    setCardSkin: (skin: string) => void;
    setCardName: (name: string) => void;
    setCustomPhoto: (key: string, dataUrl: string) => void;
    setCustomPhotoPosition: (key: string, position: { x: number; y: number }) => void;
    removeCustomPhoto: (key: string) => void;
    setActiveMonth: (month: string) => void;
    setLastSeenMonth: (month: string) => void;
    addCategory: (category: Omit<BudgetCategory, 'id'>) => void;
    updateCategory: (id: string, updates: Partial<BudgetCategory>) => void;
    updateCategoriesTarget: (updates: { id: string, targetAmount: number }[]) => void;
    removeCategory: (id: string) => void;
    syncSnapshots: (entries: ExpenseEntry[], currentMonth: string) => void;
    reset: () => void;
    
    // Sub-category operations
    updateSubCategory: (categoryId: string, subId: string, amount: number) => void;
    addSubCategory: (categoryId: string, name: string) => void;
    removeSubCategory: (categoryId: string, subId: string) => void;

    // Notifications Operations
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp'>) => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    removeNotification: (id: string) => void;
    clearAllNotifications: () => void;

    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    lastSyncedAt: number;
    initialize: () => Promise<void>;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
    { id: '1', name: 'Rent', icon: 'Home', color: '#30D158', targetAmount: 0, isFixedObligation: true },
    { id: '2', name: 'Groceries', icon: 'ShoppingBag', color: '#E8A33D', targetAmount: 0, isFixedObligation: false },
    { 
        id: '3', name: 'Utilities', icon: 'Zap', color: '#0A84FF', targetAmount: 0, isFixedObligation: false,
        subCategories: [
            { id: 'util-1', name: 'Electricity', amount: 0 },
            { id: 'util-2', name: 'Water', amount: 0 },
            { id: 'util-3', name: 'Internet', amount: 0 },
            { id: 'util-4', name: 'Mobile/Postpaid plans', amount: 0 },
        ]
    },
    { 
        id: '4', name: 'Bills', icon: 'CreditCard', color: '#FF453A', targetAmount: 0, isFixedObligation: true,
        subCategories: [
            { id: 'bill-1', name: 'Credit card', amount: 0 },
            { id: 'bill-2', name: 'Subscriptions', amount: 0 },
            { id: 'bill-3', name: 'Shopee/Lazada', amount: 0 },
            { id: 'bill-4', name: 'Parcel', amount: 0 },
            { id: 'bill-5', name: 'Gym', amount: 0 },
        ]
    },
    { 
        id: '5', name: 'Child Care', icon: 'GraduationCap', color: '#BF5AF2', targetAmount: 0, isFixedObligation: false,
        subCategories: [
            { id: 'child-1', name: 'School Supplies', amount: 0 },
            { id: 'child-2', name: 'Uniforms', amount: 0 },
            { id: 'child-3', name: 'Field Trips/Activities', amount: 0 },
            { id: 'child-4', name: 'Extracurricular', amount: 0 },
        ]
    },
    { id: '6', name: 'Health & Medical', icon: 'Activity', color: '#FF2D55', targetAmount: 0, isFixedObligation: false },
    { id: '7', name: 'Transportation', icon: 'Car', color: '#5E5CE6', targetAmount: 0, isFixedObligation: false },
    { id: '8', name: 'Insurance', icon: 'Shield', color: '#FF9F0A', targetAmount: 0, isFixedObligation: true },
    { id: '9', name: 'Entertainment', icon: 'Film', color: '#FF375F', targetAmount: 0, isFixedObligation: false },
    { id: '10', name: 'Savings', icon: 'PiggyBank', color: '#30D158', targetAmount: 0, isFixedObligation: true },
];

export const useBudgetStore = create<BudgetState>()(
    persist(
        (set, get) => ({
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
            lastSyncedAt: 0,
            initialize: async () => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;
                
                const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
                if (profile?.household_id) {
                    const { data: budget } = await supabase.from('budgets').select('*').eq('household_id', profile.household_id).single();
                    if (budget) {
                        const hasServerConfig = Object.keys(budget.config || {}).length > 0;
                        const hasServerCategories = Array.isArray(budget.categories) && budget.categories.length > 0;

                        set({
                            config: (hasServerConfig ? budget.config : { ...get().config }) as BudgetConfig,
                            categories: (hasServerCategories ? budget.categories : [...get().categories]) as BudgetCategory[],
                            lastSyncedAt: budget.updated_at ? new Date(budget.updated_at).getTime() : Date.now(),
                        });
                    }
                }
            },
            config: {
                targetAmount: 0,
                period: 'monthly',
                jarAllowedPercentage: 0,
                runwayMultiplier: 3,
                cardSkin: 'default-dark',
                cardName: 'BL',
                customPhotos: {},
                customPhotoPositions: {},
                activeMonth: new Date().toISOString().slice(0, 7),
                lastSeenMonth: new Date().toISOString().slice(0, 7)
            },
            categories: DEFAULT_CATEGORIES,
            notifications: [],
            setBudget: (targetAmount: number, period: BudgetPeriod) => 
                set((state) => {
                    const activeMonth = state.config.activeMonth || new Date().toISOString().slice(0, 7);
                    return {
                        config: {
                            ...state.config,
                            targetAmount,
                            period,
                            targetHistory: {
                                ...(state.config.targetHistory || {}),
                                [activeMonth]: targetAmount
                            }
                        }
                    };
                }),
            syncSnapshots: (entries, currentMonth) => 
                set((state) => {
                    const newCategories = state.categories.map(cat => {
                        const newSpendHistory = { ...(cat.spendHistory || {}) };
                        let hasChanges = false;
                        
                        const catEntries = entries.filter(e => e.category === cat.name);
                        const monthlySums: Record<string, number> = {};
                        
                        catEntries.forEach(entry => {
                            const date = new Date(entry.timestamp);
                            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                            if (monthKey < currentMonth) {
                                monthlySums[monthKey] = (monthlySums[monthKey] || 0) + entry.amount;
                            }
                        });
                        
                        if (cat.targetHistory) {
                            Object.keys(cat.targetHistory).forEach(m => {
                                if (m < currentMonth && monthlySums[m] === undefined) {
                                    monthlySums[m] = 0;
                                }
                            });
                        }

                        const newTargetHistory = { ...(cat.targetHistory || {}) };
                        Object.entries(monthlySums).forEach(([m, sum]) => {
                            if (newSpendHistory[m] === undefined) {
                                newSpendHistory[m] = sum;
                                if (newTargetHistory[m] === undefined) {
                                    newTargetHistory[m] = cat.targetAmount;
                                }
                                hasChanges = true;
                            }
                        });

                        if (hasChanges) {
                            return { ...cat, spendHistory: newSpendHistory, targetHistory: newTargetHistory };
                        }
                        return cat;
                    });
                    
                    const changed = newCategories.some((c, i) => c !== state.categories[i]);
                    return changed ? { categories: newCategories } : {};
                }),
            setJarPercentage: (percentage: number) => 
                set((state) => ({ config: { ...state.config, jarAllowedPercentage: percentage } })),
            setRunwayMultiplier: (multiplier: number) =>
                set((state) => ({ config: { ...state.config, runwayMultiplier: multiplier } })),
            setCardSkin: (skin: string) =>
                set((state) => ({ config: { ...state.config, cardSkin: skin } })),
            setCardName: (name: string) =>
                set((state) => ({ config: { ...state.config, cardName: name } })),
            setCustomPhoto: (key: string, dataUrl: string) =>
                set((state) => ({ 
                    config: { 
                        ...state.config, 
                        customPhotos: { ...state.config.customPhotos, [key]: dataUrl },
                        customPhotoPositions: { ...state.config.customPhotoPositions, [key]: { x: 50, y: 50 } }
                    } 
                })),
            setCustomPhotoPosition: (key: string, position: { x: number; y: number }) =>
                set((state) => ({
                    config: {
                        ...state.config,
                        customPhotoPositions: { ...state.config.customPhotoPositions, [key]: position }
                    }
                })),
            removeCustomPhoto: (key: string) =>
                set((state) => {
                    const newPhotos = { ...state.config.customPhotos };
                    const newPositions = { ...state.config.customPhotoPositions };
                    delete newPhotos[key];
                    delete newPositions[key];
                    return { config: { ...state.config, customPhotos: newPhotos, customPhotoPositions: newPositions } };
                }),
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
                    const activeMonth = state.config.activeMonth || new Date().toISOString().slice(0, 7);
                    const newCats = state.categories.map(c => {
                        if (c.id !== id) return c;
                        const newCat = { ...c, ...updates };
                        if (updates.targetAmount !== undefined) {
                            newCat.targetHistory = {
                                ...(c.targetHistory || {}),
                                [activeMonth]: updates.targetAmount
                            };
                        }
                        return newCat;
                    });
                    return { categories: newCats };
                }),
            updateCategoriesTarget: (updates) =>
                set((state) => {
                    const activeMonth = state.config.activeMonth || new Date().toISOString().slice(0, 7);
                    const newCats = state.categories.map(c => {
                        const match = updates.find(u => u.id === c.id);
                        if (match) {
                            return { 
                                ...c, 
                                targetAmount: match.targetAmount,
                                targetHistory: {
                                    ...(c.targetHistory || {}),
                                    [activeMonth]: match.targetAmount
                                }
                            };
                        }
                        return c;
                    });
                    return { categories: newCats };
                }),
            removeCategory: (id) => 
                set((state) => ({ categories: state.categories.filter(c => c.id !== id) })),

            // Sub-category operations
            updateSubCategory: (categoryId, subId, amount) => 
                set((state) => {
                    const newCats = state.categories.map(c => {
                        if (c.id !== categoryId || !c.subCategories) return c;
                        const newSub = c.subCategories.map(s => s.id === subId ? { ...s, amount } : s);
                        const newTargetAmount = newSub.reduce((acc, curr) => acc + curr.amount, 0);
                        return { ...c, subCategories: newSub, targetAmount: newTargetAmount };
                    });
                    return { categories: newCats };
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
                    return { categories: newCats };
                }),

            reset: () =>
                set(() => ({
                    config: { targetAmount: 0, period: 'monthly', jarAllowedPercentage: 20 },
                    categories: DEFAULT_CATEGORIES,
                    notifications: [],
                    _hasHydrated: true
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
            name: 'duo-budget-storage-v2',
            merge: (persistedState: any, currentState) => {
                if (!persistedState) return currentState;
                const merged = { ...currentState, ...persistedState };
                if (persistedState.categories) {
                    merged.categories = persistedState.categories.map((cat: any) => {
                        if (cat.name === 'Kids Tuition') {
                            cat.name = 'Child Care';
                        }
                        const defaultCat = DEFAULT_CATEGORIES.find(d => d.name === cat.name);
                        if (defaultCat?.subCategories && (!cat.subCategories || cat.subCategories.length === 0)) {
                            return { ...cat, subCategories: defaultCat.subCategories };
                        }
                        return cat;
                    });
                    
                    // Add any newly introduced default categories that the user doesn't have yet
                    const persistedNames = new Set(merged.categories.map((c: any) => c.name));
                    DEFAULT_CATEGORIES.forEach(defaultCat => {
                        if (!persistedNames.has(defaultCat.name)) {
                            merged.categories.push({ ...defaultCat });
                        }
                    });
                }
                if (!merged.config) {
                    merged.config = currentState.config;
                }
                if (!merged.config.activeMonth) {
                    merged.config.activeMonth = new Date().toISOString().slice(0, 7);
                }
                if (!merged.config.lastSeenMonth) {
                    merged.config.lastSeenMonth = merged.config.activeMonth || new Date().toISOString().slice(0, 7);
                }
                if (!merged.config.customPhotos) merged.config.customPhotos = {};
                if (!merged.config.customPhotoPositions) merged.config.customPhotoPositions = {};
                if (!merged.config.cardSkin) merged.config.cardSkin = 'default-dark';
                if (!merged.config.cardName) merged.config.cardName = 'BL';
                if (!merged.notifications) {
                    merged.notifications = [];
                }
                delete merged.goals;
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
