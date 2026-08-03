import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  currency: 'PHP' | 'ZAR';
  dueDay: number; // 1-31
  dueMonth?: number; // 0-11
  dueYear?: number;
  category: string;
  budgetCategoryId?: string; // Links this bill explicitly to a budget category
  isRecurring: boolean;
  reminderEnabled: boolean;
  isPaid: boolean;
  icon?: string;
  color?: string;
}

interface BillsState {
  bills: Bill[];
  pendingOperationIds: Set<string>;
  _hasHydrated: boolean;
  initialize: () => Promise<void>;
  addBill: (bill: Omit<Bill, 'id'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  removeBill: (id: string) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
}

export const useBillsStore = create<BillsState>()(
  (set, get) => ({
    bills: [],
    pendingOperationIds: new Set<string>(),
    _hasHydrated: false,

    initialize: async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
      if (!profile?.household_id) return;

      const { data: serverBills, error } = await supabase
        .from('bills')
        .select('*')
        .eq('household_id', profile.household_id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Failed to fetch bills:", error);
        return;
      }

      const mappedBills: Bill[] = (serverBills || []).map(row => ({
        id: row.id,
        name: row.name,
        amount: Number(row.amount),
        currency: row.currency as 'PHP' | 'ZAR',
        dueDay: row.due_day,
        dueMonth: row.due_month !== null ? row.due_month : undefined,
        dueYear: row.due_year !== null ? row.due_year : undefined,
        category: row.category,
        budgetCategoryId: row.budget_category_id || undefined,
        isRecurring: row.is_recurring,
        reminderEnabled: row.reminder_enabled,
        isPaid: row.is_paid,
        icon: row.icon || undefined,
        color: row.color || undefined
      }));

      set((state) => {
        const pendingBills = state.bills.filter(b => state.pendingOperationIds.has(b.id));
        const serverBillsFiltered = mappedBills.filter(sb => !state.pendingOperationIds.has(sb.id));
        
        return {
          bills: [...pendingBills, ...serverBillsFiltered],
          _hasHydrated: true
        };
      });
    },

    addBill: async (bill) => {
      const newBill: Bill = { 
        ...bill, 
        id: crypto.randomUUID(), 
        isPaid: bill.isPaid ?? false 
      };

      set((state) => {
        const newPending = new Set(state.pendingOperationIds);
        newPending.add(newBill.id);
        return {
          bills: [...state.bills, newBill],
          pendingOperationIds: newPending
        };
      });

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      let rollback = false;
      if (!session?.user) {
        rollback = true;
      } else {
        const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', session.user.id).single();
        if (!profile?.household_id) {
          rollback = true;
        } else {
          const { error } = await supabase.from('bills').insert({
            id: newBill.id,
            household_id: profile.household_id,
            name: newBill.name,
            amount: newBill.amount,
            currency: newBill.currency,
            due_day: newBill.dueDay,
            due_month: newBill.dueMonth,
            due_year: newBill.dueYear,
            category: newBill.category,
            budget_category_id: newBill.budgetCategoryId,
            is_recurring: newBill.isRecurring,
            reminder_enabled: newBill.reminderEnabled,
            is_paid: newBill.isPaid,
            icon: newBill.icon,
            color: newBill.color
          });

          if (error) {
            console.error("Failed to insert bill:", error);
            rollback = true;
          }
        }
      }

      set((state) => {
        const newPending = new Set(state.pendingOperationIds);
        newPending.delete(newBill.id);
        
        if (rollback) {
          return {
            bills: state.bills.filter(b => b.id !== newBill.id),
            pendingOperationIds: newPending
          };
        }
        return { pendingOperationIds: newPending };
      });
    },

    updateBill: async (id, updates) => {
      const originalBill = get().bills.find(b => b.id === id);
      if (!originalBill) return;

      set((state) => {
        const newPending = new Set(state.pendingOperationIds);
        newPending.add(id);
        return {
          bills: state.bills.map(b => b.id === id ? { ...b, ...updates } : b),
          pendingOperationIds: newPending
        };
      });

      const supabase = createClient();
      
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
      if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
      if (updates.dueDay !== undefined) dbUpdates.due_day = updates.dueDay;
      if (updates.dueMonth !== undefined) dbUpdates.due_month = updates.dueMonth;
      if (updates.dueYear !== undefined) dbUpdates.due_year = updates.dueYear;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.budgetCategoryId !== undefined) dbUpdates.budget_category_id = updates.budgetCategoryId;
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
      if (updates.reminderEnabled !== undefined) dbUpdates.reminder_enabled = updates.reminderEnabled;
      if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.color !== undefined) dbUpdates.color = updates.color;

      const { error } = await supabase
        .from('bills')
        .update(dbUpdates)
        .eq('id', id);

      set((state) => {
        const newPending = new Set(state.pendingOperationIds);
        newPending.delete(id);
        
        if (error) {
          console.error("Failed to update bill:", error);
          return {
            bills: state.bills.map(b => b.id === id ? originalBill : b),
            pendingOperationIds: newPending
          };
        }
        return { pendingOperationIds: newPending };
      });
    },

    removeBill: async (id) => {
      const originalBill = get().bills.find(b => b.id === id);
      if (!originalBill) return;

      set((state) => {
        const newPending = new Set(state.pendingOperationIds);
        newPending.add(id);
        return {
          bills: state.bills.filter(b => b.id !== id),
          pendingOperationIds: newPending
        };
      });

      const supabase = createClient();
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      set((state) => {
        const newPending = new Set(state.pendingOperationIds);
        newPending.delete(id);
        
        if (error) {
          console.error("Failed to remove bill:", error);
          return {
            bills: [...state.bills, originalBill],
            pendingOperationIds: newPending
          };
        }
        return { pendingOperationIds: newPending };
      });
    },

    toggleReminder: async (id) => {
      const bill = get().bills.find(b => b.id === id);
      if (bill) {
        await get().updateBill(id, { reminderEnabled: !bill.reminderEnabled });
      }
    },
      
    togglePaid: async (id) => {
      const bill = get().bills.find(b => b.id === id);
      if (bill) {
        await get().updateBill(id, { isPaid: !bill.isPaid });
      }
    },
  })
);
