import { create } from 'zustand';
import { ExpenseEntry } from '@/types/finance';
import { createClient } from '@/utils/supabase/client';
import { useBudgetStore } from '@/store/useBudgetStore';

interface SpendState {
    entries: ExpenseEntry[];
    pendingOperationIds: Set<string>;
    _hasHydrated: boolean;
    initialize: () => Promise<void>;
    addExpense: (amount: number, currency: 'PHP' | 'ZAR', category?: string, note?: string, tripId?: string, sourceBillId?: string) => void;
    removeExpense: (id: string) => void;
    clearEntries: () => void;
    injectMockEntries: (entries: ExpenseEntry[]) => void;
}

export const useSpendStore = create<SpendState>()(
    (set, get) => ({
        entries: [],
        pendingOperationIds: new Set<string>(),
        _hasHydrated: false,
        
        initialize: async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) return;
            
            const { data: serverEntries, error } = await supabase
                .from('spend_entries')
                .select('*')
                .eq('household_id', profile.household_id)
                .order('timestamp_unix', { ascending: false });
                
            if (error) {
                console.error("Failed to fetch spend entries:", error);
                return;
            }
            
            const mappedEntries: ExpenseEntry[] = (serverEntries || []).map(row => ({
                id: row.id,
                amount: Number(row.amount),
                currency: row.currency as 'PHP' | 'ZAR',
                category: row.category,
                note: row.note,
                trip_id: row.trip_id,
                sourceBillId: row.source_bill_id,
                timestamp: Number(row.timestamp_unix)
            }));
            
            set((state) => {
                // Merge freshly fetched entries with local entries that are still pending
                // This prevents background syncs from accidentally wiping out in-flight optimistic adds/removes
                const pendingEntries = state.entries.filter(e => state.pendingOperationIds.has(e.id));
                const serverEntriesFiltered = mappedEntries.filter(se => !state.pendingOperationIds.has(se.id));
                
                // Keep the list sorted by timestamp descending
                const merged = [...pendingEntries, ...serverEntriesFiltered].sort((a, b) => b.timestamp - a.timestamp);
                
                return {
                    entries: merged,
                    _hasHydrated: true
                };
            });
        },
        
        addExpense: async (amount, currency, category, note, tripId, sourceBillId) => {
            const newEntry: ExpenseEntry = {
                id: crypto.randomUUID(),
                amount,
                currency,
                category,
                note,
                trip_id: tripId,
                sourceBillId: sourceBillId,
                timestamp: Date.now()
            };
            
            // Optimistic update
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(newEntry.id);
                return { 
                    entries: [newEntry, ...state.entries],
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                // Rollback if no session
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(newEntry.id);
                    return {
                        entries: state.entries.filter(e => e.id !== newEntry.id),
                        pendingOperationIds: newPending
                    };
                });
                return;
            }
            
            const { data: profile, error: profileError } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            
            if (profileError || !profile?.household_id) {
                // Rollback if network fails here
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(newEntry.id);
                    return {
                        entries: state.entries.filter(e => e.id !== newEntry.id),
                        pendingOperationIds: newPending
                    };
                });
                
                useBudgetStore.getState().addNotification({
                    title: 'Network Error',
                    message: 'You are offline or the network is unreachable.',
                    read: false,
                    type: 'alert'
                });
                return;
            }
            
            const { error } = await supabase.from('spend_entries').insert({
                id: newEntry.id,
                household_id: profile.household_id,
                created_by: session.user.id,
                amount: newEntry.amount,
                currency: newEntry.currency,
                category: newEntry.category || null,
                note: newEntry.note || null,
                trip_id: newEntry.trip_id || null,
                source_bill_id: newEntry.sourceBillId || null,
                timestamp_unix: newEntry.timestamp
            });
            
            if (error) {
                // Rollback on failure
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(newEntry.id);
                    return {
                        entries: state.entries.filter(e => e.id !== newEntry.id),
                        pendingOperationIds: newPending
                    };
                });
                
                // Show notification error
                useBudgetStore.getState().addNotification({
                    title: 'Failed to add expense',
                    message: 'A network error occurred. Your expense was not saved.',
                    read: false,
                    type: 'alert'
                });
            } else {
                // Success - remove from pending
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(newEntry.id);
                    return { pendingOperationIds: newPending };
                });
            }
        },

        removeExpense: async (id) => {
            const entryToRemove = get().entries.find(e => e.id === id);
            if (!entryToRemove) return;
            
            // Optimistic delete
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(id);
                return {
                    entries: state.entries.filter(e => e.id !== id),
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            const { error } = await supabase.from('spend_entries').delete().eq('id', id);
            
            if (error) {
                // Rollback on failure
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(id);
                    // Re-insert and sort
                    const restoredEntries = [...state.entries, entryToRemove].sort((a, b) => b.timestamp - a.timestamp);
                    return {
                        entries: restoredEntries,
                        pendingOperationIds: newPending
                    };
                });
                
                useBudgetStore.getState().addNotification({
                    title: 'Failed to delete expense',
                    message: 'A network error occurred. The expense could not be removed.',
                    read: false,
                    type: 'alert'
                });
            } else {
                // Success
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(id);
                    return { pendingOperationIds: newPending };
                });
            }
        },

        clearEntries: async () => {
            const oldEntries = get().entries;
            // Optimistic clear
            set({ entries: [] });
            
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                // Rollback if no session
                set({ entries: oldEntries });
                return;
            }
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) {
                set({ entries: oldEntries });
                return;
            }
            
            // Delete all entries for this household
            const { error } = await supabase.from('spend_entries').delete().eq('household_id', profile.household_id);
            
            if (error) {
                // Rollback on failure
                set({ entries: oldEntries });
                
                useBudgetStore.getState().addNotification({
                    title: 'Failed to reset logs',
                    message: 'A network error occurred while trying to clear the ledger.',
                    read: false,
                    type: 'alert'
                });
            }
        },
        
        injectMockEntries: (newEntries) => set((state) => ({
            entries: [...newEntries, ...state.entries].sort((a, b) => b.timestamp - a.timestamp)
        }))
    })
);
