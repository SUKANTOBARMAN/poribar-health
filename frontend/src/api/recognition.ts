import { api } from "./client";
import type { AwardNominationOut, ReferenceLetterOut } from "@/types";

export const recognitionApi = {
  nominate: (volunteer_id: number, award_title: string, reason: string) => api.post<AwardNominationOut>("/director/awards/nominate", { volunteer_id, award_title, reason }).then((r) => r.data),
  listNominations: (status?: string) => api.get<AwardNominationOut[]>("/director/awards", { params: status ? { status } : {} }).then((r) => r.data),
  decideNomination: (id: number, approve: boolean, note?: string) => api.patch<AwardNominationOut>(`/director/awards/${id}/decide`, { approve, note }).then((r) => r.data),
  issueReferenceLetter: (volunteer_id: number, purpose?: string) => api.post<ReferenceLetterOut>("/director/reference-letters/issue", { volunteer_id, purpose }).then((r) => r.data),
};
