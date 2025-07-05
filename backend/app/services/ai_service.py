import openai
import os
import json
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure OpenAI API key - IMPORTANT: Never hardcode API keys, use environment variables
openai.api_key = os.getenv("OPENAI_API_KEY")  # Set this in your .env file

if not openai.api_key:
    raise ValueError("OpenAI API key not found. Please set OPENAI_API_KEY in your .env file.")

class AIService:
    @staticmethod
    def evaluate_resume(
        resume_text: str,
        job_requirements: List[str],
        evaluation_questions: List[str],
        role: str,
        description: str,
        company_name: str = "Our Company"
    ) -> Dict:
        """
        Evaluates a resume using GPT-4 against job requirements and custom evaluation questions.
        
        Args:
            resume_text (str): The extracted text content from the resume
            job_requirements (List[str]): List of required qualifications
            evaluation_questions (List[str]): Custom evaluation criteria
            role (str): The job position title
            description (str): Brief description of the role
            company_name (str): Name of the company (defaults to "Our Company")
            
        Returns:
            Dict: Structured evaluation results following the format:
            {
                "name": str,                    # Candidate name
                "summary": str,                 # Brief overview of the candidate
                "layer1": {                     # Required qualifications
                    "requirement_name": bool,   # True/False for each requirement
                },
                "score_layer2": int,           # Strategic fit score (0-50)
                "decision": str,               # "Proceed" or "Reject"
                "justification": str           # Detailed explanation
            }
        """
        # Create the system prompt that defines the AI's role and evaluation criteria
        system_prompt = f"""You are a senior technical recruiter at {company_name}

Evaluate the following resume for the role: {role}.

This role focuses on {description}

Your evaluation should follow a structured two-layer approach:

Layer 1: Required Qualifications
- Evaluate each of these requirements (True/False):
{chr(10).join(f"- {req}" for req in job_requirements)}

Layer 2: Strategic Fit Assessment (50 points total)
- Score these criteria (each worth 10 points):
{chr(10).join(f"- {q}" for q in evaluation_questions)}

Provide your evaluation in a structured format with:
1. Candidate name and summary
2. Layer 1 results (True/False for each requirement)
3. Layer 2 total score (sum of all criteria scores)
4. Final decision (Proceed if Layer 1 all true and Layer 2 score > 25)
5. Detailed justification"""

        # Create the evaluation prompt that structures how the AI should format its response
        evaluation_prompt = f"""Please evaluate this resume:

{resume_text}

Return your evaluation in this exact JSON format:
{{
    "name": "Candidate Name",
    "summary": "Brief overview of candidate's background and key strengths/gaps",
    "layer1": {{
        // For each requirement, set true/false
        "requirement_name": true/false
    }},
    "score_layer2": 0-50,  // Total score from all criteria
    "decision": "Proceed/Reject",
    "justification": "Detailed explanation of the decision"
}}"""

        try:
            # Make API call to OpenAI
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": evaluation_prompt}
                ],
                temperature=0.2  # Lower temperature for more consistent responses
            )
            
            # Parse the response using json.loads instead of eval for safety
            if response.choices and response.choices[0].message and response.choices[0].message.content:
                return json.loads(response.choices[0].message.content)
            else:
                raise ValueError("Invalid response format from OpenAI API")
        except json.JSONDecodeError as e:
            raise Exception(f"Error parsing AI response: {str(e)}")
        except Exception as e:
            raise Exception(f"Error in AI evaluation: {str(e)}")

    @staticmethod
    def extract_text_from_resume(resume_path: str) -> str:
        """
        Extracts text content from various resume file formats.
        
        Args:
            resume_path (str): Path to the resume file
            
        Returns:
            str: Extracted text content from the resume
        """
        # TODO: Implement proper text extraction based on file type
        # For PDF: use PyPDF2 or pdfminer.six
        # For DOCX: use python-docx
        # For now, simple text reading
        with open(resume_path, 'r') as file:
            return file.read() 