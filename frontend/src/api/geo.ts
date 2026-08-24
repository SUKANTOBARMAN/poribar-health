import { api } from "./client";
import type { Division, District, Upazila, Union } from "@/types";

export const geoApi = {
  divisions: () => 
    api.get<Division[]>("/geo/divisions").then((r) => r.data),

  districts: (divisionId: number) => 
    api.get<District[]>("/geo/districts", { params: { division_id: Number(divisionId) } }).then((r) => r.data),

  upazilas: (districtId: number) => 
    api.get<Upazila[]>("/geo/upazilas", { params: { district_id: Number(districtId) } }).then((r) => r.data),

  unions: (upazilaId: number) => 
    api.get<Union[]>("/geo/unions", { params: { upazila_id: Number(upazilaId) } }).then((r) => r.data),
};