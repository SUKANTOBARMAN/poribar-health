// Poribar Health — শেয়ার্ড TypeScript টাইপ (backend app/schemas/*.py-এর সাথে মেলানো)

export type UserStatus = "pending" | "active" | "suspended";
export type UserRole = "super_admin" | "director" | "volunteer" | "user";

export interface UserOut {
  id: number; name: string; phone: string; email: string | null; status: UserStatus; roles: UserRole[];
}
export interface UserRegisterPayload {
  name: string; phone: string; email?: string; password: string;
  division_id?: number; district_id?: number; upazila_id?: number;
}
export interface VolunteerRegisterPayload extends UserRegisterPayload {
  student_id_no: string; institution_id: number; semester: string; service_upazila_id: number; nid: string;
}
export interface TokenResponse { access_token: string; refresh_token: string; token_type: string; }

export interface Division { id: number; name_bn: string; name_en: string }
export interface District { id: number; division_id: number; name_bn: string; name_en: string }
export interface Upazila { id: number; district_id: number; name_bn: string; name_en: string }
export interface Union { id: number; upazila_id: number; name_bn: string; name_en: string }



export type HospitalType = "govt" | "private" | "ngo";
export interface HospitalListOut {
  id: number; upazila_id: number; name_bn: string; name_en: string; type: HospitalType;
  bed_count: number | null; emergency_available: boolean; contact_phone: string | null;
}
export interface Doctor { id: number; name: string; designation: string | null; opd_schedule: Record<string, string> | null; contact: string | null; }
export interface Department { id: number; name_bn: string; name_en: string; opd_days: string | null; opd_time_start: string | null; opd_time_end: string | null; doctors: Doctor[]; }
export interface HospitalDetailOut extends HospitalListOut { address: string | null; lat: number | null; lng: number | null; departments: Department[]; }
export interface HospitalCreatePayload {
  upazila_id: number; name_bn: string; name_en: string; type: HospitalType;
  bed_count?: number; emergency_available?: boolean; contact_phone?: string; address?: string; lat?: number; lng?: number;
}

export interface Symptom { id: number; name_bn: string; name_en: string; common_name_bn: string | null }
export interface Specialty { id: number; name_bn: string; name_en: string }
export interface SpecialtySuggestion { specialty: Specialty; score: number }
export interface SymptomCheckResponse { suggestions: SpecialtySuggestion[] }

export type HelpRequestType = "info" | "serial" | "accommodation" | "ambulance" | "blood" | "emergency";
export type HelpRequestUrgency = "normal" | "urgent" | "emergency";
export type HelpRequestStatus = "open" | "accepted" | "inprogress" | "resolved" | "closed";
export interface HelpRequestOut {
  id: number; user_id: number; upazila_id: number; volunteer_id: number | null;
  type: HelpRequestType; urgency: HelpRequestUrgency; description: string; status: HelpRequestStatus;
  patient_feedback: number | null; patient_feedback_text: string | null; created_at: string; resolved_at: string | null;
}
export interface HelpRequestCreatePayload { upazila_id: number; type: HelpRequestType; urgency: HelpRequestUrgency; description: string; }
export interface AssistanceLogOut { id: number; help_request_id: number; action_taken: string; outcome: string | null; created_at: string; }

export type VehicleOwnerType = "govt" | "private" | "ngo";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type ContactVisibility = "volunteers_only" | "public";
export interface AmbulanceOut {
  id: number; upazila_id: number; driver_name: string; contact_phone: string; type: VehicleOwnerType;
  availability_status: boolean; fare_per_km: number | null; ac_available: boolean; updated_at: string;
}
export interface BloodDonorPublicOut { id: number; blood_group: BloodGroup; upazila_id: number; last_donated_at: string | null; is_available: boolean; contact_phone: string | null; }
export interface BloodDonorRegisterPayload { blood_group: BloodGroup; upazila_id: number; last_donated_at?: string; contact_visibility?: ContactVisibility; }
export interface BloodDonorOut extends BloodDonorPublicOut { user_id: number; contact_visibility: ContactVisibility; }

