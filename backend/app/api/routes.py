from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import uuid
from pathlib import Path
# import magic  # Temporarily commenting out for local testing
from datetime import datetime
from pydantic import BaseModel

from ..core.database import get_db
from ..models.models import Job, Application
from ..services.ai_service import AIService
from ..services.gmail_service import GmailService

router = APIRouter()
ai_service = AIService()
gmail_service = GmailService()

class RequirementItem(BaseModel):
    type: str  # "education", "experience", or "skills"
    details: str

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: List[RequirementItem]
    questions: List[str]

# Job Management Routes
@router.post("/jobs/")
def create_job(job: JobCreate, db: Session = Depends(get_db)):
    # Calculate threshold score based on number of questions
    threshold_score = len(job.questions) * 10  # Each question worth 10 points max
    
    # Create job with structured requirements
    db_job = Job(
        title=job.title,
        description=job.description,
        requirements={
            "education": [r.details for r in job.requirements if r.type == "education"],
            "experience": [r.details for r in job.requirements if r.type == "experience"],
            "skills": [r.details for r in job.requirements if r.type == "skills"]
        },
        questions=job.questions,
        threshold_score=threshold_score
    )
    
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@router.get("/jobs/")
async def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

@router.get("/jobs/{job_id}")
async def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/jobs/{job_id}/test")
def test_job_results(job_id: int, db: Session = Depends(get_db)):
    """Endpoint for HR team to test and view results"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all applications for this job
    applications = db.query(Application).filter(Application.job_id == job_id).all()
    
    return {
        "job": {
            "id": job.id,
            "title": job.title,
            "requirements": job.requirements,
            "threshold_score": job.threshold_score,
            "total_applications": len(applications)
        },
        "applications": [
            {
                "id": app.id,
                "applicant_name": app.applicant_name,
                "score": app.score,
                "feedback": app.feedback,
                "passed": app.score >= job.threshold_score if app.score else False
            }
            for app in applications
        ]
    }

# Application Routes
ALLOWED_MIME_TYPES = [
    'application/pdf',
      # docx
]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# File type validation function
def validate_file_type(file: UploadFile):
    # Temporarily allowing all files for local testing
    return True
    # content_type = magic.from_buffer(file.file.read(2048), mime=True)
    # file.file.seek(0)  # Reset file pointer
    # allowed_types = ['application/pdf', 'text/plain']
    # if content_type not in allowed_types:
    #     raise HTTPException(status_code=400, detail="Invalid file type")

@router.post("/applications/")
async def submit_application(
    candidate_name: str,
    candidate_email: str,
    job_id: int,
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validate file size
    contents = await resume.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    
    # Validate file type
    if not validate_file_type(resume):
        raise HTTPException(status_code=400, detail="Invalid file type")

    # Get job details
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Generate secure filename
    file_extension = Path(resume.filename).suffix
    secure_filename = f"{uuid.uuid4()}{file_extension}"
    resume_path = f"uploads/{secure_filename}"

    # Ensure uploads directory exists and is secure
    upload_dir = Path("uploads")
    upload_dir.mkdir(mode=0o750, exist_ok=True)

    # Save file securely
    with open(resume_path, "wb") as buffer:
        buffer.write(contents)
    os.chmod(resume_path, 0o640)  # Restrict file permissions

    # Extract text from resume
    resume_text = ai_service.extract_text_from_resume(resume_path)

    # Add privacy notice to evaluation
    evaluation_result = ai_service.evaluate_resume(
        resume_text=resume_text,
        job_requirements=job.requirements,
        evaluation_questions=job.questions,
        role=job.title,
        description=job.description
    )

    # Calculate total score
    scores = [score["score"] for score in evaluation_result["question_scores"].values()]
    total_score = sum(scores) / len(scores) if scores else 0

    # Create application record with sanitized data
    application = Application(
        candidate_name=candidate_name[:255],  # Prevent overflow
        candidate_email=candidate_email[:255],
        resume_path=resume_path,
        job_id=job_id,
        evaluation_scores=evaluation_result["question_scores"],
        requirements_met=evaluation_result["requirements_met"],
        total_score=total_score,
        status="pending"
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    # Check if application meets criteria
    all_requirements_met = all(evaluation_result["requirements_met"].values())
    meets_threshold = total_score >= job.threshold_score

    if all_requirements_met and meets_threshold:
        try:
            email_body = gmail_service.generate_approval_email(
                candidate_name=candidate_name,
                role=job.title,
                evaluation_result=evaluation_result
            )
            
            gmail_service.create_draft_email(
                to=candidate_email,
                subject=f"Application Update: {job.title} Position",
                body=email_body
            )
            application.status = "approved"
        except Exception as e:
            application.status = "pending"
            print(f"Error creating draft email: {str(e)}")
    else:
        application.status = "rejected"

    db.commit()
    return application

@router.get("/applications/")
async def list_applications(db: Session = Depends(get_db)):
    return db.query(Application).all()

@router.get("/applications/{application_id}")
async def get_application(application_id: int, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application 