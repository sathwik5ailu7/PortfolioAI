import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, Request, status
from app.config.settings import settings
from app.database.connection import db_manager
from app.middleware.auth import get_current_user, get_current_admin
from app.schemas.schemas import (
    UserRegister, UserLogin, UserResponse, TokenResponse,
    StudentProfile, PortfolioDesign, PortfolioSaveRequest, PublishToggleRequest,
    ResumeAnalysisRequest, SkillGapRequest, InterviewPrepRequest, SummaryGenerationRequest
)
from app.utils.security import hash_password, verify_password, get_utc_now
from app.middleware.auth import create_access_token
from app.services.resume_parser import extract_text_from_pdf, rule_based_extract
from app.services.ai_service import gemini_service
from app.services.pdf_service import generate_portfolio_pdf, generate_analysis_report_pdf, generate_qr_code_bytes

router = APIRouter()

# ----------------- AUTHENTICATION -----------------

@router.post("/auth/register", response_model=TokenResponse)
def register(user_data: UserRegister):
    users_col = db_manager.get_collection("users")
    
    # Check if email or username exists
    if users_col.find_one({"email": user_data.email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    clean_username = user_data.username.lower().strip()
    if users_col.find_one({"username": clean_username}):
        raise HTTPException(status_code=400, detail="This username is already taken. Please pick another.")

    user_id = str(uuid.uuid4())
    now = get_utc_now()
    new_user = {
        "_id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "username": clean_username,
        "password_hash": hash_password(user_data.password),
        "role": "student",
        "is_active": True,
        "created_at": now
    }
    users_col.insert_one(new_user)

    # Initialize empty portfolio draft for user
    portfolios_col = db_manager.get_collection("portfolios")
    portfolios_col.insert_one({
        "_id": str(uuid.uuid4()),
        "student_id": user_id,
        "username": clean_username,
        "is_published": False,
        "views_count": 0,
        "design": PortfolioDesign().model_dump(),
        "draft_profile": {
            "name": user_data.name,
            "email": user_data.email,
            "professional_title": "Aspiring Engineer / Developer",
            "about_me": "",
            "skills": {"programming_languages": [], "frameworks": [], "databases": [], "tools": [], "soft_skills": []},
            "education": [],
            "projects": [],
            "certifications": [],
            "experience": [],
            "achievements": [],
            "social_links": {"linkedin": "", "github": "", "website": ""}
        },
        "published_profile": None,
        "updated_at": now
    })

    token = create_access_token({"sub": user_id, "username": clean_username, "role": "student"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": user_data.name,
            "email": user_data.email,
            "username": clean_username,
            "role": "student",
            "is_active": True,
            "created_at": now
        }
    }

@router.post("/auth/login", response_model=TokenResponse)
def login(login_data: UserLogin):
    users_col = db_manager.get_collection("users")
    user = users_col.find_one({"email": login_data.email})
    
    # Auto-seed default admin if configured and logging in
    if not user and login_data.email == settings.ADMIN_DEFAULT_EMAIL:
        admin_id = str(uuid.uuid4())
        user = {
            "_id": admin_id,
            "name": "Platform Administrator",
            "email": settings.ADMIN_DEFAULT_EMAIL,
            "username": "admin",
            "password_hash": hash_password(settings.ADMIN_DEFAULT_PASSWORD),
            "role": "admin",
            "is_active": True,
            "created_at": get_utc_now()
        }
        users_col.insert_one(user)

    if not user or not verify_password(login_data.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact administrator.")

    token = create_access_token({"sub": user["_id"], "username": user["username"], "role": user.get("role", "student")})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["_id"],
            "name": user["name"],
            "email": user["email"],
            "username": user["username"],
            "role": user.get("role", "student"),
            "is_active": user.get("is_active", True),
            "created_at": user.get("created_at", "")
        }
    }

@router.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "username": current_user["username"],
        "role": current_user.get("role", "student"),
        "is_active": current_user.get("is_active", True),
        "created_at": current_user.get("created_at", "")
    }

# ----------------- RESUME EXTRACTION WORKFLOW -----------------

