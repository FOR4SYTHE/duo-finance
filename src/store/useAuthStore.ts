import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  household_id?: string | null;
};

type AuthState = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: AuthUser | null;
  householdId: string | null;
  partner: AuthUser | null;
  
  // Actions
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
  joinHousehold: (code: string) => void;
  createHousehold: () => void;
  leaveHousehold: () => void;
  toggleMockPartner: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isInitializing: true,
  user: null,
  householdId: null,
  partner: null,

  initialize: async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      set({ isAuthenticated: false, isInitializing: false, user: null, householdId: null, partner: null });
      return;
    }

    const { data: currentProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    
    if (!currentProfile) {
      set({ isAuthenticated: false, isInitializing: false });
      return;
    }

    const authUser: AuthUser = {
      id: currentProfile.id,
      email: session.user.email || '',
      name: currentProfile.display_name,
      avatar: currentProfile.avatar_url,
      household_id: currentProfile.household_id
    };

    // Fix Dev State Leakage: Wipe local stores if a different user logs in
    const lastUserId = localStorage.getItem('duo_last_user_id');
    if (lastUserId && lastUserId !== session.user.id) {
        localStorage.removeItem('duo-budget-storage-v2');
        localStorage.removeItem('duo-spend-storage-v2');
        localStorage.removeItem('duo-bills-storage-v2');
        localStorage.removeItem('duo-cartify-storage-v2');
        localStorage.setItem('duo_last_user_id', session.user.id);
        window.location.reload();
        return;
    }
    localStorage.setItem('duo_last_user_id', session.user.id);

    let partner: AuthUser | null = null;
    if (currentProfile.household_id) {
      const { data: partners } = await supabase
        .from('profiles')
        .select('*')
        .eq('household_id', currentProfile.household_id)
        .neq('id', currentProfile.id)
        .limit(1);

      if (partners && partners.length > 0) {
        partner = {
          id: partners[0].id,
          email: '', // Not strictly needed for partner
          name: partners[0].display_name,
          avatar: partners[0].avatar_url,
          household_id: partners[0].household_id
        };
      }
    }

    set({
      isAuthenticated: true,
      isInitializing: false,
      user: authUser,
      householdId: currentProfile.household_id,
      partner
    });
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    // Wipe all local data on logout
    localStorage.removeItem('duo-budget-storage-v2');
    localStorage.removeItem('duo-spend-storage-v2');
    localStorage.removeItem('duo-bills-storage-v2');
    localStorage.removeItem('duo-cartify-storage-v2');
    localStorage.removeItem('duo_last_user_id');

    set({ 
      isAuthenticated: false, 
      user: null, 
      householdId: null,
      partner: null
    });
  },

  // Stub legacy actions to prevent crashing if called elsewhere
  joinHousehold: () => {},
  createHousehold: () => {},
  leaveHousehold: () => {},
  toggleMockPartner: () => {},
  updateUser: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null
  }))
}));
