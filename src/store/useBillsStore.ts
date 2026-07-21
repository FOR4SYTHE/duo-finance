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
      bills: [
        { id: 'bill-rent', name: 'Rent', amount: 18000, currency: 'PHP', dueDay: 1, category: 'Housing', isRecurring: true, reminderEnabled: true, icon: 'Home' },
        { id: 'bill-wifi', name: 'Internet', amount: 1899, currency: 'PHP', dueDay: 15, category: 'Utilities', isRecurring: true, reminderEnabled: true, icon: 'Wifi' },
        { id: 'bill-electric', name: 'Electricity', amount: 3500, currency: 'PHP', dueDay: 20, category: 'Utilities', isRecurring: true, reminderEnabled: false, icon: 'Zap' },
        { id: 'bill-water', name: 'Water', amount: 800, currency: 'PHP', dueDay: 25, category: 'Utilities', isRecurring: true, reminderEnabled: false, icon: 'Droplets' },
      ],

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
      name: 'duo-bills-storage',
    }
  )
);
