import { api } from "./client";
import type { AmbulanceOut, BloodDonorPublicOut, BloodDonorRegisterPayload, BloodDonorOut } from "@/types";

export const emergencyApi = {
  ambulances: (params?: { upazila_id?: number; available_only?: boolean }) => api.get<AmbulanceOut[]>("/ambulances", { params }).then((r) => r.data),
  toggleAmbulance: (id: number) => api.post<AmbulanceOut>(`/ambulances/${id}/toggle-availability`).then((r) => r.data),

  bloodDonors: (params?: { blood_group?: string; upazila_id?: number }) => api.get<BloodDonorPublicOut[]>("/blood-donors", { params }).then((r) => r.data),
  registerAsDonor: (payload: BloodDonorRegisterPayload) => api.post<BloodDonorOut>("/blood-donors/register", payload).then((r) => r.data),

  myDonorProfile: () => api.get<BloodDonorOut>("/blood-donors/me").then((r) => r.data),
  updateMyDonorProfile: (payload: { is_available?: boolean; last_donated_at?: string; contact_visibility?: string }) =>
    api.patch<BloodDonorOut>("/blood-donors/me", payload).then((r) => r.data),
};