from pydantic import BaseModel


class TopVolunteerOut(BaseModel):
    user_id: int
    name: str
    resolved_count: int


class AdminDashboardOut(BaseModel):
    """doc: GET /admin/dashboard — Organization-wide stats"""

    total_users: int
    total_volunteers_active: int
    pending_volunteer_approvals: int
    total_help_requests: int
    open_help_requests: int
    resolved_help_requests: int
    total_hospitals: int
    total_ambulances: int
    available_ambulances: int
    total_blood_donors: int
    published_articles_count: int
    requests_by_type: dict[str, int]
    requests_by_status: dict[str, int]
    top_volunteers_this_month: list[TopVolunteerOut]


class DirectorAnalyticsOut(BaseModel):
    """doc: GET /director/analytics — এলাকার (নিজের upazila) impact analytics"""

    upazila_id: int
    total_volunteers_active: int
    pending_volunteer_approvals: int
    total_help_requests: int
    resolved_help_requests: int
    pending_article_reviews: int
    requests_by_type: dict[str, int]
    top_volunteers_this_month: list[TopVolunteerOut]


class ImpactReportOut(BaseModel):
    """doc: GET /admin/impact-report?year=&month="""

    year: int
    month: int | None
    total_help_requests: int
    total_resolved: int
    total_articles_published: int
    total_new_volunteers: int
    requests_by_type: dict[str, int]
    top_volunteers: list[TopVolunteerOut]