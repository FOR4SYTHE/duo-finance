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
  chips?: string[];
  distance?: string;
  rating?: number;
  annualTuition?: number;
  enrollmentFee?: number;
  books?: number;
  uniform?: number;
  transportation?: number;
  notes?: string;
  isCustom?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  type: string;
  category?: 'Hospital' | 'Pediatrician' | 'Dentist' | 'Therapy Center';
  emergencyHotline?: string;
  distance?: string;
  operatingHours?: string;
  acceptedInsurances?: string[];
}

export interface Activity {
  id: string;
  title: string;
  category?: 'Sports' | 'Arts' | 'Learning' | 'Lifestyle';
  cost: number;
  duration: string;
  distance?: string;
  ageRange?: string;
}

export interface ChildCareData {
  schools: School[];
  hospitals: Hospital[];
  summerActivities: Activity[];
  monthlyEssentialsCost: number;
}

export interface ChildConfiguration {
  selectedSchoolId: string | null;
  selectedActivities: string[];
  selectedHealthcareProviders: string[];
}

interface ChildCareState {
  profile: ChildProfile;
  cachedData: ChildCareData;
  configuration: ChildConfiguration;
  isUpdatingAI: boolean;
  hasCompletedOnboarding: boolean;
  updateProfile: (profile: Partial<ChildProfile>) => void;
  selectSchool: (id: string | null) => void;
  addCustomSchool: (school: Omit<School, 'id'>) => void;
  toggleActivity: (id: string) => void;
  toggleHealthcareProvider: (id: string) => void;
  completeOnboarding: () => void;
  mockTriggerAIUpdate: () => Promise<void>;
  reset: () => void;
}

// Baseline mock data for Malolos, Bulacan
const INITIAL_DATA: ChildCareData = {
  schools: [
    { id: '1', name: "Lord's Angels Montessori", type: "Private Montessori", monthlyTuition: 4500, suppliesPerTerm: 2500, chips: ["Private", "Montessori", "School Bus"], distance: "1.2 km", rating: 4.8 },
    { id: '2', name: "Centro Escolar University Malolos", type: "Private University Prep", monthlyTuition: 6000, suppliesPerTerm: 3000, chips: ["Private", "STEM", "Inclusive Education"], distance: "3.5 km", rating: 4.9 },
    { id: '3', name: "Immaculate Conception School for Boys", type: "Private Catholic", monthlyTuition: 5200, suppliesPerTerm: 2800, chips: ["Private", "Catholic", "Sports Focus"], distance: "2.1 km", rating: 4.7 },
  ],
  hospitals: [
    { id: '1', name: "Bulacan Medical Center", type: "Public / Tertiary", category: "Hospital", emergencyHotline: "(044) 791-0630", distance: "4.0 km", operatingHours: "24/7", acceptedInsurances: ["PhilHealth"] },
    { id: '2', name: "Sacred Heart Hospital", type: "Private Hospital", category: "Hospital", emergencyHotline: "(044) 791-1653", distance: "2.8 km", operatingHours: "24/7", acceptedInsurances: ["AXA", "Maxicare", "MediCard"] },
    { id: '3', name: "Dr. Santos Pediatric Clinic", type: "Private / Pediatrics", category: "Pediatrician", distance: "1.5 km", operatingHours: "Mon-Sat, 9AM-5PM", acceptedInsurances: ["Maxicare", "PhilCare"] },
    { id: '4', name: "Malolos Smiles Dental", type: "Private / Dental", category: "Dentist", distance: "2.0 km", operatingHours: "Mon-Fri, 10AM-6PM", acceptedInsurances: ["AXA"] }
  ],
  summerActivities: [
    { id: '1', title: "Malolos Sports Complex Swimming Clinic", category: "Sports", cost: 1500, duration: "10 Sessions", distance: "3.2 km", ageRange: "5-12 yrs" },
    { id: '2', title: "Summer Art Workshop (Barasoain)", category: "Arts", cost: 2000, duration: "4 Weeks", distance: "1.8 km", ageRange: "7-15 yrs" },
    { id: '3', title: "Junior Coding Bootcamp", category: "Learning", cost: 3500, duration: "6 Weeks", distance: "2.5 km", ageRange: "8-14 yrs" }
  ],
  monthlyEssentialsCost: 3500 // Base for diapers, milk, vitamins
};

export const useChildCareStore = create<ChildCareState>()(
  persist(
    (set) => ({
      profile: { nickname: '', age: null, gender: null, location: 'Malolos, Bulacan' },
      cachedData: INITIAL_DATA,
      configuration: {
        selectedSchoolId: null,
        selectedActivities: [],
        selectedHealthcareProviders: []
      },
      isUpdatingAI: false,
      hasCompletedOnboarding: false,
      
      updateProfile: (profileUpdate) => set((state) => ({
        profile: { ...state.profile, ...profileUpdate }
      })),

      selectSchool: (id) => set((state) => ({
        configuration: { ...state.configuration, selectedSchoolId: id }
      })),

      addCustomSchool: (newSchool) => set((state) => {
        const id = `custom-${Date.now()}`;
        const schoolWithId = { ...newSchool, id, isCustom: true };
        return {
          cachedData: {
            ...state.cachedData,
            schools: [...state.cachedData.schools, schoolWithId]
          },
          configuration: {
            ...state.configuration,
            selectedSchoolId: id
          }
        };
      }),

      toggleActivity: (id) => set((state) => {
        const activities = state.configuration.selectedActivities;
        const exists = activities.includes(id);
        return {
          configuration: {
            ...state.configuration,
            selectedActivities: exists ? activities.filter(a => a !== id) : [...activities, id]
          }
        };
      }),

      toggleHealthcareProvider: (id) => set((state) => {
        const providers = state.configuration.selectedHealthcareProviders;
        const exists = providers.includes(id);
        return {
          configuration: {
            ...state.configuration,
            selectedHealthcareProviders: exists ? providers.filter(p => p !== id) : [...providers, id]
          }
        };
      }),

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
              ...state.cachedData.summerActivities.filter(a => a.title !== "Robotics Camp 2026 (Malolos City Hall)"), // Prevent infinite appending
              { id: Date.now().toString(), title: "Robotics Camp 2026 (Malolos City Hall)", cost: 4500, duration: "5 Weeks", category: "Learning" }
            ]
          }
        }));
      },

      reset: () => set({
        profile: { nickname: '', age: null, gender: null, location: 'Malolos, Bulacan' },
        hasCompletedOnboarding: false,
        configuration: {
          selectedSchoolId: null,
          selectedActivities: [],
          selectedHealthcareProviders: []
        },
        cachedData: INITIAL_DATA
      })
    }),
    {
      name: 'child-care-storage',
    }
  )
);
