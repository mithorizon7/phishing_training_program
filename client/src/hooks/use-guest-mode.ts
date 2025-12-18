import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuestModeState {
  isGuestMode: boolean;
  setGuestMode: (value: boolean) => void;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
}

export const useGuestMode = create<GuestModeState>()(
  persist(
    (set) => ({
      isGuestMode: false,
      setGuestMode: (value: boolean) => set({ isGuestMode: value }),
      enterGuestMode: () => set({ isGuestMode: true }),
      exitGuestMode: () => set({ isGuestMode: false }),
    }),
    {
      name: 'guest-mode-storage',
    }
  )
);
