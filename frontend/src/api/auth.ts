import { api } from "./client";
import type { UserOut, UserRegisterPayload, VolunteerRegisterPayload, TokenResponse } from "@/types";

export const authApi = {
  register: (payload: UserRegisterPayload) => api.post<UserOut>("/auth/register", payload).then((r) => r.data),
  registerVolunteer: (payload: VolunteerRegisterPayload) => api.post<UserOut>("/auth/volunteer/register", payload).then((r) => r.data),
  login: (phone: string, password: string) => {
    const form = new URLSearchParams();
    form.set("username", phone);
    form.set("password", password);
    return api.post<TokenResponse>("/auth/login", form, { headers: { "Content-Type": "application/x-www-form-urlencoded" } }).then((r) => r.data);
  },
  me: () => api.get<UserOut>("/auth/me").then((r) => r.data),
};
