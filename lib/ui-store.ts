"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  zoom: boolean;
  emailBarDismissedUntil: number | null;
  subscribed: boolean;
  toggleZoom: () => void;
  setZoom: (zoom: boolean) => void;
  dismissEmailBar: () => void;
  setSubscribed: (subscribed: boolean) => void;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      zoom: false,
      emailBarDismissedUntil: null,
      subscribed: false,
      toggleZoom: () => set((state) => ({ zoom: !state.zoom })),
      setZoom: (zoom) => set({ zoom }),
      dismissEmailBar: () => set({ emailBarDismissedUntil: Date.now() + THIRTY_DAYS_MS }),
      setSubscribed: (subscribed) => set({ subscribed }),
    }),
    { name: "pronoia-ui" },
  ),
);
