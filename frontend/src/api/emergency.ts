import { api } from "./client";
import type { AmbulanceOut, BloodDonorPublicOut, BloodDonorRegisterPayload } from "@/types";

export const emergencyApi = {
  ambulances: (params?: { upazila_id?: number; available_only?: boolean }) => api.get<AmbulanceOut[]>("/ambulances", { params }).then((r) => r.data),
  toggleAmbulance: (id: number) => api.post<AmbulanceOut>(`/ambulances/${id}/toggle-availability`).then((r) => r.data),
  bloodDonors: (params?: { blood_group?: string; upazila_id?: number }) => api.get<BloodDonorPublicOut[]>("/blood-donors", { params }).then((r) => r.data),
  registerAsDonor: (payload: BloodDonorRegisterPayload) => api.post("/blood-donors/register", payload).then((r) => r.data),
};
