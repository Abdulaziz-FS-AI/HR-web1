from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import base64
from email.mime.text import MIMEText
import os
from typing import Optional
from cryptography.fernet import Fernet
import json
from pathlib import Path

SCOPES = ['https://www.googleapis.com/auth/gmail.compose']

class GmailService:
    def __init__(self):
        self.creds = None
        self.service = None
        self._init_encryption()

    def _init_encryption(self):
        """Initialize encryption for secure credential storage"""
        key_file = Path('.gmail_key')
        if not key_file.exists():
            key = Fernet.generate_key()
            key_file.write_bytes(key)
            os.chmod(key_file, 0o600)  # Restrict access to owner only
        else:
            key = key_file.read_bytes()
        self.fernet = Fernet(key)

    def _encrypt_credentials(self, creds_dict: dict) -> bytes:
        """Encrypt credentials before storing"""
        return self.fernet.encrypt(json.dumps(creds_dict).encode())

    def _decrypt_credentials(self, encrypted_data: bytes) -> dict:
        """Decrypt stored credentials"""
        return json.loads(self.fernet.decrypt(encrypted_data).decode())

    def authenticate(self):
        creds_file = Path('.gmail_token.encrypted')
        
        if creds_file.exists():
            try:
                creds_dict = self._decrypt_credentials(creds_file.read_bytes())
                self.creds = Credentials.from_authorized_user_info(creds_dict, SCOPES)
            except Exception:
                self.creds = None

        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', SCOPES)
                self.creds = flow.run_local_server(port=0)

            # Save encrypted credentials
            creds_dict = json.loads(self.creds.to_json())
            encrypted_creds = self._encrypt_credentials(creds_dict)
            creds_file.write_bytes(encrypted_creds)
            os.chmod(creds_file, 0o600)  # Restrict access to owner only

        self.service = build('gmail', 'v1', credentials=self.creds)

    def create_draft_email(
        self,
        to: str,
        subject: str,
        body: str,
        hr_email: Optional[str] = None
    ) -> dict:
        try:
            # Sanitize inputs
            to = to.strip()
            subject = subject.strip()
            body = body.strip()

            message = MIMEText(body)
            message['to'] = to
            message['subject'] = subject
            if hr_email:
                message['from'] = hr_email.strip()

            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

            draft = self.service.users().drafts().create(
                userId='me',
                body={
                    'message': {
                        'raw': encoded_message
                    }
                }
            ).execute()

            return draft
        except Exception as e:
            raise Exception(f"Error creating draft email: {str(e)}")

    def generate_approval_email(
        self,
        candidate_name: str,
        role: str,
        evaluation_result: dict
    ) -> str:
        # Sanitize inputs
        candidate_name = candidate_name.strip()
        role = role.strip()
        
        return f"""Dear {candidate_name},

Thank you for applying for the {role} position. We have reviewed your application and are pleased to inform you that your profile matches our requirements.

Our team would like to proceed with the next steps of the recruitment process. We will be in touch shortly to schedule an interview.

Best regards,
HR Team""" 