import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';

interface SettingsState {
  // Security
  requireFaceId: boolean;
  setRequireFaceId: (val: boolean) => void;
  requirePin: boolean;
  setRequirePin: (val: boolean) => void;
  lockTimeout: "Immediately" | "After 1 minute" | "After 5 minutes";
  setLockTimeout: (val: "Immediately" | "After 1 minute" | "After 5 minutes") => void;
  
  // Notifications
  budgetAlerts: boolean;
  setBudgetAlerts: (val: boolean) => void;
  partnerActivity: boolean;
  setPartnerActivity: (val: boolean) => void;
  reminders: boolean;
  setReminders: (val: boolean) => void;
  
  // Preferences
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  haptics: boolean;
  setHaptics: (val: boolean) => void;
  startMonday: boolean;
  setStartMonday: (val: boolean) => void;

  initialize: () => Promise<void>;
}

const syncToSupabase = async (updates: Partial<SettingsState>) => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    
    const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', session.user.id).single();
    if (profile) {
        const newPrefs = { ...(profile.preferences || {}), ...updates };
        await supabase.from('profiles').update({ preferences: newPrefs }).eq('id', session.user.id);
    }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      requireFaceId: false,
      setRequireFaceId: (val) => { set({ requireFaceId: val }); syncToSupabase({ requireFaceId: val }); },
      requirePin: false,
      setRequirePin: (val) => { set({ requirePin: val }); syncToSupabase({ requirePin: val }); },
      lockTimeout: "Immediately",
      setLockTimeout: (val) => { set({ lockTimeout: val }); syncToSupabase({ lockTimeout: val }); },

      budgetAlerts: true,
      setBudgetAlerts: (val) => { set({ budgetAlerts: val }); syncToSupabase({ budgetAlerts: val }); },
      partnerActivity: true,
      setPartnerActivity: (val) => { set({ partnerActivity: val }); syncToSupabase({ partnerActivity: val }); },
      reminders: true,
      setReminders: (val) => { set({ reminders: val }); syncToSupabase({ reminders: val }); },

      darkMode: true,
      setDarkMode: (val) => { set({ darkMode: val }); syncToSupabase({ darkMode: val }); },
      haptics: true,
      setHaptics: (val) => { set({ haptics: val }); syncToSupabase({ haptics: val }); },
      startMonday: true,
      setStartMonday: (val) => { set({ startMonday: val }); syncToSupabase({ startMonday: val }); },

      initialize: async () => {
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;
          const { data: profile } = await supabase.from('profiles').select('preferences').eq('id', session.user.id).single();
          if (profile?.preferences) {
              set(profile.preferences);
          }
      }
    }),
    {
      name: 'duo-settings-storage',
    }
  )
);
