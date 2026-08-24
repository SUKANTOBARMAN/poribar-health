def render_impact_report_html(report: dict) -> str:
    period_label = f"{report.get('year', '')}" if not report.get("month") else f"{report.get('month')}, {report.get('year', '')}"

    requests_by_type_rows = "".join(
        f"<tr><td style='padding: 10px 15px; border-bottom: 1px solid #eef2f6;'>{k}</td><td style='padding: 10px 15px; border-bottom: 1px solid #eef2f6; text-align: center; font-weight: bold; color: #1e293b;'>{v}</td></tr>" 
        for k, v in report.get("requests_by_type", {}).items()
    ) or "<tr><td colspan='2' style='text-align: center; padding: 15px; color: #94a3b8;'>No data available for this period</td></tr>"

    top_volunteers_rows = ""
    for v in report.get("top_volunteers", []):
        if isinstance(v, dict):
            name = v.get("name", "Unknown")
            count = v.get("resolved_count", 0)
        else:
            name = getattr(v, "name", "Unknown")
            count = getattr(v, "resolved_count", 0)
        top_volunteers_rows += f"<tr><td style='padding: 10px 15px; border-bottom: 1px solid #eef2f6;'>{name}</td><td style='padding: 10px 15px; border-bottom: 1px solid #eef2f6; text-align: center; font-weight: bold; color: #047857;'>{count}</td></tr>"
    
    if not top_volunteers_rows:
        top_volunteers_rows = "<tr><td colspan='2' style='text-align: center; padding: 15px; color: #94a3b8;'>No volunteer records found</td></tr>"

    total_help_requests = report.get("total_help_requests", 0)
    total_resolved = report.get("total_resolved", 0)
    total_articles_published = report.get("total_articles_published", 0)
    total_new_volunteers = report.get("total_new_volunteers", 0)

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page {{ 
        size: A4; 
        margin: 20mm; 
    }}
    body {{ 
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
        color: #1e293b; 
        line-height: 1.5;
        font-size: 13px;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
    }}
    .header-container {{
        border-bottom: 2px solid #047857;
        padding-bottom: 15px;
        margin-bottom: 25px;
    }}
    .brand-title {{
        font-size: 22px;
        font-weight: 800;
        color: #047857;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin: 0;
    }}
    .report-title {{
        font-size: 14px;
        font-weight: 600;
        color: #64748b;
        margin-top: 5px;
    }}
    
    /* Modern Summary Grid Tables */
    .summary-table {{
        width: 100%;
        border-collapse: separate;
        border-spacing: 10px;
        margin-left: -10px;
        margin-right: -10px;
        margin-bottom: 25px;
    }}
    .summary-box {{
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        width: 25%;
    }}
    .summary-number {{
        font-size: 22px;
        font-weight: 800;
        color: #047857;
        margin-bottom: 4px;
    }}
    .summary-label {{
        font-size: 11px;
        color: #475569;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.5px;
    }}

    /* Section Headings */
    .section-title {{
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
        background-color: #f1f5f9;
        padding: 8px 12px;
        border-left: 4px solid #047857;
        margin-top: 25px;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }}

    /* Structured Data Tables */
    .content-table {{
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        overflow: hidden;
    }}
    .content-table th {{
        background-color: #047857;
        color: #ffffff;
        text-align: left;
        padding: 10px 15px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
    }}
    .content-table tr:nth-child(even) {{
        background-color: #f8fafc;
    }}

    /* Footer */
    .footer {{
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        font-size: 10px;
        color: #94a3b8;
        text-align: center;
        border-top: 1px solid #e2e8f0;
        padding-top: 8px;
    }}
</style>
</head>
<body>

    <div class="header-container">
        <div class="brand-title">Poribar Health &mdash; Impact Report</div>
        <div class="report-title">Reporting Period: <strong>{period_label}</strong></div>
    </div>

    <!-- Summary Metrics Cards -->
    <table class="summary-table">
        <tr>
            <td class="summary-box">
                <div class="summary-number">{total_help_requests}</div>
                <div class="summary-label">Total Requests</div>
            </td>
            <td class="summary-box">
                <div class="summary-number">{total_resolved}</div>
                <div class="summary-label">Resolved Cases</div>
            </td>
            <td class="summary-box">
                <div class="summary-number">{total_articles_published}</div>
                <div class="summary-label">Articles</div>
            </td>
            <td class="summary-box">
                <div class="summary-number">{total_new_volunteers}</div>
                <div class="summary-label">New Volunteers</div>
            </td>
        </tr>
    </table>

    <div class="section-title">Requests Breakdown by Category</div>
    <table class="content-table">
        <thead>
            <tr>
                <th>Category Type</th>
                <th style="width: 120px; text-align: center;">Count</th>
            </tr>
        </thead>
        <tbody>
            {requests_by_type_rows}
        </tbody>
    </table>

    <div class="section-title">Top Performing Volunteers</div>
    <table class="content-table">
        <thead>
            <tr>
                <th>Volunteer Name</th>
                <th style="width: 150px; text-align: center;">Resolved Cases</th>
            </tr>
        </thead>
        <tbody>
            {top_volunteers_rows}
        </tbody>
    </table>

    <div class="footer">
        Poribar Health Platform &bull; Confidential Administrative Impact Report &bull; Generated Automatically
    </div>

</body>
</html>
"""


def render_impact_report_pdf(report: dict) -> bytes:
    from weasyprint import HTML

    html_content = render_impact_report_html(report)
    return HTML(string=html_content).write_pdf()