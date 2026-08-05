import { create } from 'zustand';
import { InsurancePolicy, MedicalEvent } from '@/types/finance';
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
    medicalEvents: MedicalEvent[];
    addMedicalEvent: (event: Omit<MedicalEvent, 'id'>) => Promise<void>;
    resolveMedicalClaim: (eventId: string, refundedAmount: number) => Promise<void>;
    resetMedicalEvents: () => Promise<void>;
}

export const useInsuranceStore = create<InsuranceState>()(
    (set, get) => ({
        policies: [],
        medicalEvents: [],
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
            
            const { data: serverEvents, error: eventsError } = await supabase
                .from('medical_events')
                .select('*')
                .eq('household_id', profile.household_id)
                .order('visit_date', { ascending: false });
                
            if (eventsError) {
                console.error("Failed to fetch medical events:", eventsError);
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
                
                const pendingEvents = state.medicalEvents.filter(e => state.pendingOperationIds.has(e.id));
                const mappedEvents: MedicalEvent[] = (serverEvents || []).map(row => ({
                    id: row.id,
                    household_id: row.household_id,
                    visitDate: row.visit_date,
                    providerName: row.provider_name,
                    reason: row.reason || '',
                    totalCost: Number(row.total_cost),
                    policyId: row.policy_id || undefined,
                    coveredAmount: Number(row.covered_amount),
                    uncoveredAmount: Number(row.uncovered_amount),
                    spendEntryId: row.spend_entry_id || undefined,
                    status: row.status as 'Resolved' | 'Pending Claim',
                    created_at: row.created_at
                }));
                const serverEventsFiltered = mappedEvents.filter(se => !state.pendingOperationIds.has(se.id));
                const mergedEvents = [...pendingEvents, ...serverEventsFiltered];
                
                return {
                    policies: merged,
                    medicalEvents: mergedEvents,
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
        },
        
        addMedicalEvent: async (event) => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) return;
            
            const newEvent: MedicalEvent = {
                ...event,
                id: crypto.randomUUID(),
                household_id: profile.household_id,
                created_at: new Date().toISOString()
            };
            
            // Optimistic update
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(newEvent.id);
                return {
                    medicalEvents: [newEvent, ...state.medicalEvents],
                    pendingOperationIds: newPending
                };
            });
            
            let spendEntryId: string | undefined = undefined;
            
            // Cross-module integration: Push uncovered amount to Spend Jar
            if (newEvent.uncoveredAmount > 0) {
                const { data: spendRow, error: spendError } = await supabase.from('spend_entries').insert({
                    household_id: profile.household_id,
                    created_by: session.user.id,
                    amount: newEvent.uncoveredAmount,
                    currency: 'PHP', // Assuming base currency for medical
                    category: 'Health & Medical',
                    note: `Out-of-pocket: ${newEvent.providerName} - ${newEvent.reason || 'Medical Visit'}`,
                    timestamp_unix: Date.now()
                }).select('id').single();
                
                if (!spendError && spendRow) {
                    spendEntryId = spendRow.id;
                    newEvent.spendEntryId = spendEntryId;
                } else {
                    console.error("Failed to inject spend entry:", spendError);
                }
            }
            
            const { error: dbError } = await supabase.from('medical_events').insert({
                id: newEvent.id,
                household_id: profile.household_id,
                visit_date: newEvent.visitDate,
                provider_name: newEvent.providerName,
                reason: newEvent.reason,
                total_cost: newEvent.totalCost,
                policy_id: newEvent.policyId || null,
                covered_amount: newEvent.coveredAmount,
                uncovered_amount: newEvent.uncoveredAmount,
                spend_entry_id: spendEntryId || null,
                status: newEvent.status || 'Resolved'
            });
            
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(newEvent.id);
                if (dbError) {
                    console.error("Failed to add medical event:", dbError);
                    return {
                        medicalEvents: state.medicalEvents.filter(e => e.id !== newEvent.id),
                        pendingOperationIds: newPending
                    };
                }
                return { 
                    medicalEvents: state.medicalEvents.map(e => e.id === newEvent.id ? newEvent : e),
                    pendingOperationIds: newPending 
                };
            });
        },
        
        resolveMedicalClaim: async (eventId: string, refundedAmount: number) => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            
            const event = get().medicalEvents.find(e => e.id === eventId);
            if (!event || event.status === 'Claimed' || event.status === 'Resolved') return;

            const newCovered = Math.min(event.totalCost, event.coveredAmount + refundedAmount);
            const newUncovered = Math.max(0, event.totalCost - newCovered);

            // Optimistic update
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.add(eventId);
                return {
                    medicalEvents: state.medicalEvents.map(e => 
                        e.id === eventId ? { ...e, status: 'Claimed', coveredAmount: newCovered, uncoveredAmount: newUncovered } : e
                    ),
                    pendingOperationIds: newPending
                };
            });

            // If a refund is specified, add it to Spend Jar as negative (income/refund)
            if (refundedAmount > 0 && event.household_id) {
                const { error: spendError } = await supabase.from('spend_entries').insert({
                    household_id: event.household_id,
                    created_by: session.user.id,
                    amount: -refundedAmount, // Negative amount signifies a refund in spend jar
                    currency: 'PHP',
                    category: 'Health & Medical',
                    note: `Claim Refund: ${event.providerName} - ${event.reason || 'Medical Visit'}`,
                    timestamp_unix: new Date().getTime()
                });
                
                if (spendError) {
                    console.error("Failed to inject claim refund into spend jar:", spendError);
                }
            }

            const { error: dbError } = await supabase
                .from('medical_events')
                .update({ 
                    status: 'Claimed',
                    covered_amount: newCovered,
                    uncovered_amount: newUncovered
                })
                .eq('id', eventId);
                
            set((state) => {
                const newPending = new Set(state.pendingOperationIds);
                newPending.delete(eventId);
                
                if (dbError) {
                    console.error("Failed to resolve medical claim:", dbError);
                    // Revert optimistic update
                    return {
                        medicalEvents: state.medicalEvents.map(e => 
                            e.id === eventId ? { ...e, status: 'Pending Claim' } : e
                        ),
                        pendingOperationIds: newPending
                    };
                }
                
                return { pendingOperationIds: newPending };
            });
        },
        
        resetMedicalEvents: async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;
            
            const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
            if (!profile?.household_id) return;

            // Optimistic clear
            const oldEvents = get().medicalEvents;
            set({ medicalEvents: [] });

            const { error } = await supabase.from('medical_events').delete().eq('household_id', profile.household_id);
            
            if (error) {
                console.error("Failed to reset medical events:", error);
                set({ medicalEvents: oldEvents });
            }
        }
    })
);
