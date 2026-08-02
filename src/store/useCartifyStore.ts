import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartifyItem } from '@/types/finance';
import { useSpendStore } from '@/store/useSpendStore';
import { useHouseholdStore } from '@/store/useHouseholdStore';
import { createClient } from '@/utils/supabase/client';
import { useBudgetStore } from '@/store/useBudgetStore';

export type CartifyMode = 'simple' | 'planned';

export interface SavedTrip {
    id: string;
    date: string; // ISO string or Supabase created_at
    budget: number;
    mode: CartifyMode;
    items: CartifyItem[];
    scheduledTripId?: string;
}

export interface CartifyTemplate {
    id: string;
    name: string;
    items: CartifyItem[]; // stored as jsonb
}

interface CartifyState {
    // Local Active Trip State
    isActive: boolean;
    isBuildingList: boolean;
    mode: CartifyMode;
    budget: number; // in PHP
    items: CartifyItem[];
    activeCategory: string | null;
    isReceiptView: boolean;
    scheduledTripId?: string;
    
    // Supabase Shared State
    savedTrips: SavedTrip[];
    templates: CartifyTemplate[];
    
    // Actions
    initializeCartify: () => Promise<void>;
    startTrip: (budget: number, mode: CartifyMode) => void;
    finishBuildingList: () => void;
    resumeBuildingList: () => void;
    
    saveForLater: (scheduledTripId?: string) => Promise<void>;
    resumeTrip: () => void; // Resumes the single active trip locally
    resumeSpecificTrip: (id: string) => Promise<void>;
    deleteSavedTrip: (id: string) => Promise<void>;
    endTrip: () => void;
    
    // Templates
    saveTemplate: (name: string) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    loadTemplate: (templateId: string) => void;

    showReceipt: () => void;
    hideReceipt: () => void;
    setActiveCategory: (category: string | null) => void;
    setMode: (mode: CartifyMode) => void;
    
    // Item Actions
    addPlannedItem: (name: string, category?: string) => void;
    addItem: (name: string, category: string | undefined, price: number, quantity?: number) => void;
    updateItemPrice: (id: string, price: number) => void;
    toggleItemVatable: (id: string) => void;
    incrementQuantity: (id: string) => void;
    decrementQuantity: (id: string) => void;
    removeItem: (id: string) => void;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15);
};

