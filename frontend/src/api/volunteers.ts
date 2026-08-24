import { api, downloadFile } from "./client";
import type { VolunteerApprovalOut, VolunteerPublicProfileOut, VolunteerDashboardOut, CertificateOut } from "@/types";

export const volunteersApi = {
  publicProfile: (slug: string) => api.get<VolunteerPublicProfileOut>(`/volunteers/${slug}`).then((r) => r.data),
  dashboard: () => api.get<VolunteerDashboardOut>("/volunteer/dashboard").then((r) => r.data),
  downloadCertificate: (token: string) => downloadFile(`/volunteer/certificate/${token}`, `certificate_${token}.pdf`),
  downloadReferenceLetter: (token: string) => downloadFile(`/volunteer/reference-letter/${token}`, `reference_letter_${token}.pdf`),
  directorList: (status = "pending") => api.get<VolunteerApprovalOut[]>("/director/volunteers", { params: { status } }).then((r) => r.data),
  approve: (userId: number) => api.patch<VolunteerApprovalOut>(`/director/volunteers/${userId}/approve`).then((r) => r.data),
  reject: (userId: number, reason: string) => api.patch<VolunteerApprovalOut>(`/director/volunteers/${userId}/reject`, { reason }).then((r) => r.data),
  issueCertificate: (volunteer_id: number, type: string) => api.post<CertificateOut>("/director/certificates/issue", { volunteer_id, type }).then((r) => r.data),
};
