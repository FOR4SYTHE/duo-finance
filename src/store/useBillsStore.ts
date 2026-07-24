import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  currency: 'PHP' | 'ZAR';
  dueDay: number; // 1-31
  category: string;
  isRecurring: boolean;
  reminderEnabled: boolean;
  icon?: string;
}

interface BillsState {
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  removeBill: (id: string) => void;
  toggleReminder: (id: string) => void;
}

export const useBillsStore = create<BillsState>()(
  persist(
    (set) => ({
      bills: [],

      addBill: (bill) =>
        set((state) => ({
          bills: [...state.bills, { ...bill, id: crypto.randomUUID() }],
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
    }),
    {
      name: 'duo-bills-storage-v2',
    }
  )
);
