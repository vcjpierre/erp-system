import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isSidebarOpen: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isSidebarOpen: true,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({ accessToken, refreshToken });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    }),
    {
      name: "erp-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
