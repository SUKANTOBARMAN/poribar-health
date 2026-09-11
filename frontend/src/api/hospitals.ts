import { api } from "./client";
import type { HospitalListOut, HospitalDetailOut, HospitalCreatePayload, Department, Doctor } from "@/types";

interface DeptPayload { name_bn: string; name_en: string; opd_days?: string; opd_time_start?: string; opd_time_end?: string; }
interface DoctorPayload { name: string; designation?: string; contact?: string; }

export const hospitalsApi = {
  list: (params?: { upazila_id?: number; emergency_available?: boolean }) => api.get<HospitalListOut[]>("/hospitals", { params }).then((r) => r.data),
  detail: (id: number) => api.get<HospitalDetailOut>(`/hospitals/${id}`).then((r) => r.data),
  create: (payload: HospitalCreatePayload) => api.post<HospitalListOut>("/admin/hospitals", payload).then((r) => r.data),
  update: (id: number, payload: Partial<HospitalCreatePayload>) => api.patch<HospitalListOut>(`/admin/hospitals/${id}`, payload).then((r) => r.data),

  createDepartment: (hospitalId: number, payload: DeptPayload) => api.post<Department>(`/admin/hospitals/${hospitalId}/departments`, payload).then((r) => r.data),
  updateDepartment: (id: number, payload: Partial<DeptPayload>) => api.patch<Department>(`/admin/departments/${id}`, payload).then((r) => r.data),
  deleteDepartment: (id: number) => api.delete(`/admin/departments/${id}`),

  createDoctor: (departmentId: number, payload: DoctorPayload) => api.post<Doctor>(`/admin/departments/${departmentId}/doctors`, payload).then((r) => r.data),
  updateDoctor: (id: number, payload: Partial<DoctorPayload>) => api.patch<Doctor>(`/admin/doctors/${id}`, payload).then((r) => r.data),
  deleteDoctor: (id: number) => api.delete(`/admin/doctors/${id}`),
};