@router.post("/resume/upload-and-extract")
async def upload_and_extract_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume file size exceeds maximum limit of 10MB.")

    # Step 1: Extract text with PyMuPDF
    try:
        raw_text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Uploaded PDF contains no extractable text. Please ensure it is not a scanned image.")

    # Save resume document record
    resumes_col = db_manager.get_collection("resumes")
    resume_id = str(uuid.uuid4())
    resumes_col.insert_one({
        "_id": resume_id,
        "student_id": current_user["_id"],
        "filename": file.filename,
        "raw_text": raw_text,
        "created_at": get_utc_now()
    })

    # Step 2: Extract structured details via Gemini AI (with fallback)
    extracted_data = gemini_service.extract_resume_info(raw_text)

    # Save initial extraction to student's portfolio draft
    portfolios_col = db_manager.get_collection("portfolios")
    portfolios_col.update_one(
        {"student_id": current_user["_id"]},
        {"$set": {"last_extracted_data": extracted_data, "updated_at": get_utc_now()}},
        upsert=True
    )

    return {
        "resume_id": resume_id,
        "filename": file.filename,
        "raw_text_snippet": raw_text[:500],
        "extracted_data": extracted_data
    }

# ----------------- PROFILE PICTURE UPLOAD -----------------

@router.post("/profile/upload-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a profile picture (JPEG/PNG/WEBP). Stored as base64 in draft_profile."""
    allowed_types = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are supported.")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB max
        raise HTTPException(status_code=400, detail="Profile picture must be under 5MB.")

    import base64
    b64 = base64.b64encode(content).decode("utf-8")
    mime = file.content_type
    data_url = f"data:{mime};base64,{b64}"

    portfolios_col = db_manager.get_collection("portfolios")
    portfolios_col.update_one(
        {"student_id": current_user["_id"]},
        {"$set": {"draft_profile.profile_picture": data_url, "updated_at": get_utc_now()}},
        upsert=True
    )
    return {"message": "Profile picture uploaded successfully.", "profile_picture": data_url}

# ----------------- STUDENT PORTFOLIO BUILDER & PROFILE -----------------

@router.get("/portfolio/draft")
def get_student_portfolio_draft(current_user: dict = Depends(get_current_user)):
    portfolios_col = db_manager.get_collection("portfolios")
    portfolio = portfolios_col.find_one({"student_id": current_user["_id"]})
    if not portfolio:
        # Default empty portfolio
        return {
            "username": current_user["username"],
            "is_published": False,
            "views_count": 0,
            "design": PortfolioDesign().model_dump(),
            "profile_data": {
                "name": current_user["name"],
                "email": current_user["email"],
                "professional_title": "",
                "about_me": "",
                "skills": {"programming_languages": [], "frameworks": [], "databases": [], "tools": [], "soft_skills": []},
                "education": [],
                "projects": [],
                "certifications": [],
                "experience": [],
                "achievements": [],
                "social_links": {"linkedin": "", "github": "", "website": ""}
            }
        }
    
    return {
        "id": portfolio["_id"],
        "username": portfolio.get("username", current_user["username"]),
        "is_published": portfolio.get("is_published", False),
        "views_count": portfolio.get("views_count", 0),
        "design": portfolio.get("design", PortfolioDesign().model_dump()),
        "profile_data": portfolio.get("draft_profile") or {},
        "published_profile": portfolio.get("published_profile"),
        "updated_at": portfolio.get("updated_at")
    }

@router.post("/portfolio/save-draft")
def save_portfolio_draft(data: PortfolioSaveRequest, current_user: dict = Depends(get_current_user)):
    portfolios_col = db_manager.get_collection("portfolios")
    now = get_utc_now()
    profile_data = data.profile_data.model_dump()
    updates = {
        "username": current_user["username"],
        "design": data.design.model_dump(),
        "draft_profile": profile_data,
        "updated_at": now
    }

    portfolio = portfolios_col.find_one({"student_id": current_user["_id"]})
    if portfolio and portfolio.get("is_published", False):
        updates["published_profile"] = profile_data
    
    portfolios_col.update_one(
        {"student_id": current_user["_id"]},
        {"$set": updates},
        upsert=True
    )
    return {"message": "Draft saved successfully.", "updated_at": now}

@router.post("/portfolio/publish")
def publish_portfolio(req: PublishToggleRequest, current_user: dict = Depends(get_current_user)):
    portfolios_col = db_manager.get_collection("portfolios")
    portfolio = portfolios_col.find_one({"student_id": current_user["_id"]})
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    now = get_utc_now()
    if req.is_published:
        # Copy current draft to published version
        draft_profile = portfolio.get("draft_profile") or {}
        portfolios_col.update_one(
            {"student_id": current_user["_id"]},
            {
                "$set": {
                    "is_published": True,
                    "published_profile": draft_profile,
                    "published_at": now,
                    "updated_at": now
                }
            }
        )
        return {
            "message": "Portfolio published live!",
            "is_published": True,
            "public_url": f"/portfolio/{current_user['username']}"
        }
    else:
        portfolios_col.update_one(
            {"student_id": current_user["_id"]},
            {"$set": {"is_published": False, "updated_at": now}}
        )
        return {"message": "Portfolio unpublished.", "is_published": False}

# ----------------- PUBLIC PORTFOLIO ACCESS -----------------

@router.get("/public/portfolio/{username}")
def get_public_portfolio(username: str):
    clean_username = username.lower().strip()
    portfolios_col = db_manager.get_collection("portfolios")
    portfolio = portfolios_col.find_one({"username": clean_username})
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    if not portfolio.get("is_published", False):
        raise HTTPException(status_code=403, detail="This portfolio is private or not yet published.")

    # Track view analytics
    portfolios_col.update_one({"_id": portfolio["_id"]}, {"$inc": {"views_count": 1}})
    
    analytics_col = db_manager.get_collection("portfolio_analytics")
    analytics_col.insert_one({
        "_id": str(uuid.uuid4()),
        "portfolio_id": portfolio["_id"],
        "username": clean_username,
        "viewed_at": get_utc_now()
    })

    return {
        "username": clean_username,
        "design": portfolio.get("design", PortfolioDesign().model_dump()),
        "profile": portfolio.get("published_profile") or portfolio.get("draft_profile"),
        "views_count": portfolio.get("views_count", 0) + 1,
        "published_at": portfolio.get("published_at")
    }

# ----------------- PDF EXPORT & QR CODE -----------------

@router.get("/portfolio/{username}/pdf")
def download_portfolio_pdf(username: str):
    clean_username = username.lower().strip()
    portfolios_col = db_manager.get_collection("portfolios")
    portfolio = portfolios_col.find_one({"username": clean_username})
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found.")

    profile = portfolio.get("published_profile") or portfolio.get("draft_profile") or {}
    public_url = f"{settings.FRONTEND_URL}/portfolio/{clean_username}"
    
    pdf_bytes = generate_portfolio_pdf(profile, public_url=public_url)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={clean_username}_portfolio.pdf"}
    )

