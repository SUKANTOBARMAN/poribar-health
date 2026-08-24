from datetime import datetime

CERTIFICATE_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page {{
        size: A4 landscape;
        margin: 0;
    }}
    body {{
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
        color: #333333;
        -webkit-print-color-adjust: exact;
    }}
    .certificate-container {{
        width: 1122px;
        height: 793px;
        position: relative;
        background: #ffffff;
        box-sizing: border-box;
        padding: 50px;
        border: 20px solid #1e3d2f;
    }}
    .inner-border {{
        width: 100%;
        height: 100%;
        border: 2px solid #d4af37;
        box-sizing: border-box;
        padding: 40px;
        text-align: center;
        position: relative;
    }}
    .header-logo {{
        font-size: 28px;
        font-weight: 700;
        color: #1e3d2f;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 5px;
    }}
    .sub-logo {{
        font-size: 14px;
        color: #666666;
        letter-spacing: 4px;
        text-transform: uppercase;
        margin-bottom: 30px;
    }}
    .title {{
        font-size: 42px;
        font-weight: 800;
        color: #d4af37;
        text-transform: uppercase;
        letter-spacing: 3px;
        margin-bottom: 20px;
    }}
    .presented-text {{
        font-size: 16px;
        color: #555555;
        font-style: italic;
        margin-bottom: 15px;
    }}
    .recipient-name {{
        font-size: 38px;
        font-weight: 700;
        color: #1e3d2f;
        border-bottom: 2px solid #d4af37;
        display: inline-block;
        padding-bottom: 5px;
        margin-bottom: 25px;
        min-width: 400px;
    }}
    .description {{
        font-size: 16px;
        line-height: 1.8;
        color: #444444;
        max-width: 800px;
        margin: 0 auto 50px auto;
    }}
    .footer-section {{
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 40px;
        padding: 0 50px;
    }}
    .signature-box {{
        text-align: center;
        width: 200px;
    }}
    .signature-line {{
        border-top: 1px solid #333333;
        margin-bottom: 8px;
    }}
    .signature-title {{
        font-size: 14px;
        font-weight: 600;
        color: #1e3d2f;
    }}
    .meta-info {{
        position: absolute;
        bottom: 20px;
        left: 50px;
        right: 50px;
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #888888;
        border-top: 1px solid #eee;
        padding-top: 10px;
    }}
</style>
</head>
<body>
    <div class="certificate-container">
        <div class="inner-border">
            <div class="header-logo">Poribar Health</div>
            <div class="sub-logo">A project by Movement Against Dowry</div>
            
            <div class="title">Certificate of Recognition</div>
            
            <div class="presented-text">This is proudly presented to</div>
            
            <div class="recipient-name">{volunteer_name}</div>
            
            <div class="description">
                In recognition of outstanding service as a <strong>{cert_type}</strong> 
                and for your dedicated voluntary contribution to rural healthcare development 
                and community welfare in the Rangpur Division.
            </div>
            
            <div class="footer-section" style="position: absolute; bottom: 60px; left: 40px; right: 40px;">
                <div style="float: left; text-align: center; width: 220px;">
                    <div style="border-top: 1px solid #444; margin-bottom: 5px;"></div>
                    <div style="font-size: 13px; font-weight: bold; color: #1e3d2f;">Coordinator</div>
                    <div style="font-size: 11px; color: #666;">Poribar Health</div>
                </div>
                <div style="float: right; text-align: center; width: 220px;">
                    <div style="border-top: 1px solid #444; margin-bottom: 5px;"></div>
                    <div style="font-size: 13px; font-weight: bold; color: #1e3d2f;">Director</div>
                    <div style="font-size: 11px; color: #666;">Joutuk Birodhi Andolon</div>
                </div>
            </div>

            <div class="meta-info">
                <span>Issue Date: {issued_date}</span>
                <span>Certificate ID: {token}</span>
            </div>
        </div>
    </div>
</body>
</html>
"""

CERT_TYPE_LABELS = {
    "appreciation": "Volunteer of Appreciation",
    "annual_service": "Annual Service Volunteer",
}


def render_certificate_html(volunteer_name: str, cert_type: str, issued_at: datetime, token: str) -> str:
    return CERTIFICATE_TEMPLATE.format(
        volunteer_name=volunteer_name,
        cert_type=CERT_TYPE_LABELS.get(cert_type, cert_type),
        issued_date=issued_at.strftime("%d %B, %Y"),
        token=token,
    )


def render_certificate_pdf(volunteer_name: str, cert_type: str, issued_at: datetime, token: str) -> bytes:
    from weasyprint import HTML  
    html_content = render_certificate_html(volunteer_name, cert_type, issued_at, token)
    return HTML(string=html_content).write_pdf()