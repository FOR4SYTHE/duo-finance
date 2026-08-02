import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  removeBill: (id: string) => void;
  toggleReminder: (id: string) => void;
  togglePaid: (id: string) => void;
}

export const useBillsStore = create<BillsState>()(
  persist(
    (set) => ({
      bills: [],

      addBill: (bill) =>
        set((state) => ({
          bills: [...state.bills, { ...bill, id: crypto.randomUUID(), isPaid: bill.isPaid ?? false }],
        })),

      updateBill: (id, updates) =>
        set((state) => ({
          bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      removeBill: (id) =>
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id),
        })),

      toggleReminder: (id) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, reminderEnabled: !b.reminderEnabled } : b
          ),
        })),
        
      togglePaid: (id) =>
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, isPaid: !b.isPaid } : b
          ),
        })),
    }),
    {
      name: 'duo-bills-storage-v2',
    }
  )
);
