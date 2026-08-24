import { api } from "./client";
import type { Symptom, SymptomCheckResponse } from "@/types";

export const symptomsApi = {
  list: () => api.get<Symptom[]>("/symptoms").then((r) => r.data),
  check: (symptomIds: number[]) => api.post<SymptomCheckResponse>("/symptom-check", { symptom_ids: symptomIds }).then((r) => r.data),
};
