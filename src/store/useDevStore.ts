import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DevState {
  showDevTools: boolean;
  setShowDevTools: (show: boolean) => void;
}

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      showDevTools: true,
      setShowDevTools: (show) => set({ showDevTools: show }),
    }),
    {
      name: 'duo-finance-dev-storage',
    }
  )
);
