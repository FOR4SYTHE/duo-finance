import { create } from 'zustand';
import { Goal } from '@/types/finance';
import { createClient } from '@/utils/supabase/client';
import { useBudgetStore } from '@/store/useBudgetStore';

interface GoalsState {
    goals: Goal[];
    pendingOperationIds: Set<string>;
    _hasHydrated: boolean;
    initialize: () => Promise<void>;
    addGoal: (goal: Omit<Goal, 'id'>) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    removeGoal: (id: string) => void;
    addMoneyToGoal: (id: string, amount: number) => void;
}

export const useGoalsStore = create<GoalsState>()(
    (set, get) => ({
        goals: [],
        pendingOperationIds: new Set<string>(),
        _hasHydrated: false,
        
        initialize: async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) return;
            
            const { data: serverGoals, error } = await supabase
                .from('goals')
                .select('*')
                .eq('household_id', profile.household_id)
                .order('created_at', { ascending: true });
                
            if (error) {
                console.error("Failed to fetch goals:", error);
                return;
            }
            
            const mappedGoals: Goal[] = (serverGoals || []).map(row => ({
                id: row.id,
                name: row.name,
                icon: row.icon,
                targetAmount: Number(row.target_amount),
                targetDate: row.target_date,
                savedAmount: Number(row.saved_amount),
                is_emergency_fund: row.is_emergency_fund,
                updated_at: row.updated_at
            }));
            
            set((state) => {
                const pendingGoals = state.goals.filter(g => state.pendingOperationIds.has(g.id));
                const serverGoalsFiltered = mappedGoals.filter(sg => !state.pendingOperationIds.has(sg.id));
                
                // Emergency Fund (goal-1) should always be first
                const merged = [...pendingGoals, ...serverGoalsFiltered].sort((a, b) => {
                    if (a.id === 'goal-1') return -1;
                    if (b.id === 'goal-1') return 1;
                    return 0;
                });
                
                return {
                    goals: merged,
                    _hasHydrated: true
                };
            });
        },
        
        addGoal: async (goal) => {
            const newGoal: Goal = {
                ...goal,
                id: Math.random().toString(36).substring(7),
                savedAmount: 0,
                is_emergency_fund: false,
                updated_at: new Date().toISOString()
            };
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(newGoal.id);
                return { 
                    goals: [...state.goals, newGoal],
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(newGoal.id);
                    return { goals: state.goals.filter(g => g.id !== newGoal.id), pendingOperationIds: newPending };
                });
                return;
            }
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) return;
            
            const { error } = await supabase.from('goals').insert({
                id: newGoal.id,
                household_id: profile.household_id,
                created_by: session.user.id,
                name: newGoal.name,
                icon: newGoal.icon,
                target_amount: newGoal.targetAmount,
                target_date: newGoal.targetDate || null,
                saved_amount: newGoal.savedAmount,
                is_emergency_fund: newGoal.is_emergency_fund,
                updated_at: newGoal.updated_at
            });
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(newGoal.id);
                if (error) {
                    useBudgetStore.getState().addNotification({
                        title: 'Sync Error',
                        message: 'Failed to add goal.',
                        read: false,
                        type: 'alert'
                    });
                    return { goals: state.goals.filter(g => g.id !== newGoal.id), pendingOperationIds: newPending };
                }
                return { pendingOperationIds: newPending };
            });
        },
        
        updateGoal: async (id, updates) => {
            const state = get();
            const oldGoal = state.goals.find(g => g.id === id);
            if (!oldGoal) return;
            
            const newGoal = { ...oldGoal, ...updates, updated_at: new Date().toISOString() };
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(id);
                return {
                    goals: state.goals.map(g => g.id === id ? newGoal : g),
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            
            // Single-row fetch-before-write concurrency guard
            const { data: serverRow } = await supabase.from('goals').select('updated_at').eq('id', id).single();
            if (serverRow?.updated_at && oldGoal.updated_at && serverRow.updated_at !== oldGoal.updated_at) {
                // Conflict detected
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(id);
                    return {
                        goals: state.goals.map(g => g.id === id ? oldGoal : g),
                        pendingOperationIds: newPending
                    };
                });
                
                useBudgetStore.getState().addNotification({
                    title: 'Sync Conflict',
                    message: 'Your partner updated this goal at the same time. We restored their change.',
                    read: false,
                    type: 'alert'
                });
                
                // Force a sync to get their changes
                get().initialize();
                return;
            }
            
            const { error } = await supabase.from('goals').update({
                name: newGoal.name,
                icon: newGoal.icon,
                target_amount: newGoal.targetAmount,
                target_date: newGoal.targetDate || null,
                updated_at: newGoal.updated_at
            }).eq('id', id);
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(id);
                if (error) {
                    return { goals: state.goals.map(g => g.id === id ? oldGoal : g), pendingOperationIds: newPending };
                }
                return { pendingOperationIds: newPending };
            });
        },
        
        removeGoal: async (id) => {
            if (id === 'goal-1') return; // Protect Emergency Fund
            
            const state = get();
            const oldGoal = state.goals.find(g => g.id === id);
            if (!oldGoal) return;
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(id);
                return {
                    goals: state.goals.filter(g => g.id !== id),
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            const { error } = await supabase.from('goals').delete().eq('id', id);
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(id);
                if (error) {
                    return { goals: [...state.goals, oldGoal], pendingOperationIds: newPending };
                }
                return { pendingOperationIds: newPending };
            });
        },
        
        addMoneyToGoal: async (id, amount) => {
            const state = get();
            const oldGoal = state.goals.find(g => g.id === id);
            if (!oldGoal) return;
            
            const newGoal = { ...oldGoal, savedAmount: oldGoal.savedAmount + amount, updated_at: new Date().toISOString() };
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(id);
                return {
                    goals: state.goals.map(g => g.id === id ? newGoal : g),
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            
            // Single-row fetch-before-write concurrency guard
            const { data: serverRow } = await supabase.from('goals').select('updated_at, saved_amount').eq('id', id).single();
            if (serverRow?.updated_at && oldGoal.updated_at && serverRow.updated_at !== oldGoal.updated_at) {
                // Conflict detected
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(id);
                    return {
                        goals: state.goals.map(g => g.id === id ? oldGoal : g),
                        pendingOperationIds: newPending
                    };
                });
                
                useBudgetStore.getState().addNotification({
                    title: 'Sync Conflict',
                    message: 'Your partner logged savings at the same time. Your entry was not saved to avoid double-charging.',
                    read: false,
                    type: 'alert'
                });
                
                // Force a sync to get their changes
                get().initialize();
                return;
            }
            
            // If no conflict, we use our calculated amount (which is safe because we checked updated_at)
            const { error } = await supabase.from('goals').update({
                saved_amount: newGoal.savedAmount,
                updated_at: newGoal.updated_at
            }).eq('id', id);
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(id);
                if (error) {
                    return { goals: state.goals.map(g => g.id === id ? oldGoal : g), pendingOperationIds: newPending };
                }
                return { pendingOperationIds: newPending };
            });
        }
    })
);
