from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.permissions import get_current_user, require_role
from app.database import get_db
from app.models.article import Article, ArticleStatus
from app.models.help_request import AssistanceLog
from app.models.recognition import ReferenceLetter
from app.models.user import User
from app.services.reference_letter_service import render_reference_letter_pdf

router = APIRouter(
    prefix="/volunteer/reference-letter",
    tags=["Reference Letters (Volunteer)"],
    dependencies=[Depends(require_role("volunteer"))],
)


@router.get("/{token}")
def download_reference_letter(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reference letter PDF ডাউনলোড"""
    letter = db.scalar(select(ReferenceLetter).where(ReferenceLetter.token == token))
    if not letter:
        raise HTTPException(404, "Reference letter পাওয়া যায়নি")
    if letter.volunteer_id != current_user.id:
        raise HTTPException(403, "এটা তোমার reference letter না")

    total_assistance_count = db.scalar(
        select(func.count(AssistanceLog.id)).where(AssistanceLog.volunteer_id == current_user.id)
    ) or 0
    published_article_count = db.scalar(
        select(func.count(Article.id)).where(
            Article.volunteer_id == current_user.id, Article.status == ArticleStatus.approved
        )
    ) or 0

    pdf_bytes = render_reference_letter_pdf(
        volunteer_name=current_user.name,
        issuer_name=letter.issuer.name,
        total_assistance_count=total_assistance_count,
        published_article_count=published_article_count,
        purpose=letter.purpose,
        issued_at=letter.issued_at,
        token=letter.token,
    )
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="reference_letter_{token}.pdf"'},
    )