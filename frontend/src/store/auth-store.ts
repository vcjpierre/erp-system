import { create } from "zustand";
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

function loadFromStorage(): Partial<AuthState> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("erp-auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        isAuthenticated: !!parsed.isAuthenticated,
      };
    }
  } catch {}
  return {};
}

function saveToStorage(state: Partial<AuthState>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "erp-auth",
      JSON.stringify({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    );
  } catch {}
}

const initial = loadFromStorage();

export const useAuthStore = create<AuthState>()((set) => ({
  user: initial.user || null,
  accessToken: initial.accessToken || null,
  refreshToken: initial.refreshToken || null,
  isAuthenticated: initial.isAuthenticated || false,
  isSidebarOpen: true,

  setAuth: (user, accessToken, refreshToken) => {
    const state = { user, accessToken, refreshToken, isAuthenticated: true };
    saveToStorage(state);
    set(state);
  },

  setUser: (user) => {
    set({ user });
    const current = useAuthStore.getState();
    saveToStorage({ user, accessToken: current.accessToken, refreshToken: current.refreshToken, isAuthenticated: current.isAuthenticated });
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken });
    const current = useAuthStore.getState();
    saveToStorage({ user: current.user, accessToken, refreshToken, isAuthenticated: current.isAuthenticated });
  },

  logout: () => {
    localStorage.removeItem("erp-auth");
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
