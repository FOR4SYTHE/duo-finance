import { create } from 'zustand';
import { PlanSuggestion } from '@/types/finance';

export type Child = {
    id: string;
    type: 'Son' | 'Daughter';
    age: string;
};

interface ExploreState {
    // Current Search Form State
    step: 'form' | 'loading' | 'results';
    coverageType: 'Individual' | 'Family';
    myAge: string;
    location: string;
    goal: string;
    hasPartner: boolean;
    partnerAge: string;
    children: Child[];
    hasMother: boolean;
    motherAge: string;
    hasFather: boolean;
    fatherAge: string;
    results: PlanSuggestion[];

    // Actions
    setStep: (step: 'form' | 'loading' | 'results') => void;
    setCoverageType: (type: 'Individual' | 'Family') => void;
    setMyAge: (age: string) => void;
    setLocation: (loc: string) => void;
    setGoal: (goal: string) => void;
    setHasPartner: (has: boolean) => void;
    setPartnerAge: (age: string) => void;
    setChildren: (children: Child[]) => void;
    setHasMother: (has: boolean) => void;
    setMotherAge: (age: string) => void;
    setHasFather: (has: boolean) => void;
    setFatherAge: (age: string) => void;
    setResults: (results: PlanSuggestion[]) => void;
    resetSearch: () => void;
}

const initialSearchState = {
    step: 'form' as const,
    coverageType: 'Individual' as const,
    myAge: '',
    location: '',
    goal: 'Everyday Health (HMO)',
    hasPartner: false,
    partnerAge: '',
    children: [],
    hasMother: false,
    motherAge: '',
    hasFather: false,
    fatherAge: '',
    results: [],
};

export const useExploreStore = create<ExploreState>()(
    (set, get) => ({
        ...initialSearchState,

        setStep: (step) => set({ step }),
        setCoverageType: (coverageType) => set({ coverageType }),
        setMyAge: (myAge) => set({ myAge }),
        setLocation: (location) => set({ location }),
        setGoal: (goal) => set({ goal }),
        setHasPartner: (hasPartner) => set({ hasPartner }),
        setPartnerAge: (partnerAge) => set({ partnerAge }),
        setChildren: (children) => set({ children }),
        setHasMother: (hasMother) => set({ hasMother }),
        setMotherAge: (motherAge) => set({ motherAge }),
        setHasFather: (hasFather) => set({ hasFather }),
        setFatherAge: (fatherAge) => set({ fatherAge }),
        setResults: (results) => set({ results }),

        resetSearch: () => set({ ...initialSearchState, goal: get().goal }),
    })
);
