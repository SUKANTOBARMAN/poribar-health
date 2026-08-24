import { api } from "./client";
import type { HelpRequestOut, HelpRequestCreatePayload, AssistanceLogOut, HelpRequestStatus } from "@/types";

export const helpRequestsApi = {
  create: (payload: HelpRequestCreatePayload) => api.post<HelpRequestOut>("/help-requests", payload).then((r) => r.data),
  my: () => api.get<HelpRequestOut[]>("/help-requests/my").then((r) => r.data),
  giveFeedback: (id: number, patient_feedback: number, patient_feedback_text?: string) =>
    api.patch<HelpRequestOut>(`/help-requests/${id}/feedback`, { patient_feedback, patient_feedback_text }).then((r) => r.data),
  volunteerList: (status?: HelpRequestStatus) => api.get<HelpRequestOut[]>("/volunteer/requests", { params: status ? { status } : {} }).then((r) => r.data),
  accept: (id: number) => api.post<HelpRequestOut>(`/volunteer/requests/${id}/accept`).then((r) => r.data),
  update: (id: number, payload: { status: string; action_taken: string; outcome?: string }) => api.patch<HelpRequestOut>(`/volunteer/requests/${id}/update`, payload).then((r) => r.data),
  resolve: (id: number) => api.post<HelpRequestOut>(`/volunteer/requests/${id}/resolve`).then((r) => r.data),
  assistanceLog: () => api.get<AssistanceLogOut[]>("/volunteer/assistance-log").then((r) => r.data),
};