@router.get("/portfolio/{username}/qrcode")
def get_portfolio_qrcode(username: str, request: Request):
    clean_username = username.lower().strip()
    
    # Check if a custom host was used in the request (e.g. mobile device scanning local IP)
    host = request.headers.get("host", "")
    if host and ":" in host:
        hostname = host.split(":")[0]
        # If client requested from a local IP (e.g. 192.168.x.x), encode that IP into the QR code
        if hostname not in ["localhost", "127.0.0.1", "testserver"]:
            public_url = f"http://{hostname}:5173/portfolio/{clean_username}"
        else:
            # Attempt to auto-detect local Wi-Fi / LAN IP so scanning phone doesn't fail on localhost
            import socket
            try:
                s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                s.connect(("8.8.8.8", 80))
                local_ip = s.getsockname()[0]
                s.close()
                public_url = f"http://{local_ip}:5173/portfolio/{clean_username}"
            except Exception:
                public_url = f"{settings.FRONTEND_URL}/portfolio/{clean_username}"
    else:
        public_url = f"{settings.FRONTEND_URL}/portfolio/{clean_username}"
        
    qr_bytes = generate_qr_code_bytes(public_url)
    return Response(content=qr_bytes, media_type="image/png")

# ----------------- RESUME ANALYZER & ATS SCORE -----------------

@router.post("/ai/resume-analyzer")
def analyze_resume_endpoint(req: ResumeAnalysisRequest, current_user: dict = Depends(get_current_user)):
    resume_text = req.resume_text
    
    if not resume_text:
        # Fetch latest uploaded resume for this student
        resumes_col = db_manager.get_collection("resumes")
        latest_res = resumes_col.find({"student_id": current_user["_id"]}).sort("created_at", -1).limit(1)
        res_list = list(latest_res)
        if res_list:
            resume_text = res_list[0].get("raw_text", "")
        else:
            # Check draft profile as fallback
            portfolios_col = db_manager.get_collection("portfolios")
            p = portfolios_col.find_one({"student_id": current_user["_id"]})
            if p and p.get("draft_profile"):
                resume_text = str(p.get("draft_profile"))
            else:
                raise HTTPException(status_code=400, detail="No resume uploaded yet. Please upload a resume first.")

    result = gemini_service.analyze_resume(resume_text, req.target_job_description)
    
    # Save analysis report
    analyses_col = db_manager.get_collection("resume_analyses")
    report_id = str(uuid.uuid4())
    analysis_record = {
        "_id": report_id,
        "student_id": current_user["_id"],
        "student_name": current_user["name"],
        "overall_score": result.get("overall_score"),
        "ats_score": result.get("ats_score"),
        "job_description_provided": bool(req.target_job_description),
        "result": result,
        "created_at": get_utc_now()
    }
    analyses_col.insert_one(analysis_record)

    return {"report_id": report_id, **result}

