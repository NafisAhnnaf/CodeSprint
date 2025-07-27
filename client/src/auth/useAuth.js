// src/auth/useAuth.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuth = create(
  persist(
    (set) => ({
      token: null,
      isHydrated: false, // ✅ track hydration status
      login: (token) => {
        console.log("🔐 Login successful. User set:", token);
        set({ token });
      },
      logout: () => {
        console.log("🚪 User logged out");
        set({ token: null });
      },
      setHydrated: () => set({ isHydrated: true }), // ✅ trigger hydration manually
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        state.setHydrated(); // ✅ called after rehydration
      },
    }
  )
);

export default useAuth;