export type ArticleType = "success_story" | "health_info" | "area_report";
export type ArticleStatus = "draft" | "pending" | "approved" | "rejected";

export interface AlbumImageOut {
  id: number;
  media_id: number;
  order_index: number;
  caption: string | null;
  is_cover: boolean;
}

export interface ArticlePublicOut {
  id: number;
  title: string;
  body: string;
  published_at: string | null;
  tags: string[];
  category_name: string | null;
  author_name: string;
  author_institution: string | null;
  cover_media_id: number | null;
  cover_caption: string | null;
  album_items: AlbumImageOut[];
}

export interface ArticleOut extends ArticlePublicOut {
  volunteer_id: number;
  help_request_id: number | null;
  category_id: number | null;
  patient_consent: boolean;
  patient_name_hidden: boolean;
  status: ArticleStatus;
  reviewed_by: number | null;
  review_note: string | null;
  created_at: string;
}


export interface ArticleCreatePayload { title: string; body: string; type: ArticleType; help_request_id?: number; patient_consent?: boolean; patient_name_hidden?: boolean; tags?: string[]; category_id?: number; media_ids?: number[]; }
export interface ArticleUpdatePayload { title?: string; body?: string; type?: ArticleType; patient_consent?: boolean; patient_name_hidden?: boolean; tags?: string[]; submit_for_review?: boolean; category_id?: number; media_ids?: number[]; }


export interface VolunteerApprovalOut { user_id: number; name: string; phone: string; status: UserStatus; student_id_no: string | null; institution_id: number | null; semester: string | null; service_upazila_id: number | null; }

export interface BadgeOut { id: number; name: string; name_bn: string; icon: string | null; criteria_type: string; criteria_value: number; description: string | null; }
export interface VolunteerBadgeOut { badge: BadgeOut; awarded_at: string }
export interface VolunteerPublicProfileOut {
  name: string; public_slug: string; institution_id: number | null; service_upazila_id: number | null;
  total_assistance_count: number; emergency_case_count: number; published_article_count: number;
  badges: VolunteerBadgeOut[]; articles: ArticlePublicOut[];
}
export interface VolunteerDashboardOut { total_assistance_count: number; this_month_assistance_count: number; pending_requests_count: number; badges: VolunteerBadgeOut[]; rank: number; total_volunteers_in_area: number; }
export interface CertificateOut { id: number; volunteer_id: number; type: string; issued_at: string; issued_by: number; token: string; }

export interface TopVolunteerOut { user_id: number; name: string; resolved_count: number }
export interface AdminDashboardOut {
  total_users: number; total_volunteers_active: number; pending_volunteer_approvals: number;
  total_help_requests: number; open_help_requests: number; resolved_help_requests: number;
  total_hospitals: number; total_ambulances: number; available_ambulances: number; total_blood_donors: number;
  published_articles_count: number; requests_by_type: Record<string, number>; requests_by_status: Record<string, number>;
  top_volunteers_this_month: TopVolunteerOut[];
}
export interface DirectorAnalyticsOut {
  upazila_id: number; total_volunteers_active: number; pending_volunteer_approvals: number;
  total_help_requests: number; resolved_help_requests: number; pending_article_reviews: number;
  requests_by_type: Record<string, number>; top_volunteers_this_month: TopVolunteerOut[];
}
export interface ImpactReportOut {
  year: number; month: number | null; total_help_requests: number; total_resolved: number;
  total_articles_published: number; total_new_volunteers: number; requests_by_type: Record<string, number>; top_volunteers: TopVolunteerOut[];
}

export interface NotificationOut { id: number; type: string; title: string; body: string | null; is_read: boolean; related_type: string | null; related_id: number | null; created_at: string; }

export type AwardStatus = "pending" | "approved" | "rejected";
export interface AwardNominationOut { id: number; volunteer_id: number; nominated_by: number; award_title: string; reason: string; status: AwardStatus; decided_by: number | null; decided_at: string | null; created_at: string; }
export interface ReferenceLetterOut { id: number; volunteer_id: number; issued_by: number; purpose: string | null; issued_at: string; token: string; }

export interface ApiError { detail: string }