@router.get("/ai/resume-analyzer/history")
def get_resume_analysis_history(current_user: dict = Depends(get_current_user)):
    analyses_col = db_manager.get_collection("resume_analyses")
    cursor = analyses_col.find({"student_id": current_user["_id"]}).sort("created_at", -1).limit(10)
    reports = list(cursor)
    return reports

@router.get("/ai/resume-analyzer/{report_id}/pdf")
def download_analysis_report_pdf(report_id: str, current_user: dict = Depends(get_current_user)):
    analyses_col = db_manager.get_collection("resume_analyses")
    record = analyses_col.find_one({"_id": report_id, "student_id": current_user["_id"]})
    if not record:
        raise HTTPException(status_code=404, detail="Analysis report not found.")

    pdf_bytes = generate_analysis_report_pdf(record["result"], candidate_name=record.get("student_name", "Student"))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=resume_analysis_{report_id[:8]}.pdf"}
    )

# ----------------- SKILL GAP ANALYZER -----------------

@router.post("/ai/skill-gap")
def analyze_skill_gap_endpoint(req: SkillGapRequest, current_user: dict = Depends(get_current_user)):
    portfolios_col = db_manager.get_collection("portfolios")
    portfolio = portfolios_col.find_one({"student_id": current_user["_id"]})
    
    existing_skills = []
    if portfolio and portfolio.get("draft_profile"):
        sk = portfolio["draft_profile"].get("skills", {})
        for category in ["programming_languages", "frameworks", "databases", "tools"]:
            existing_skills.extend(sk.get(category, []))

    result = gemini_service.analyze_skill_gap(existing_skills, req.target_role, req.experience_level or "Entry Level")
    return result

# ----------------- PROFESSIONAL SUMMARY GENERATOR -----------------

@router.post("/ai/generate-summary")
def generate_summary_endpoint(req: SummaryGenerationRequest, current_user: dict = Depends(get_current_user)):
    portfolios_col = db_manager.get_collection("portfolios")
    portfolio = portfolios_col.find_one({"student_id": current_user["_id"]})
    
    student_data = req.student_data
    if not student_data:
        student_data = portfolio.get("draft_profile") if portfolio else {}
    if not student_data.get("name"):
        student_data["name"] = current_user["name"]

    summary_text = gemini_service.generate_professional_summary(student_data, style=req.style)
    return {"style": req.style, "summary": summary_text}

# ----------------- INTERVIEW PREPARATION -----------------

@router.post("/ai/interview-prep")
def interview_prep_endpoint(req: InterviewPrepRequest, current_user: dict = Depends(get_current_user)):
    questions = gemini_service.generate_interview_prep(
        target_role=req.target_role,
        experience_level=req.experience_level,
        difficulty=req.difficulty
    )
    
    sessions_col = db_manager.get_collection("interview_sessions")
    session_id = str(uuid.uuid4())
    sessions_col.insert_one({
        "_id": session_id,
        "student_id": current_user["_id"],
        "target_role": req.target_role,
        "difficulty": req.difficulty,
        "questions_count": len(questions),
        "created_at": get_utc_now()
    })

    return {
        "session_id": session_id,
        "target_role": req.target_role,
        "difficulty": req.difficulty,
        "questions": questions
    }

# ----------------- STUDENT DASHBOARD METRICS -----------------

