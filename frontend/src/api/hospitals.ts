import { api } from "./client";
import type { HospitalListOut, HospitalDetailOut, HospitalCreatePayload } from "@/types";

export const hospitalsApi = {
  list: (params?: { upazila_id?: number; emergency_available?: boolean }) => api.get<HospitalListOut[]>("/hospitals", { params }).then((r) => r.data),
  detail: (id: number) => api.get<HospitalDetailOut>(`/hospitals/${id}`).then((r) => r.data),
  create: (payload: HospitalCreatePayload) => api.post<HospitalListOut>("/admin/hospitals", payload).then((r) => r.data),
  update: (id: number, payload: Partial<HospitalCreatePayload>) => api.patch<HospitalListOut>(`/admin/hospitals/${id}`, payload).then((r) => r.data),
};
