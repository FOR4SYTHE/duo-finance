import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChildProfile {
  nickname: string;
  age: number | null;
  gender: 'boy' | 'girl' | 'other' | null;
  location: string;
}

export interface School {
  id: string;
  name: string;
  type: string;
  monthlyTuition: number;
  suppliesPerTerm: number;
}

export interface Hospital {
  id: string;
  name: string;
  type: string;
  emergencyHotline: string;
}

export interface Activity {
  id: string;
  title: string;
  cost: number;
  duration: string;
}

export interface ChildCareData {
  schools: School[];
  hospitals: Hospital[];
  summerActivities: Activity[];
  monthlyEssentialsCost: number;
}

interface ChildCareState {
  profile: ChildProfile;
  cachedData: ChildCareData;
  isUpdatingAI: boolean;
  hasCompletedOnboarding: boolean;
  updateProfile: (profile: Partial<ChildProfile>) => void;
  completeOnboarding: () => void;
  mockTriggerAIUpdate: () => Promise<void>;
}

// Baseline mock data for Malolos, Bulacan
const INITIAL_DATA: ChildCareData = {
  schools: [
    { id: '1', name: "Lord's Angels Montessori", type: "Private Montessori", monthlyTuition: 4500, suppliesPerTerm: 2500 },
    { id: '2', name: "Centro Escolar University Malolos", type: "Private University Prep", monthlyTuition: 6000, suppliesPerTerm: 3000 },
    { id: '3', name: "Immaculate Conception School for Boys", type: "Private Catholic", monthlyTuition: 5200, suppliesPerTerm: 2800 },
  ],
  hospitals: [
    { id: '1', name: "Bulacan Medical Center", type: "Public / Tertiary", emergencyHotline: "(044) 791-0630" },
    { id: '2', name: "Sacred Heart Hospital", type: "Private Hospital", emergencyHotline: "(044) 791-1653" },
    { id: '3', name: "Malolos Maternity Hospital", type: "Private / Pediatrics", emergencyHotline: "(044) 662-7292" }
  ],
  summerActivities: [
    { id: '1', name: "Malolos Sports Complex Swimming Clinic", cost: 1500, duration: "10 Sessions" },
    { id: '2', name: "Summer Art Workshop (Barasoain)", cost: 2000, duration: "4 Weeks" }
  ],
  monthlyEssentialsCost: 3500 // Base for diapers, milk, vitamins
};

export const useChildCareStore = create<ChildCareState>()(
  persist(
    (set) => ({
      profile: { nickname: '', age: null, gender: null, location: 'Malolos, Bulacan' },
      cachedData: INITIAL_DATA,
      isUpdatingAI: false,
      hasCompletedOnboarding: false,
      
      updateProfile: (profileUpdate) => set((state) => ({
        profile: { ...state.profile, ...profileUpdate }
      })),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      mockTriggerAIUpdate: async () => {
        set({ isUpdatingAI: true });
        
        // Simulate a 2.5s AI fetch
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Slightly update the data to prove the "refresh" worked
        set((state) => ({
          isUpdatingAI: false,
          cachedData: {
            ...state.cachedData,
            schools: state.cachedData.schools.map(s => ({ ...s, monthlyTuition: s.monthlyTuition + 150 })), // simulate 2026 inflation
            summerActivities: [
              ...state.cachedData.summerActivities,
              { id: '3', title: "Robotics Camp 2026 (Malolos City Hall)", cost: 4500, duration: "5 Weeks" }
            ]
          }
        }));
      }
    }),
    {
      name: 'child-care-storage',
    }
  )
);