@router.get("/student/dashboard-stats")
def get_student_dashboard_stats(current_user: dict = Depends(get_current_user)):
    portfolios_col = db_manager.get_collection("portfolios")
    resumes_col = db_manager.get_collection("resumes")
    analyses_col = db_manager.get_collection("resume_analyses")

    portfolio = portfolios_col.find_one({"student_id": current_user["_id"]}) or {}
    draft = portfolio.get("draft_profile") or {}
    skills = draft.get("skills") or {}
    
    total_skills = sum(len(skills.get(cat, [])) for cat in ["programming_languages", "frameworks", "databases", "tools", "soft_skills"])
    total_projects = len(draft.get("projects") or [])
    total_certifications = len(draft.get("certifications") or [])
    
    # Calculate profile completion percentage
    completion_points = 0
    if draft.get("name"): completion_points += 10
    if draft.get("email"): completion_points += 10
    if draft.get("professional_title"): completion_points += 10
    if draft.get("about_me"): completion_points += 15
    if total_skills >= 4: completion_points += 15
    if total_projects >= 1: completion_points += 20
    if len(draft.get("education") or []) >= 1: completion_points += 10
    if total_certifications >= 1: completion_points += 5
    if draft.get("social_links", {}).get("github") or draft.get("social_links", {}).get("linkedin"): completion_points += 5
    completion_percentage = min(100, completion_points)

    latest_analysis = list(analyses_col.find({"student_id": current_user["_id"]}).sort("created_at", -1).limit(1))
    latest_ats_score = latest_analysis[0].get("ats_score", 0) if latest_analysis else None
    
    resumes_count = resumes_col.count_documents({"student_id": current_user["_id"]})

    return {
        "user_name": current_user["name"],
        "username": current_user["username"],
        "profile_completion_percentage": completion_percentage,
        "total_skills": total_skills,
        "total_projects": total_projects,
        "total_certifications": total_certifications,
        "resume_uploaded": resumes_count > 0,
        "latest_ats_score": latest_ats_score,
        "portfolio_published": portfolio.get("is_published", False),
        "views_count": portfolio.get("views_count", 0),
        "public_url": f"/portfolio/{current_user['username']}" if portfolio.get("is_published") else None,
        "recent_recommendations": [
            "Add quantitative metrics (e.g. % performance increase) to your primary project.",
            "Complete your GitHub and LinkedIn links to boost recruiter engagement.",
            "Run Skill Gap Analyzer for 'Full Stack Engineer' to tailor missing tools."
        ]
    }

# ----------------- ADMIN DASHBOARD -----------------

@router.get("/admin/stats")
def get_admin_stats(admin_user: dict = Depends(get_current_admin)):
    users_col = db_manager.get_collection("users")
    portfolios_col = db_manager.get_collection("portfolios")
    analyses_col = db_manager.get_collection("resume_analyses")
    resumes_col = db_manager.get_collection("resumes")

    total_users = users_col.count_documents({})
    total_portfolios = portfolios_col.count_documents({})
    published_portfolios = portfolios_col.count_documents({"is_published": True})
    total_analyses = analyses_col.count_documents({})
    total_resumes = resumes_col.count_documents({})

    all_portfolios = list(portfolios_col.find({}))
    total_views = sum(p.get("views_count", 0) for p in all_portfolios)

    return {
        "total_users": total_users,
        "total_portfolios": total_portfolios,
        "published_portfolios": published_portfolios,
        "total_analyses": total_analyses,
        "total_resumes": total_resumes,
        "total_portfolio_views": total_views
    }

@router.get("/admin/users")
def get_all_users_for_admin(admin_user: dict = Depends(get_current_admin)):
    users_col = db_manager.get_collection("users")
    portfolios_col = db_manager.get_collection("portfolios")
    users = list(users_col.find({}))
    
    result = []
    for u in users:
        p = portfolios_col.find_one({"student_id": u["_id"]})
        result.append({
            "id": u["_id"],
            "name": u["name"],
            "email": u["email"],
            "username": u["username"],
            "role": u.get("role", "student"),
            "is_active": u.get("is_active", True),
            "created_at": u.get("created_at", ""),
            "has_portfolio": bool(p),
            "is_published": p.get("is_published", False) if p else False,
            "views_count": p.get("views_count", 0) if p else 0
        })
    return result

@router.post("/admin/toggle-user-status/{user_id}")
def toggle_user_status(user_id: str, admin_user: dict = Depends(get_current_admin)):
    users_col = db_manager.get_collection("users")
    user = users_col.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    new_status = not user.get("is_active", True)
    users_col.update_one({"_id": user_id}, {"$set": {"is_active": new_status}})
    return {"message": f"User status set to {'active' if new_status else 'deactivated'}.", "is_active": new_status}
