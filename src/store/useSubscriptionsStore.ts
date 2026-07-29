import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: 'Monthly' | 'Yearly';
  iconUrl?: string;
  category?: string;
}

interface SubscriptionsState {
  subscriptions: Subscription[];
  addSubscription: (sub: Subscription) => void;
  removeSubscription: (id: string) => void;
}

export const useSubscriptionsStore = create<SubscriptionsState>()(
  persist(
    (set) => ({
      subscriptions: [
        { id: '1', name: 'Netflix Premium', amount: 549, cycle: 'Monthly' },
        { id: '2', name: 'Spotify Duo', amount: 239, cycle: 'Monthly' },
        { id: '3', name: 'Anytime Fitness', amount: 2500, cycle: 'Monthly' },
        { id: '4', name: 'Globe Postpaid', amount: 1499, cycle: 'Monthly' }
      ],
      addSubscription: (sub) => set((state) => ({ subscriptions: [...state.subscriptions, sub] })),
      removeSubscription: (id) => set((state) => ({
        subscriptions: state.subscriptions.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'duo-subscriptions-storage',
    }
  )
);
