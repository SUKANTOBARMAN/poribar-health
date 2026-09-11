from fastapi import APIRouter

from app.api.v1.auth.routes import router as auth_router
from app.api.v1.public.geo import router as public_geo_router

from app.api.v1.public.hospitals import router as public_hospitals_router
from app.api.v1.admin.hospitals import router as admin_hospitals_router

from app.api.v1.public.symptoms import router as public_symptoms_router
from app.api.v1.user.help_requests import router as user_help_requests_router
from app.api.v1.volunteer.help_requests import router as volunteer_help_requests_router

from app.api.v1.public.emergency import router as public_emergency_router
from app.api.v1.user.blood_donors import router as user_blood_donors_router
from app.api.v1.volunteer.ambulances import router as volunteer_ambulances_router

from app.api.v1.public.articles import router as public_articles_router
from app.api.v1.volunteer.articles import router as volunteer_articles_router
from app.api.v1.director.articles import router as director_articles_router
from app.api.v1.director.volunteers import router as director_volunteers_router

from app.api.v1.public.volunteers import router as public_volunteers_router
from app.api.v1.volunteer.dashboard import router as volunteer_dashboard_router
from app.api.v1.director.certificates import router as director_certificates_router

from app.api.v1.admin.dashboard import router as admin_dashboard_router
from app.api.v1.admin.geo import router as admin_geo_router
from app.api.v1.admin.reports import router as admin_reports_router
from app.api.v1.director.analytics import router as director_analytics_router

from app.api.v1.user.notifications import router as user_notifications_router

from app.api.v1.director.awards import router as director_awards_router
from app.api.v1.director.reference_letters import router as director_reference_letters_router
from app.api.v1.volunteer.reference_letters import router as volunteer_reference_letters_router

from app.api.v1.volunteer.documents import router as volunteer_documents_router
from app.api.v1.director.documents import router as director_documents_router

from app.api.v1.public.institutions import router as public_institutions_router
from app.api.v1.volunteer.recognition import router as volunteer_recognition_router
from app.api.v1.auth.profile import router as auth_profile_router
from app.api.v1.admin.departments import router as admin_departments_router
from app.api.v1.auth.password_reset import router as auth_password_reset_router

from app.api.v1.public.content import router as public_content_router
from app.api.v1.admin.categories import router as admin_categories_router
from app.api.v1.volunteer.media import router as volunteer_media_router
from app.api.v1.volunteer.album import router as volunteer_album_router
from app.api.v1.public.related_articles import router as related_articles_router


api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(public_geo_router)

api_router.include_router(public_hospitals_router)
api_router.include_router(admin_hospitals_router)

api_router.include_router(public_symptoms_router)
api_router.include_router(user_help_requests_router)
api_router.include_router(volunteer_help_requests_router)

api_router.include_router(public_emergency_router)
api_router.include_router(user_blood_donors_router)
api_router.include_router(volunteer_ambulances_router)

api_router.include_router(public_articles_router)
api_router.include_router(volunteer_articles_router)
api_router.include_router(director_articles_router)
api_router.include_router(director_volunteers_router)

api_router.include_router(public_volunteers_router)
api_router.include_router(volunteer_dashboard_router)
api_router.include_router(director_certificates_router)

api_router.include_router(admin_dashboard_router)
api_router.include_router(admin_geo_router)
api_router.include_router(admin_reports_router)
api_router.include_router(director_analytics_router)

api_router.include_router(user_notifications_router)

api_router.include_router(director_awards_router)
api_router.include_router(director_reference_letters_router)
api_router.include_router(volunteer_reference_letters_router)

api_router.include_router(volunteer_documents_router)
api_router.include_router(director_documents_router)

api_router.include_router(public_institutions_router)
api_router.include_router(volunteer_recognition_router)
api_router.include_router(auth_profile_router)
api_router.include_router(admin_departments_router)
api_router.include_router(auth_password_reset_router)

api_router.include_router(public_content_router)
api_router.include_router(admin_categories_router)
api_router.include_router(volunteer_media_router)
api_router.include_router(volunteer_album_router)
api_router.include_router(related_articles_router)