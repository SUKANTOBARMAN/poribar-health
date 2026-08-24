from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.database import get_db
from app.schemas.analytics import ImpactReportOut
from app.services.analytics_service import get_impact_report
from app.services.report_service import render_impact_report_pdf

router = APIRouter(
    prefix="/admin",
    tags=["Admin Reports"],
    dependencies=[Depends(require_role("super_admin"))],
)


@router.get("/impact-report", response_model=ImpactReportOut)
def impact_report(
    year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
    month: int | None = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
):
    """Impact report (exportable PDF) — doc: GET /admin/impact-report?year=&month="""
    return get_impact_report(db, year, month)


@router.get("/reports/export")
def export_report(
    format: str = Query("pdf"),
    year: int = Query(default_factory=lambda: datetime.now(timezone.utc).year),
    month: int | None = Query(None, ge=1, le=12),
    db: Session = Depends(get_db),
):
    """PDF রিপোর্ট ডাউনলোড — doc: GET /admin/reports/export?format=pdf"""
    report = get_impact_report(db, year, month)
    if format != "pdf":
        return report  # ভবিষ্যতে format=excel যোগ করা যাবে (openpyxl দিয়ে)

    pdf_bytes = render_impact_report_pdf(report)
    period = f"{year}" if not month else f"{year}-{month:02d}"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="impact_report_{period}.pdf"'},
    )