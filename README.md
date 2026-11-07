# PortfolioAI – AI-Powered Dynamic Student Portfolio Generator & Resume Analyzer

PortfolioAI is a modern full-stack SaaS platform designed for university students, fresh engineering graduates, and job seekers. It transforms raw PDF resumes into professional, dynamic, recruiter-ready online portfolios using Google Gemini and PyMuPDF, providing real-time AI ATS diagnostics, skill gap roadmaps, and interview simulation.

---

## 🚀 Key Features

1. **Resume-to-Portfolio Generation Workflow:**
   - **Upload Resume:** PDF upload with validation and size constraints up to 10MB.
   - **AI Information Extraction:** PyMuPDF text ingestion and Google Gemini structured schema parsing (personal info, summary, education, technical skills, projects, certifications, internships, and achievements).
   - **Review Extracted Information:** Form interface to inspect, edit, append missing details, or modify items.
   - **Generate & Customize:** Choose between **Modern**, **Professional**, **Minimal**, and **Creative** templates.
   - **Publish & Share:** Separate draft and published profiles, custom vanity URLs (`/portfolio/username`), and view counter analytics.

2. **AI Resume & ATS Diagnostic Engine:**
   - Overall resume quality score (0–100).
   - Estimated ATS compatibility score (0–100) with compliance disclaimer.
   - Strengths and weaknesses analysis.
   - Target Job Description (JD) matching with role compatibility insights.
   - Missing high-impact keywords.
   - Printable ATS PDF report export.

3. **AI Skill Gap Analyzer:**
   - Analyzes verified portfolio skills against target roles (e.g. Full Stack Engineer, Backend, AI/ML).
   - Generates missing skills and priorities.
   - Generates a 3-tier personalized learning roadmap (Beginner, Intermediate, Advanced).

4. **AI Professional Summary Generator:**
   - Instant About Me generation in 4 styles: *Professional*, *Technical*, *Fresher*, and *Creative*.

5. **AI Interview Preparation Simulator:**
   - Generates personalized interview simulations: Technical, HR/Behavioral, Project-based, Coding, and Scenario-based with recruiter answer suggestions and evaluation criteria.

6. **Recruiter-Friendly Public Portfolios & PDF Engine:**
   - Public vanity URL: `http://localhost:5173/portfolio/:username`
   - High-resolution printable PDF export (`/api/portfolio/:username/pdf`).
   - Dynamic smartphone QR Code generation (`/api/portfolio/:username/qrcode`).

7. **Admin Console:**
   - Platform usage metrics (total users, published portfolios, AI reports, public views).
   - Student directory search and account activation/deactivation controls.

---

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router DOM v7, Axios, Lucide Icons, Recharts.
- **Backend:** Python 3.14, FastAPI, Pydantic, Python-Jose (JWT), BCrypt, PyMuPDF, ReportLab, QRCode.
- **Database:** MongoDB Atlas / Persistent Document Store.
- **AI Integration:** Google Gemini API (`google-genai` SDK).

---

## 💻 Running the Application Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Backend Setup
```bash
cd backend

# Configure environment variables in backend/.env
# PORT=8000
# MONGODB_URI=<your-atlas-uri-or-blank-for-local-store>
# GEMINI_API_KEY=<your-google-gemini-key>
# JWT_SECRET=portfolioai_super_secret_jwt_key_change_in_production_2026

# Run backend
python -m uvicorn app.main:app --port 8000 --host 0.0.0.0
```
Backend API will run at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`)

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will run at: `http://localhost:5173`

---

## 👤 Default Administrator Credentials
- **Email:** `admin@portfolioai.com`
- **Password:** `AdminPassword@123`
