import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  householdId: string | null;
  
  // Actions
  login: (email: string) => void;
  logout: () => void;
  joinHousehold: (inviteCode: string) => void;
  createHousehold: () => void;
  leaveHousehold: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      householdId: null,

      login: (email: string) => 
        set({ 
          isAuthenticated: true, 
          user: { 
            id: crypto.randomUUID(), 
            email, 
            name: email.split('@')[0] 
          } 
        }),
        
      logout: () => 
        set({ 
          isAuthenticated: false, 
          user: null, 
          householdId: null 
        }),
        
      joinHousehold: (inviteCode: string) => 
        set({ householdId: `household-${inviteCode}` }),
        
      createHousehold: () => 
        set({ householdId: `household-${crypto.randomUUID().slice(0, 8)}` }),
        
      leaveHousehold: () => 
        set({ householdId: null }),
    }),
    {
      name: "duo-auth-storage",
    }
  )
);
