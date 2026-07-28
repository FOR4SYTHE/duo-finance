import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartifyItem } from '@/types/finance';

export interface TripHistory {
    id: string;
    date: string;
    totalSpentPHP: number;
    totalSpentZAR: number;
    items: CartifyItem[];
    mode: 'simple' | 'planned';
}

export interface TripTemplate {
    id: string;
    name: string;
    items: string[]; // Just names of items to buy
}

export interface ScheduledTrip {
    id: string;
    date: string; // ISO date string
    templateId?: string;
    estimatedBudgetPHP?: number;
    storeName?: string;
}

interface HouseholdState {
    tripHistory: TripHistory[];
    tripTemplates: TripTemplate[];
    scheduledTrips: ScheduledTrip[];
    
    // Actions
    saveTripToHistory: (trip: TripHistory) => void;
    saveTemplate: (template: TripTemplate) => void;
    scheduleTrip: (trip: ScheduledTrip) => void;
    deleteScheduledTrip: (id: string) => void;
}

export const useHouseholdStore = create<HouseholdState>()(
    persist(
        (set) => ({
            tripHistory: [],
            tripTemplates: [],
            scheduledTrips: [],

            saveTripToHistory: (trip) => set((state) => ({
                tripHistory: [trip, ...state.tripHistory]
            })),

            saveTemplate: (template) => set((state) => ({
                tripTemplates: [template, ...state.tripTemplates]
            })),

            scheduleTrip: (trip) => set((state) => ({
                scheduledTrips: [...state.scheduledTrips, trip]
            })),

            deleteScheduledTrip: (id) => set((state) => ({
                scheduledTrips: state.scheduledTrips.filter(t => t.id !== id)
            })),
        }),
        {
            name: 'household-storage-v1'
        }
    )
);
