import { api, downloadFile } from "./client";
import type { AdminDashboardOut, DirectorAnalyticsOut, ImpactReportOut, VolunteerApprovalOut, Upazila } from "@/types";

export const adminApi = {
  dashboard: () => api.get<AdminDashboardOut>("/admin/dashboard").then((r) => r.data),
  volunteers: (params?: { status?: string; upazila_id?: number }) => api.get<VolunteerApprovalOut[]>("/admin/volunteers", { params }).then((r) => r.data),
  impactReport: (year: number, month?: number) => api.get<ImpactReportOut>("/admin/impact-report", { params: { year, month } }).then((r) => r.data),
  exportReportPdf: (year: number, month?: number) => downloadFile(`/admin/reports/export?format=pdf&year=${year}${month ? `&month=${month}` : ""}`, `impact_report_${year}.pdf`),
  addUpazila: (district_id: number, name_bn: string, name_en: string) => api.post<Upazila>("/admin/geo/upazilas", { district_id, name_bn, name_en }).then((r) => r.data),
};
export const directorAnalyticsApi = { analytics: () => api.get<DirectorAnalyticsOut>("/director/analytics").then((r) => r.data) };
