from pydantic import BaseModel

from app.schemas.article import ArticlePublicOut
from app.schemas.badge import VolunteerBadgeOut


class VolunteerPublicProfileOut(BaseModel):
    """
    doc: GET /volunteers/{slug} — শেয়ারেবল পাবলিক প্রোফাইল।
    দেখাবে: নাম, ইনস্টিটিউশন, সার্ভিস এলাকা, মোট সহায়তা, জরুরি কেস, প্রকাশিত আর্টিকেল, ব্যাজ।
    """

    name: str
    public_slug: str
    institution_id: int | None
    service_upazila_id: int | None
    total_assistance_count: int
    emergency_case_count: int
    published_article_count: int
    badges: list[VolunteerBadgeOut]
    articles: list[ArticlePublicOut]


class VolunteerDashboardOut(BaseModel):
    """doc: GET /volunteer/dashboard — মোট সহায়তা, ব্যাজ, ranking।"""

    total_assistance_count: int
    this_month_assistance_count: int
    pending_requests_count: int
    badges: list[VolunteerBadgeOut]
    rank: int  # এলাকার (উপজেলা) মধ্যে resolved count অনুযায়ী position
    total_volunteers_in_area: int