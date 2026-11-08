from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.database.connection import db_manager
from app.routes.api import router as api_router

app = FastAPI(
    title="PortfolioAI API",
    description="Backend API for AI-Powered Dynamic Student Portfolio Generator & Resume Analyzer",
    version="1.0.0"
)

# CORS configuration for local Vite development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type", "Content-Length"],
)

@app.on_event("startup")
def startup_db_client():
    db_manager.connect()

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "PortfolioAI API",
        "version": "1.0.0",
        "database": "Atlas/Persistent Storage"
    }

# Register all API endpoints under /api
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