export const useCartifyStore = create<CartifyState>()(
    persist(
        (set, get) => ({
            isActive: false,
            isBuildingList: false,
            mode: 'simple',
            budget: 0,
            items: [],
            activeCategory: null,
            isReceiptView: false,
            savedTrips: [],
            templates: [],

            initializeCartify: async () => {
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;
                
                const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
                if (!profile?.household_id) return;

                // Fetch Saved Trips
                const { data: savedData } = await supabase.from('cartify_saved_trips')
                    .select('*')
                    .eq('household_id', profile.household_id)
                    .order('created_at', { ascending: false });

                // Fetch Templates
                const { data: templateData } = await supabase.from('cartify_templates')
                    .select('*')
                    .eq('household_id', profile.household_id)
                    .order('created_at', { ascending: false });

                if (savedData) {
                    set({ 
                        savedTrips: savedData.map(row => ({
                            id: row.id,
                            date: row.created_at,
                            budget: Number(row.budget),
                            mode: row.mode as CartifyMode,
                            items: row.items as CartifyItem[],
                            scheduledTripId: row.scheduled_trip_id
                        }))
                    });
                }
                
                if (templateData) {
                    set({
                        templates: templateData.map(row => ({
                            id: row.id,
                            name: row.name,
                            items: row.items as CartifyItem[]
                        }))
                    });
                }
            },

            startTrip: (budget, mode) => set({ 
                isActive: true, 
                isBuildingList: mode === 'planned',
                budget, 
                mode, 
                items: [], 
                activeCategory: null,
                scheduledTripId: undefined
            }),

            finishBuildingList: () => set({ isBuildingList: false }),
            resumeBuildingList: () => set({ isBuildingList: true }),
            
            saveForLater: async (scheduledTripId?: string) => {
                const state = get();
                if (state.budget <= 0 && state.items.length === 0) {
                    set({ isActive: false });
                    return;
                }

                const currentBudget = state.budget;
                const currentMode = state.mode;
                const currentItems = state.items;
                const currentScheduledTripId = scheduledTripId || state.scheduledTripId;
                
                const previousSavedTrips = state.savedTrips;
                const previousActiveState = {
                    isActive: state.isActive,
                    isBuildingList: state.isBuildingList,
                    budget: state.budget,
                    mode: state.mode,
                    items: state.items,
                    activeCategory: state.activeCategory,
                    isReceiptView: state.isReceiptView,
                    scheduledTripId: state.scheduledTripId
                };

                // Optimistic UI for saving
                const optimisticId = `cartify-temp-${Date.now()}`;
                const newSavedTrip: SavedTrip = {
                    id: optimisticId,
                    date: new Date().toISOString(),
                    budget: currentBudget,
                    mode: currentMode,
                    items: currentItems,
                    scheduledTripId: currentScheduledTripId
                };
                
                set({ 
                    savedTrips: [newSavedTrip, ...state.savedTrips],
                    isActive: false,
                    isBuildingList: false,
                    budget: 0,
                    mode: 'simple',
                    items: [],
                    activeCategory: null,
                    isReceiptView: false,
                    scheduledTripId: undefined
                });

                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.user) {
                    set({ savedTrips: previousSavedTrips, ...previousActiveState });
                    useBudgetStore.getState().addNotification({
                        title: 'Network Error',
                        message: 'You are offline. Cannot save trip to household.',
                        read: false,
                        type: 'alert'
                    });
                    return;
                }

                const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
                if (!profile?.household_id) {
                    set({ savedTrips: previousSavedTrips, ...previousActiveState });
                    return;
                }

                const payload = {
                    household_id: profile.household_id,
                    created_by: session.user.id,
                    budget: currentBudget,
                    mode: currentMode,
                    items: currentItems,
                    scheduled_trip_id: currentScheduledTripId || null
                };

                const { data: insertedData, error } = await supabase.from('cartify_saved_trips').insert(payload).select().single();

                if (error) {
                    // Rollback active state
                    set({ 
                        savedTrips: previousSavedTrips,
                        ...previousActiveState
                    });
                    useBudgetStore.getState().addNotification({
                        title: 'Save Failed',
                        message: 'A network error occurred while saving the trip.',
                        read: false,
                        type: 'alert'
                    });
                } else if (insertedData) {
                    // Replace temp ID with real DB ID
                    set((s) => ({
                        savedTrips: s.savedTrips.map(t => t.id === optimisticId ? { ...t, id: insertedData.id, date: insertedData.created_at } : t)
                    }));
                }
            },
            
            resumeTrip: () => set({ isActive: true }),
            
            resumeSpecificTrip: async (id) => {
                const state = get();
                const tripToResume = state.savedTrips.find(t => t.id === id);
                if (!tripToResume) return;

                const supabase = createClient();
                
                // Atomic Claim: Delete the row and return it. 
                // If it returns no rows, someone else already claimed/deleted it.
                const { data, error } = await supabase
                    .from('cartify_saved_trips')
                    .delete()
                    .eq('id', id)
                    .select()
                    .single();

                if (error || !data) {
                    // It was already resumed by another device!
                    // Remove from our local list and alert the user.
                    set((s) => ({
                        savedTrips: s.savedTrips.filter(t => t.id !== id)
                    }));
                    
                    useBudgetStore.getState().addNotification({
                        title: 'Trip Already Claimed',
                        message: 'This trip was just resumed by another device in your household.',
                        read: false,
                        type: 'alert'
                    });
                    return;
                }

                // Claim successful! Activate it locally.
                set({
                    isActive: true,
                    isBuildingList: false, // We resume directly into shopping
                    budget: Number(data.budget),
                    mode: data.mode as CartifyMode,
                    items: data.items as CartifyItem[],
                    scheduledTripId: data.scheduled_trip_id,
                    savedTrips: state.savedTrips.filter(t => t.id !== id)
                });
            },
            
            deleteSavedTrip: async (id) => {
                const state = get();
                const tripToDelete = state.savedTrips.find(t => t.id === id);
                if (tripToDelete?.scheduledTripId) {
                    useHouseholdStore.getState().deleteScheduledTrip(tripToDelete.scheduledTripId);
                }
                
                const previousSavedTrips = state.savedTrips;
                
                // Optimistic UI
                set((state) => ({
                    savedTrips: state.savedTrips.filter(t => t.id !== id)
                }));

                const supabase = createClient();
                const { error } = await supabase.from('cartify_saved_trips').delete().eq('id', id);
                
                if (error) {
                    // Rollback
                    set({ savedTrips: previousSavedTrips });
                    useBudgetStore.getState().addNotification({
                        title: 'Delete Failed',
                        message: 'Could not delete the saved trip due to a network error.',
                        read: false,
                        type: 'alert'
                    });
                }
            },

            endTrip: () => {
                const state = get();
                const purchasedItems = state.items.filter(i => i.status === 'in-cart');

                if (purchasedItems.length > 0) {
                    const spendStore = useSpendStore.getState();
                    const tripId = `trip-${Date.now()}`;
                    
                    // Group items by category (defaulting to 'Groceries' if uncategorized)
                    const byCategory = purchasedItems.reduce((acc, item) => {
                        const cat = item.category || 'Groceries';
                        acc[cat] = (acc[cat] || 0) + item.amount;
                        return acc;
                    }, {} as Record<string, number>);

                    // Dispatch an expense for each category group
                    Object.entries(byCategory).forEach(([category, amount]) => {
                        if (amount > 0) {
                            spendStore.addExpense(amount, 'PHP', category, 'Cartify trip', tripId);
                        }
                    });
                }

                if (state.scheduledTripId) {
                    useHouseholdStore.getState().deleteScheduledTrip(state.scheduledTripId);
                }

                set({ 
                    isActive: false, 
                    isBuildingList: false,
                    budget: 0, 
                    mode: 'simple', 
                    items: [], 
                    activeCategory: null,
                    isReceiptView: false,
                    scheduledTripId: undefined
                });
            },
            
            saveTemplate: async (name: string) => {
                const state = get();
                if (state.items.length === 0) return;
                
                const supabase = createClient();
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;
                
                const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
                if (!profile?.household_id) return;
                
                // Strip prices and reset status to 'still-need' for the template
                const templateItems = state.items.map(item => ({
                    ...item,
                    unitPrice: 0,
                    amount: 0,
                    quantity: 0,
                    status: 'still-need' as const
                }));

                const payload = {
                    household_id: profile.household_id,
                    created_by: session.user.id,
                    name,
                    items: templateItems
                };

                const optimisticId = `template-temp-${Date.now()}`;
                const newTemplate: CartifyTemplate = { id: optimisticId, name, items: templateItems };
                
                const previousTemplates = state.templates;
                
                // Optimistic update
                set({ templates: [newTemplate, ...state.templates] });
                
                const { data: insertedData, error } = await supabase.from('cartify_templates').insert(payload).select().single();
                
                if (error) {
                    set({ templates: previousTemplates });
                    useBudgetStore.getState().addNotification({
                        title: 'Template Save Failed',
                        message: 'Could not save the template due to a network error.',
                        read: false,
                        type: 'alert'
                    });
                } else if (insertedData) {
                    set((s) => ({
                        templates: s.templates.map(t => t.id === optimisticId ? { ...t, id: insertedData.id } : t)
                    }));
                }
            },
            
            deleteTemplate: async (id: string) => {
                const previousTemplates = get().templates;
                
                // Optimistic delete
                set((state) => ({ templates: state.templates.filter(t => t.id !== id) }));
                
                const supabase = createClient();
                const { error } = await supabase.from('cartify_templates').delete().eq('id', id);
                
                if (error) {
                    set({ templates: previousTemplates });
                    useBudgetStore.getState().addNotification({
                        title: 'Delete Failed',
                        message: 'Could not delete the template.',
                        read: false,
                        type: 'alert'
                    });
                }
            },
            
            loadTemplate: (templateId: string) => {
                const template = get().templates.find(t => t.id === templateId);
                if (template) {
                    // Append template items to current trip, giving them fresh IDs
                    const newItems = template.items.map(item => ({
                        ...item,
                        id: generateId(),
                        timestamp: Date.now()
                    }));
                    set((state) => ({ items: [...state.items, ...newItems] }));
                }
            },

            showReceipt: () => set({ isReceiptView: true }),
            hideReceipt: () => set({ isReceiptView: false }),

            setActiveCategory: (category) => set({ activeCategory: category }),
            
            setMode: (mode) => set({ 
                mode,
                isBuildingList: mode === 'planned' ? true : false
            }),

            addPlannedItem: (name, category) => {
                const isVatable = !category?.match(/produce|meat|fish|rice/i);
                const newItem: CartifyItem = {
                    id: generateId(),
                    name,
                    category,
                    unitPrice: 0,
                    quantity: 0,
                    amount: 0,
                    currency: 'PHP',
                    status: 'still-need',
                    isVatable,
                    timestamp: Date.now()
                };
                set({ items: [...get().items, newItem] });
            },

            addItem: (name, category, price, quantity = 1) => {
                const isVatable = !category?.match(/produce|meat|fish|rice/i);
                const newItem: CartifyItem = {
                    id: generateId(),
                    name,
                    category,
                    unitPrice: price,
                    quantity,
                    amount: price * quantity,
                    currency: 'PHP',
                    status: 'in-cart',
                    isVatable,
                    timestamp: Date.now()
                };
                set({ items: [...get().items, newItem] });
            },

            updateItemPrice: (id, price) => {
                set((state) => ({
                    items: state.items.map(item => {
                        if (item.id === id) {
                            const newQuantity = item.quantity === 0 ? 1 : item.quantity;
                            return {
                                ...item,
                                unitPrice: price,
                                quantity: newQuantity,
                                amount: price * newQuantity,
                                status: 'in-cart'
                            };
                        }
                        return item;
                    })
                }));
            },

            toggleItemVatable: (id) => {
                set((state) => ({
                    items: state.items.map(item => 
                        item.id === id ? { ...item, isVatable: !item.isVatable } : item
                    )
                }));
            },

            incrementQuantity: (id) => {
                set((state) => ({
                    items: state.items.map(item => {
                        if (item.id === id) {
                            const newQty = item.quantity + 1;
                            return { ...item, quantity: newQty, amount: item.unitPrice * newQty };
                        }
                        return item;
                    })
                }));
            },

            decrementQuantity: (id) => {
                set((state) => ({
                    items: state.items.map(item => {
                        if (item.id === id) {
                            const newQty = Math.max(0, item.quantity - 1);
                            return { 
                                ...item, 
                                quantity: newQty, 
                                amount: item.unitPrice * newQty,
                                status: newQty === 0 ? 'still-need' : 'in-cart' 
                            };
                        }
                        return item;
                    })
                }));
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter(item => item.id !== id)
                }));
            }
        }),
        {
            name: 'cartify-storage',
            // Only persist active trip state, NOT savedTrips or templates (those come from DB on init)
            partialize: (state) => ({
                isActive: state.isActive,
                isBuildingList: state.isBuildingList,
                mode: state.mode,
                budget: state.budget,
                items: state.items,
                activeCategory: state.activeCategory,
                isReceiptView: state.isReceiptView,
                scheduledTripId: state.scheduledTripId
            })
        }
    )
);
