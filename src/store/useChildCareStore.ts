import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';
import { useBudgetStore } from '@/store/useBudgetStore';

export interface ChildProfile {
  id?: string;
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
  isAiDataLoaded: boolean;
  aiUpdatedAt: string | null;
  aiError: string | null;
  updateProfile: (profile: Partial<ChildProfile>) => void;
  selectSchool: (id: string | null) => void;
  addCustomSchool: (school: Omit<School, 'id'>) => void;
  toggleActivity: (id: string) => void;
  toggleHealthcareProvider: (id: string) => void;
  completeOnboarding: () => void;
  mockTriggerAIUpdate: () => Promise<void>;
  reset: () => void;
  loadHouseholdChildCare: () => Promise<void>;
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
  monthlyEssentialsCost: 3500
};

export const useChildCareStore = create<ChildCareState>()(
  persist(
    (set, get) => ({
      aiError: null,
      profile: { id: undefined, nickname: '', age: null, gender: null, location: 'Malolos, Bulacan' },
      cachedData: INITIAL_DATA,
      configuration: {
        selectedSchoolId: null,
        selectedActivities: [],
        selectedHealthcareProviders: []
      },
      isUpdatingAI: false,
      hasCompletedOnboarding: false,
      isAiDataLoaded: false,
      aiUpdatedAt: null,
      
      updateProfile: (profileUpdate) => set((state) => ({
        profile: { ...state.profile, ...profileUpdate }
      })),

      selectSchool: async (id) => {
        set((state) => ({
          configuration: { ...state.configuration, selectedSchoolId: id }
        }));
        
        const state = get();
        const childId = state.profile.id;
        if (!childId) return;
        
        const supabase = createClient();
        
        // Remove previous school selections
        await supabase
          .from('child_selections')
          .delete()
          .eq('child_id', childId)
          .eq('category', 'school');
          
        if (id) {
          const school = state.cachedData.schools.find(s => s.id === id);
          if (school) {
            // Note: RLS requires household_id. We fetch it via RPC if needed, but RLS on child_profiles
            // ensures we can just let a trigger or postgres function handle it, OR we can fetch it.
            // Wait, RLS on insert requires household_id.
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const { data: householdId } = await supabase.rpc('get_user_household_id');
            if (!householdId) return;

            await supabase
              .from('child_selections')
              .insert({
                household_id: householdId,
                child_id: childId,
                category: 'school',
                item_id: school.id,
                item_name: school.name,
                item_data: school,
                mode: 'Configured'
              });
          }
        }
      },

      addCustomSchool: (newSchool) => set((state) => {
        const id = `custom-${Date.now()}`;
        const schoolWithId = { ...newSchool, id, isCustom: true };
        
        // Let selectSchool handle the DB sync next time they explicitly select it,
        // or we can call selectSchool immediately. But selectSchool is an action.
        // We'll just update state here. Calling selectSchool right after handles sync.
        setTimeout(() => {
          get().selectSchool(id);
        }, 0);

        return {
          cachedData: {
            ...state.cachedData,
            schools: [...state.cachedData.schools, schoolWithId]
          }
        };
      }),

      toggleActivity: async (id) => {
        const state = get();
        const activities = state.configuration.selectedActivities;
        const exists = activities.includes(id);
        const newActivities = exists ? activities.filter(a => a !== id) : [...activities, id];
        
        set((state) => ({
          configuration: {
            ...state.configuration,
            selectedActivities: newActivities
          }
        }));

        const childId = state.profile.id;
        if (!childId) return;
        
        const supabase = createClient();
        const { data: householdId } = await supabase.rpc('get_user_household_id');
        if (!householdId) return;

        if (exists) {
          // Remove it
          await supabase
            .from('child_selections')
            .delete()
            .eq('child_id', childId)
            .eq('category', 'activity')
            .eq('item_id', id);
        } else {
          // Add it
          const activity = state.cachedData.summerActivities.find(a => a.id === id);
          if (activity) {
            await supabase
              .from('child_selections')
              .insert({
                household_id: householdId,
                child_id: childId,
                category: 'activity',
                item_id: activity.id,
                item_name: activity.title,
                item_data: activity,
                mode: 'Configured'
              });
          }
        }
      },

      toggleHealthcareProvider: async (id) => {
        const state = get();
        const providers = state.configuration.selectedHealthcareProviders;
        const exists = providers.includes(id);
        const newProviders = exists ? providers.filter(p => p !== id) : [...providers, id];
        
        set((state) => ({
          configuration: {
            ...state.configuration,
            selectedHealthcareProviders: newProviders
          }
        }));

        const childId = state.profile.id;
        if (!childId) return;
        
        const supabase = createClient();
        const { data: householdId } = await supabase.rpc('get_user_household_id');
        if (!householdId) return;

        if (exists) {
          await supabase
            .from('child_selections')
            .delete()
            .eq('child_id', childId)
            .eq('category', 'hospital')
            .eq('item_id', id);
        } else {
          const provider = state.cachedData.hospitals.find(p => p.id === id);
          if (provider) {
            await supabase
              .from('child_selections')
              .insert({
                household_id: householdId,
                child_id: childId,
                category: 'hospital',
                item_id: provider.id,
                item_name: provider.name,
                item_data: provider,
                mode: 'Configured'
              });
          }
        }
      },

      completeOnboarding: async () => {
        set({ hasCompletedOnboarding: true });
        
        const state = get();
        let childId = state.profile.id;
        const supabase = createClient();
        
        const { data: householdId } = await supabase.rpc('get_user_household_id');
        if (!householdId) return;

        if (!childId) {
          childId = crypto.randomUUID();
          set((s) => ({ profile: { ...s.profile, id: childId } }));
        }

        await supabase
          .from('child_profiles')
          .upsert({
            id: childId,
            household_id: householdId,
            nickname: state.profile.nickname,
            age: state.profile.age,
            gender: state.profile.gender,
            location: state.profile.location
          });
      },

      mockTriggerAIUpdate: async () => {
        set({ isUpdatingAI: true, aiError: null });
        
        try {
          const location = get().profile.location || 'Malolos, Bulacan';
          const response = await fetch('/api/ai/schools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location })
          });
          
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to fetch schools');
          }
          
          const { data } = await response.json();
          if (data) {
            set((state) => ({
              cachedData: {
                ...state.cachedData,
                schools: data
              },
              isAiDataLoaded: true,
              aiUpdatedAt: new Date().toISOString()
            }));
          }
        } catch (error: any) {
          console.error(error);
          set({ aiError: 'Couldn\'t reach DUO AI right now — please try again later.' });
        } finally {
          set({ isUpdatingAI: false });
        }
      },

      reset: async () => {
        const state = get();
        if (state.profile.id) {
          const supabase = createClient();
          await supabase
            .from('child_profiles')
            .delete()
            .eq('id', state.profile.id);
        }

        set({
          profile: { id: undefined, nickname: '', age: null, gender: null, location: 'Malolos, Bulacan' },
          hasCompletedOnboarding: false,
          isAiDataLoaded: false,
          aiUpdatedAt: null,
          aiError: null,
          configuration: {
            selectedSchoolId: null,
            selectedActivities: [],
            selectedHealthcareProviders: []
          },
          cachedData: INITIAL_DATA
        });
      },

      loadHouseholdChildCare: async () => {
        const supabase = createClient();
        const { data: householdId } = await supabase.rpc('get_user_household_id');
        if (!householdId) return;

        // Fetch first child profile
        const { data: profiles } = await supabase
          .from('child_profiles')
          .select('*')
          .eq('household_id', householdId)
          .limit(1);

        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          
          // Fetch selections
          const { data: selections } = await supabase
            .from('child_selections')
            .select('*')
            .eq('child_id', profile.id);

          const schools = selections?.filter(s => s.category === 'school').map(s => s.item_id) || [];
          const activities = selections?.filter(s => s.category === 'activity').map(s => s.item_id) || [];
          const hospitals = selections?.filter(s => s.category === 'hospital').map(s => s.item_id) || [];

          set({
            profile: {
              id: profile.id,
              nickname: profile.nickname,
              age: profile.age,
              gender: profile.gender,
              location: profile.location
            },
            hasCompletedOnboarding: true,
            configuration: {
              selectedSchoolId: schools.length > 0 ? schools[0] : null,
              selectedActivities: activities,
              selectedHealthcareProviders: hospitals
            }
          });
        }

        const currentLocation = get().profile.location || 'Malolos, Bulacan';
        const normalizedLocation = currentLocation.trim().toLowerCase();
        const { data: cacheResult } = await supabase
          .from('ai_schools_cache')
          .select('data, updated_at')
          .eq('location_query', normalizedLocation)
          .maybeSingle();
          
        if (cacheResult && cacheResult.data) {
          set((state) => ({
            cachedData: {
              ...state.cachedData,
              schools: cacheResult.data
            },
            isAiDataLoaded: true,
            aiUpdatedAt: cacheResult.updated_at
          }));
        }
      }
    }),
    {
      name: 'child-care-storage',
    }
  )
);
