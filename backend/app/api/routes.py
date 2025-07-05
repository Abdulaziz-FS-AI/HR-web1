from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import json
import os
import uuid
from pathlib import Path
import magic  # for file type validation

from ..core.database import get_db
from ..models.models import Job, Application
from ..services.ai_service import AIService
from ..services.gmail_service import GmailService

router = APIRouter()
ai_service = AIService()
gmail_service = GmailService()

# Job Management Routes
@router.post("/jobs/")
async def create_job(
    title: str,
    description: str,
    requirements: List[str],
    evaluation_questions: List[str],
    threshold_score: float,
    db: Session = Depends(get_db)
):
    job = Job(
        title=title,
        description=description,
        requirements=requirements,
        evaluation_questions=evaluation_questions,
        threshold_score=threshold_score
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.get("/jobs/")
async def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).all()

@router.get("/jobs/{job_id}")
async def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

# Application Routes
ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword',  # doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  # docx
]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

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
    mime_type = magic.from_buffer(contents, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload PDF or Word documents only.")

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
        evaluation_questions=job.evaluation_questions,
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