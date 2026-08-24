from datetime import datetime

REFERENCE_LETTER_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page {{
        size: A4;
        margin: 40mm 25mm 25mm 25mm;
    }}
    body {{
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        color: #222222;
        line-height: 1.8;
        font-size: 14px;
        background-color: #ffffff;
    }}
    .letterhead {{
        text-align: center;
        border-bottom: 3px solid #1e3d2f;
        padding-bottom: 15px;
        margin-bottom: 35px;
    }}
    .letterhead h1 {{
        color: #1e3d2f;
        font-size: 28px;
        margin: 0 0 5px 0;
        letter-spacing: 1px;
    }}
    .letterhead .sub {{
        color: #555555;
        font-size: 13px;
        font-weight: 500;
    }}
    .date {{
        text-align: right;
        margin-bottom: 25px;
        font-weight: 500;
        color: #444444;
    }}
    .title {{
        text-align: center;
        font-weight: bold;
        color: #1e3d2f;
        margin-bottom: 30px;
        font-size: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }}
    .body-text {{
        text-align: justify;
        margin-bottom: 20px;
    }}
    .stats-box {{
        background-color: #f7f9f8;
        border-left: 4px solid #1e3d2f;
        padding: 15px 20px;
        margin: 20px 0;
    }}
    .stats-box ul {{
        margin: 0;
        padding-left: 20px;
    }}
    .stats-box li {{
        margin-bottom: 8px;
        color: #333333;
    }}
    .signature-section {{
        margin-top: 70px;
        page-break-inside: avoid;
    }}
    .signature-line {{
        border-top: 1px solid #333333;
        width: 220px;
        margin-bottom: 8px;
    }}
    .footer {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        font-size: 10px;
        color: #888888;
        text-align: center;
        border-top: 1px solid #eeeeee;
        padding-top: 10px;
    }}
</style>
</head>
<body>
    <div class="letterhead">
        <h1>Poribar Health</h1>
        <div class="sub">Joutuk Birodhi Andolon | Rangpur Division Rural Health Support Platform</div>
    </div>

    <div class="date">Date: {issued_date}</div>
    <div class="title">Reference Letter</div>

    <div class="body-text">
        <p>This is to certify that <strong>{volunteer_name}</strong> was actively associated with the <strong>Poribar Health</strong> platform as a dedicated volunteer, contributing significantly to rural healthcare initiatives in the Rangpur Division.</p>

        <p>A summary of their service contributions is outlined below:</p>
        
        <div class="stats-box">
            <ul>
                <li>Total Assistance Provided: <strong>{total_assistance_count}</strong> instances</li>
                <li>Primary Service Area: Rangpur Division</li>
                <li>Published Awareness Articles: <strong>{published_article_count}</strong> articles</li>
            </ul>
        </div>

        <p>{purpose_line}</p>

        <p>Throughout their tenure, we have witnessed their deep commitment, responsibility, and passion for community welfare. We greatly appreciate their service and wish them the utmost success in their future career and academic endeavors.</p>
    </div>

    <div class="signature-section">
        <div class="signature-line"></div>
        <div style="font-weight: bold; color: #1e3d2f;">{issuer_name}</div>
        <div style="font-size: 13px; color: #555;">Director, Poribar Health</div>
    </div>

    <div class="footer">
        Reference ID: {token} | This document is digitally generated and verifiable via the Poribar Health platform.
    </div>
</body>
</html>
"""


def render_reference_letter_html(
    volunteer_name: str,
    issuer_name: str,
    total_assistance_count: int,
    published_article_count: int,
    purpose: str | None,
    issued_at: datetime,
    token: str,
) -> str:
    purpose_line = (
        f"This reference letter is officially issued for the purpose of {purpose}."
        if purpose
        else "This reference letter is issued for all necessary official uses."
    )
    return REFERENCE_LETTER_TEMPLATE.format(
        volunteer_name=volunteer_name,
        issuer_name=issuer_name,
        total_assistance_count=total_assistance_count,
        published_article_count=published_article_count,
        purpose_line=purpose_line,
        issued_date=issued_at.strftime("%d %B, %Y"),
        token=token,
    )


def render_reference_letter_pdf(
    volunteer_name: str,
    issuer_name: str,
    total_assistance_count: int,
    published_article_count: int,
    purpose: str | None,
    issued_at: datetime,
    token: str,
) -> bytes:
    from weasyprint import HTML

    html_content = render_reference_letter_html(
        volunteer_name, issuer_name, total_assistance_count, published_article_count, purpose, issued_at, token
    )
    return HTML(string=html_content).write_pdf()