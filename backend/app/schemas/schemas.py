from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    username: str = Field(..., min_length=3, pattern="^[a-zA-Z0-9_-]+$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    username: str
    role: str
    is_active: bool
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Profile Sub-models
class EducationItem(BaseModel):
    id: Optional[str] = None
    institution: str
    degree: str
    branch: Optional[str] = ""
    start_year: Optional[str] = ""
    graduation_year: Optional[str] = ""
    cgpa_or_percentage: Optional[str] = ""

class ProjectItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    technologies: List[str] = []
    github_url: Optional[str] = ""
    live_demo_url: Optional[str] = ""
    project_image: Optional[str] = ""

class CertificationItem(BaseModel):
    id: Optional[str] = None
    name: str
    issuing_organization: str
    date: Optional[str] = ""
    credential_url: Optional[str] = ""

class ExperienceItem(BaseModel):
    id: Optional[str] = None
    company: str
    position: str
    duration: Optional[str] = ""
    responsibilities: Optional[str] = ""

class AchievementItem(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    date: Optional[str] = ""

class SkillsData(BaseModel):
    programming_languages: List[str] = []
    frameworks: List[str] = []
    databases: List[str] = []
    tools: List[str] = []
    soft_skills: List[str] = []

class SocialLinks(BaseModel):
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    website: Optional[str] = ""
    twitter: Optional[str] = ""

class StudentProfile(BaseModel):
    name: str = ""
    email: str = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    profile_picture: Optional[str] = ""
    professional_title: Optional[str] = ""
    about_me: Optional[str] = ""
    social_links: SocialLinks = SocialLinks()
    skills: SkillsData = SkillsData()
    education: List[EducationItem] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    experience: List[ExperienceItem] = []
    achievements: List[AchievementItem] = []

# Portfolio Customization Schema
class PortfolioDesign(BaseModel):
    template: str = "modern" # modern, professional, minimal, creative
    theme_mode: str = "light" # light, dark
    primary_color: str = "#4f46e5" # indigo-600
    secondary_color: str = "#7c3aed" # violet-600
    font_family: str = "Inter"
    visible_sections: Dict[str, bool] = {
        "hero": True,
        "about": True,
        "skills": True,
        "projects": True,
        "experience": True,
        "education": True,
        "certifications": True,
        "achievements": True,
        "contact": True
    }

class PortfolioSaveRequest(BaseModel):
    design: PortfolioDesign
    profile_data: StudentProfile

class PublishToggleRequest(BaseModel):
    is_published: bool

# AI Schemas
class ExtractedResumeData(BaseModel):
    personal_info: Dict[str, Any] = {}
    professional_summary: str = ""
    education: List[Dict[str, Any]] = []
    technical_skills: Dict[str, List[str]] = {}
    projects: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    achievements: List[Dict[str, Any]] = []
    social_links: Dict[str, str] = {}
    missing_fields: List[str] = []

class ResumeAnalysisRequest(BaseModel):
    resume_text: Optional[str] = None
    target_job_description: Optional[str] = None

class SkillGapRequest(BaseModel):
    target_role: str
    experience_level: Optional[str] = "Entry Level"

class InterviewPrepRequest(BaseModel):
    target_role: str
    experience_level: str = "Fresher"
    difficulty: str = "Intermediate"

class SummaryGenerationRequest(BaseModel):
    style: str = "professional" # professional, technical, fresher, creative
    student_data: Optional[Dict[str, Any]] = None
