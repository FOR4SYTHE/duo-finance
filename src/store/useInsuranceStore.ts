import { create } from 'zustand';
import { InsurancePolicy } from '@/types/finance';
import { createClient } from '@/utils/supabase/client';
import { useBudgetStore } from '@/store/useBudgetStore';

interface InsuranceState {
    policies: InsurancePolicy[];
    pendingOperationIds: Set<string>;
    _hasHydrated: boolean;
    initialize: () => Promise<void>;
    addPolicy: (policy: Omit<InsurancePolicy, 'id'>) => void;
    updatePolicy: (id: string, updates: Partial<InsurancePolicy>) => void;
    removePolicy: (id: string) => void;
}

export const useInsuranceStore = create<InsuranceState>()(
    (set, get) => ({
        policies: [],
        pendingOperationIds: new Set<string>(),
        _hasHydrated: false,
        
        initialize: async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) return;
            
            const { data: serverPolicies, error } = await supabase
                .from('insurance_policies')
                .select('*')
                .eq('household_id', profile.household_id)
                .order('created_at', { ascending: true });
                
            if (error) {
                console.error("Failed to fetch insurance policies:", error);
                return;
            }
            
            const mappedPolicies: InsurancePolicy[] = (serverPolicies || []).map(row => ({
                id: row.id,
                household_id: row.household_id,
                provider: row.provider_name,
                policyName: row.plan_name || '',
                type: row.plan_type,
                status: row.status,
                policyNumber: row.policy_number || '',
                coveredMembers: row.covered_members || [],
                premium: Number(row.premium_amount),
                paymentFrequency: row.premium_frequency,
                coverage: Number(row.coverage_limit),
                startDate: row.start_date || '',
                expiryDate: row.expiry_date || '',
                dueDate: row.renewal_date || '',
                roomCategory: row.custom_fields?.roomCategory || '',
                outpatientLimit: Number(row.custom_fields?.outpatientLimit || 0),
                deductible: Number(row.custom_fields?.deductible || 0),
                hotline: row.custom_fields?.hotline || '',
                agentName: row.custom_fields?.agentName || '',
                agentNumber: row.custom_fields?.agentNumber || '',
                notes: row.custom_fields?.notes || '',
                updated_at: row.updated_at
            }));
            
            set((state) => {
                const pendingPolicies = state.policies.filter(p => state.pendingOperationIds.has(p.id));
                const serverPoliciesFiltered = mappedPolicies.filter(sp => !state.pendingOperationIds.has(sp.id));
                
                const merged = [...pendingPolicies, ...serverPoliciesFiltered];
                
                return {
                    policies: merged,
                    _hasHydrated: true
                };
            });
        },
        
        addPolicy: async (policy) => {
            const newPolicy: InsurancePolicy = {
                ...policy,
                id: crypto.randomUUID(),
                updated_at: new Date().toISOString()
            };
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(newPolicy.id);
                return { 
                    policies: [...state.policies, newPolicy],
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(newPolicy.id);
                    return { policies: state.policies.filter(p => p.id !== newPolicy.id), pendingOperationIds: newPending };
                });
                return;
            }
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) return;
            
            const { error } = await supabase.from('insurance_policies').insert({
                id: newPolicy.id,
                household_id: profile.household_id,
                provider_name: newPolicy.provider,
                plan_name: newPolicy.policyName,
                plan_type: newPolicy.type,
                status: newPolicy.status,
                policy_number: newPolicy.policyNumber,
                covered_members: newPolicy.coveredMembers,
                premium_amount: newPolicy.premium,
                premium_frequency: newPolicy.paymentFrequency,
                coverage_limit: newPolicy.coverage,
                start_date: newPolicy.startDate || null,
                expiry_date: newPolicy.expiryDate || null,
                renewal_date: newPolicy.dueDate || null,
                custom_fields: {
                    roomCategory: newPolicy.roomCategory,
                    outpatientLimit: newPolicy.outpatientLimit,
                    deductible: newPolicy.deductible,
                    hotline: newPolicy.hotline,
                    agentName: newPolicy.agentName,
                    agentNumber: newPolicy.agentNumber,
                    notes: newPolicy.notes
                }
            });
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(newPolicy.id);
                if (error) {
                    useBudgetStore.getState().addNotification({
                        title: 'Sync Error',
                        message: 'Failed to add insurance policy.',
                        read: false,
                        type: 'alert'
                    });
                    return { policies: state.policies.filter(p => p.id !== newPolicy.id), pendingOperationIds: newPending };
                }
                return { pendingOperationIds: newPending };
            });
        },
        
        updatePolicy: async (id, updates) => {
            const state = get();
            const oldPolicy = state.policies.find(p => p.id === id);
            if (!oldPolicy) return;
            
            const newPolicy = { ...oldPolicy, ...updates, updated_at: new Date().toISOString() };
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(id);
                return {
                    policies: state.policies.map(p => p.id === id ? newPolicy : p),
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            
            // Single-row fetch-before-write concurrency guard
            const { data: serverRow } = await supabase.from('insurance_policies').select('updated_at').eq('id', id).single();
            if (serverRow?.updated_at && oldPolicy.updated_at && serverRow.updated_at !== oldPolicy.updated_at) {
                // Conflict detected
                set((state) => {
                    const newPending = new Set(state.pendingOperationIds);
                    newPending.delete(id);
                    return {
                        policies: state.policies.map(p => p.id === id ? oldPolicy : p),
                        pendingOperationIds: newPending
                    };
                });
                
                useBudgetStore.getState().addNotification({
                    title: 'Sync Conflict',
                    message: 'Your partner updated this policy at the same time. We restored their change.',
                    read: false,
                    type: 'alert'
                });
                
                // Force a sync to get their changes
                get().initialize();
                return;
            }
            
            const { error } = await supabase.from('insurance_policies').update({
                provider_name: newPolicy.provider,
                plan_name: newPolicy.policyName,
                plan_type: newPolicy.type,
                status: newPolicy.status,
                policy_number: newPolicy.policyNumber,
                covered_members: newPolicy.coveredMembers,
                premium_amount: newPolicy.premium,
                premium_frequency: newPolicy.paymentFrequency,
                coverage_limit: newPolicy.coverage,
                start_date: newPolicy.startDate || null,
                expiry_date: newPolicy.expiryDate || null,
                renewal_date: newPolicy.dueDate || null,
                custom_fields: {
                    roomCategory: newPolicy.roomCategory,
                    outpatientLimit: newPolicy.outpatientLimit,
                    deductible: newPolicy.deductible,
                    hotline: newPolicy.hotline,
                    agentName: newPolicy.agentName,
                    agentNumber: newPolicy.agentNumber,
                    notes: newPolicy.notes
                }
            }).eq('id', id);
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(id);
                if (error) {
                    return { policies: state.policies.map(p => p.id === id ? oldPolicy : p), pendingOperationIds: newPending };
                }
                return { pendingOperationIds: newPending };
            });
        },
        
        removePolicy: async (id) => {
            const state = get();
            const oldPolicy = state.policies.find(p => p.id === id);
            if (!oldPolicy) return;
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(id);
                return {
                    policies: state.policies.filter(p => p.id !== id),
                    pendingOperationIds: newPending
                };
            });
            
            const supabase = createClient();
            const { error } = await supabase.from('insurance_policies').delete().eq('id', id);
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(id);
                if (error) {
                    return { policies: [...state.policies, oldPolicy], pendingOperationIds: newPending };
                }
                return { pendingOperationIds: newPending };
            });
        }
    })
);
