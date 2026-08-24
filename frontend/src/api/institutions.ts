import { api } from "./client";

export interface InstitutionOut {
  id: number;
  upazila_id: number;
  name_bn: string;
  name_en: string;
  type: string;
  accreditation_status: string;
}

export const institutionsApi = {
  list: (upazilaId?: number) =>
    api.get<InstitutionOut[]>("/institutions", { params: upazilaId ? { upazila_id: upazilaId } : {} }).then((r) => r.data),
};