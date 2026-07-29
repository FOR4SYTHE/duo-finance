import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      requireFaceId: false,
      setRequireFaceId: (val) => set({ requireFaceId: val }),
      requirePin: false,
      setRequirePin: (val) => set({ requirePin: val }),
      lockTimeout: "Immediately",
      setLockTimeout: (val) => set({ lockTimeout: val }),

      budgetAlerts: true,
      setBudgetAlerts: (val) => set({ budgetAlerts: val }),
      partnerActivity: true,
      setPartnerActivity: (val) => set({ partnerActivity: val }),
      reminders: true,
      setReminders: (val) => set({ reminders: val }),

      darkMode: true,
      setDarkMode: (val) => set({ darkMode: val }),
      haptics: true,
      setHaptics: (val) => set({ haptics: val }),
      startMonday: true,
      setStartMonday: (val) => set({ startMonday: val }),
    }),
    {
      name: 'duo-settings-storage',
    }
  )
);
