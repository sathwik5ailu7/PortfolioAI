import io
import qrcode
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def generate_qr_code_bytes(data_url: str) -> bytes:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=6,
        border=2,
    )
    qr.add_data(data_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1e1b4b", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf.getvalue()

def generate_portfolio_pdf(profile_data: Dict[str, Any], public_url: str = "", design: Dict[str, Any] = None) -> bytes:
    """Generate high-resolution printable Student Portfolio PDF document."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    design = design or {}
    pri_hex = design.get("primary_color") or "#4f46e5"
    if not pri_hex.startswith("#"):
        pri_hex = "#4f46e5"
    pri_color = colors.HexColor(pri_hex)

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        leading=26,
        textColor=pri_color,
        fontName="Helvetica-Bold"
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#4b5563"),
        fontName="Helvetica"
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=13,
        leading=17,
        textColor=pri_color,
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1f2937"),
        fontName="Helvetica"
    )
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor("#374151"),
        fontName="Helvetica"
    )

    story = []

    # Header section
    name = profile_data.get("name") or "Student Candidate"
    pro_title = profile_data.get("professional_title") or "Software Engineering Candidate"
    email = profile_data.get("email") or ""
    phone = profile_data.get("phone") or ""
    location = profile_data.get("location") or ""
    
    story.append(Paragraph(name, title_style))
    story.append(Paragraph(pro_title, subtitle_style))
    contact_info = " | ".join(filter(None, [email, phone, location]))
    if contact_info:
        story.append(Paragraph(contact_info, body_style))

    # Social links
    soc = profile_data.get("social_links", {})
    links_list = []
    if soc.get("linkedin"): links_list.append(f"LinkedIn: {soc.get('linkedin')}")
    if soc.get("github"): links_list.append(f"GitHub: {soc.get('github')}")
    if public_url: links_list.append(f"Live Portfolio: {public_url}")
    if links_list:
        story.append(Spacer(1, 4))
        story.append(Paragraph(" • ".join(links_list), ParagraphStyle('Links', parent=body_style, textColor=pri_color)))

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#e2e8f0"), spaceBefore=4, spaceAfter=8))

    # About Me
    about = profile_data.get("about_me") or ""
    if about:
        story.append(Paragraph("ABOUT ME", section_heading))
        story.append(Paragraph(about, body_style))
        story.append(Spacer(1, 6))

    # Technical Skills
    skills = profile_data.get("skills", {})
    all_skills_chunks = []
    if skills.get("programming_languages"):
        all_skills_chunks.append(f"<b>Languages:</b> {', '.join(skills.get('programming_languages'))}")
    if skills.get("frameworks"):
        all_skills_chunks.append(f"<b>Frameworks:</b> {', '.join(skills.get('frameworks'))}")
    if skills.get("databases"):
        all_skills_chunks.append(f"<b>Databases:</b> {', '.join(skills.get('databases'))}")
    if skills.get("tools"):
        all_skills_chunks.append(f"<b>Developer Tools:</b> {', '.join(skills.get('tools'))}")
    if skills.get("soft_skills"):
        all_skills_chunks.append(f"<b>Soft Skills:</b> {', '.join(skills.get('soft_skills'))}")

    if all_skills_chunks:
        story.append(Paragraph("TECHNICAL PROFICIENCIES", section_heading))
        for item in all_skills_chunks:
            story.append(Paragraph(f"• {item}", bullet_style))
        story.append(Spacer(1, 6))

    # Projects
    projects = profile_data.get("projects", [])
    if projects:
        story.append(Paragraph("KEY PROJECTS", section_heading))
        for p in projects:
            p_title = p.get("title", "")
            techs = ", ".join(p.get("technologies", []))
            p_desc = p.get("description", "")
            story.append(Paragraph(f"<b>{p_title}</b> {f'[{techs}]' if techs else ''}", body_style))
            if p_desc:
                story.append(Paragraph(p_desc, bullet_style))
            p_links = []
            if p.get("github_url"): p_links.append(f"GitHub: {p.get('github_url')}")
            if p.get("live_demo_url"): p_links.append(f"Demo: {p.get('live_demo_url')}")
            if p_links:
                story.append(Paragraph(" | ".join(p_links), ParagraphStyle('PProjLinks', parent=bullet_style, textColor=pri_color)))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))

    # Experience
    exp = profile_data.get("experience", [])
    if exp:
        story.append(Paragraph("EXPERIENCE & INTERNSHIPS", section_heading))
        for e in exp:
            company = e.get("company", "")
            pos = e.get("position", "")
            duration = e.get("duration", "")
            resp = e.get("responsibilities", "")
            story.append(Paragraph(f"<b>{pos}</b> — {company} {f'({duration})' if duration else ''}", body_style))
            if resp:
                story.append(Paragraph(f"• {resp}", bullet_style))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))

    # Education
    edu = profile_data.get("education", [])
    if edu:
        story.append(Paragraph("EDUCATION", section_heading))
        for ed in edu:
            inst = ed.get("institution", "")
            deg = ed.get("degree", "")
            branch = ed.get("branch", "")
            years = f"{ed.get('start_year', '')} - {ed.get('graduation_year', '')}".strip(" -")
            cgpa = ed.get("cgpa_or_percentage", "")
            details = ", ".join(filter(None, [branch, years, cgpa]))
            story.append(Paragraph(f"<b>{deg}</b> — {inst}", body_style))
            if details:
                story.append(Paragraph(details, bullet_style))
            story.append(Spacer(1, 4))
        story.append(Spacer(1, 4))

    # Certifications & Achievements
    certs = profile_data.get("certifications", [])
    achs = profile_data.get("achievements", [])
    if certs or achs:
        story.append(Paragraph("HONORS, CERTIFICATIONS & ACHIEVEMENTS", section_heading))
        for c in certs:
            story.append(Paragraph(f"• <b>Cert:</b> {c.get('name', '')} ({c.get('issuing_organization', '')}) {c.get('date', '')}", bullet_style))
        for a in achs:
            story.append(Paragraph(f"• <b>Achievement:</b> {a.get('title', '')} — {a.get('description', '')}", bullet_style))
        story.append(Spacer(1, 6))

    # Append QR code if public url is available
    if public_url:
        try:
            qr_bytes = generate_qr_code_bytes(public_url)
            qr_stream = io.BytesIO(qr_bytes)
            qr_img = RLImage(qr_stream, width=1.1*inch, height=1.1*inch)
            qr_table = Table([[Paragraph(f"Scan to view online live interactive portfolio:<br/><font color='#4f46e5'>{public_url}</font>", bullet_style), qr_img]], colWidths=[5.5*inch, 1.5*inch])
            qr_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
                ('PADDING', (0,0), (-1,-1), 8),
            ]))
            story.append(Spacer(1, 8))
            story.append(qr_table)
        except Exception:
            pass

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

def generate_analysis_report_pdf(analysis_data: Dict[str, Any], candidate_name: str = "Student Candidate") -> bytes:
    """Generate printable PDF for Resume ATS Analysis & Feedback Report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()

    header_style = ParagraphStyle('RepHeader', parent=styles['Heading1'], fontSize=20, leading=24, textColor=colors.HexColor("#1e1b4b"))
    sub_style = ParagraphStyle('RepSub', parent=styles['Normal'], fontSize=11, leading=15, textColor=colors.HexColor("#4b5563"))
    sec_style = ParagraphStyle('RepSec', parent=styles['Heading2'], fontSize=13, leading=17, textColor=colors.HexColor("#312e81"), spaceBefore=10, spaceAfter=4)
    item_style = ParagraphStyle('RepItem', parent=styles['Normal'], fontSize=9.5, leading=14, textColor=colors.HexColor("#1f2937"))

    story = []
    story.append(Paragraph("PortfolioAI • Resume & ATS Diagnostic Report", header_style))
    story.append(Paragraph(f"Analysis for: <b>{candidate_name}</b>", sub_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#6366f1"), spaceBefore=6, spaceAfter=10))

    # Score Box
    overall = analysis_data.get("overall_score", 80)
    ats = analysis_data.get("ats_score", 75)
    score_table = Table([
        [
            Paragraph(f"<font size='14'><b>Overall Quality:</b></font><br/><font size='22' color='#4338ca'><b>{overall}/100</b></font>", item_style),
            Paragraph(f"<font size='14'><b>Estimated ATS Score:</b></font><br/><font size='22' color='#059669'><b>{ats}/100</b></font>", item_style)
        ]
    ], colWidths=[3.5*inch, 3.5*inch])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('PADDING', (0,0), (-1,-1), 10)
    ]))
    story.append(score_table)
    story.append(Spacer(1, 6))

    disclaimer = analysis_data.get("ats_disclaimer", "ATS scores are AI-generated estimates.")
    story.append(Paragraph(f"<i>Notice: {disclaimer}</i>", ParagraphStyle('Discl', parent=item_style, fontSize=8, textColor=colors.HexColor("#64748b"))))
    story.append(Spacer(1, 10))

    # Strengths
    story.append(Paragraph("Identified Strengths", sec_style))
    for s in analysis_data.get("strengths", []):
        story.append(Paragraph(f"• {s}", item_style))
    story.append(Spacer(1, 8))

    # Weaknesses
    story.append(Paragraph("Areas for Improvement", sec_style))
    for w in analysis_data.get("weaknesses", []):
        story.append(Paragraph(f"• {w}", item_style))
    story.append(Spacer(1, 8))

    # Missing Keywords
    keywords = analysis_data.get("missing_keywords", [])
    if keywords:
        story.append(Paragraph("High-Impact Keywords to Consider Adding", sec_style))
        story.append(Paragraph(f"<b>Keywords:</b> {', '.join(keywords)}", item_style))
        story.append(Spacer(1, 8))

    # Recommendations
    story.append(Paragraph("Actionable Recommendations", sec_style))
    for r in analysis_data.get("recommendations", []):
        story.append(Paragraph(f"• {r}", item_style))
    story.append(Spacer(1, 8))

    # Job match
    jm = analysis_data.get("job_match", {})
    if jm:
        story.append(Paragraph("Job Role Alignment Insights", sec_style))
        if jm.get("compatibility_insights"):
            story.append(Paragraph(f"{jm.get('compatibility_insights')}", item_style))
        if jm.get("missing_skills"):
            story.append(Paragraph(f"<b>Suggested Skill Additions:</b> {', '.join(jm.get('missing_skills'))}", item_style))

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()
