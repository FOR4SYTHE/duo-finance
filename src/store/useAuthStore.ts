import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
};

type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  householdId: string | null;
  partner: AuthUser | null;
  
  // Actions
  login: (email: string) => void;
  logout: () => void;
  joinHousehold: (inviteCode: string) => void;
  createHousehold: () => void;
  leaveHousehold: () => void;
  toggleMockPartner: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      householdId: null,
      partner: { id: "partner-123", email: "jon@example.com", name: "Jon" },

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
          householdId: null,
          partner: null
        }),
        
      joinHousehold: (inviteCode: string) => 
        set({ householdId: `household-${inviteCode}`, partner: { id: "partner-123", email: "jon@example.com", name: "Jon" } }),
        
      createHousehold: () => 
        set({ householdId: `household-${crypto.randomUUID().slice(0, 8)}`, partner: null }),
        
      leaveHousehold: () => 
        set({ householdId: null, partner: null }),
        
      toggleMockPartner: () => set((state) => ({
        partner: state.partner ? null : { id: "partner-123", email: "jon@example.com", name: "Jon" }
      }))
    }),
    {
      name: "duo-auth-storage",
    }
  )
);
