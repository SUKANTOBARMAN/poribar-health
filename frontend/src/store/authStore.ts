import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserOut } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserOut | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: UserOut) => void;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      hasRole: (...roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.some((r) => user.roles.includes(r as any));
      },
    }),
    { name: "poribar-health-auth" }
  )
);
