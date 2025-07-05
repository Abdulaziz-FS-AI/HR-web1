from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=False)  # List of requirements
    evaluation_questions = Column(JSON)  # List of questions
    threshold_score = Column(Float, default=7.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = relationship("Application", back_populates="job")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String(255), nullable=False)
    candidate_email = Column(String(255), nullable=False)
    resume_path = Column(String(512), nullable=False)  # Path to stored resume
    job_id = Column(Integer, ForeignKey("jobs.id"))
    evaluation_scores = Column(JSON)  # Scores for each evaluation question
    requirements_met = Column(JSON)  # Requirements status
    total_score = Column(Float)
    status = Column(String(50))  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("Job", back_populates="applications") 