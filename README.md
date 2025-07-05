# AI-Powered HR Platform

An intelligent HR platform that automates resume evaluation and candidate communication using OpenAI's GPT models and Gmail integration.

## Features

- User-friendly submission interface for candidates
- AI-powered resume evaluation using GPT-4
- Dynamic job posting management for HR
- Automated email communication via Gmail API
- Customizable evaluation criteria and scoring
- Requirement-based filtering

## Project Structure

```
.
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── public/           # Static files
│
├── backend/               # FastAPI backend application
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Core functionality
│   │   ├── models/      # Database models
│   │   └── services/    # Business logic
│   └── tests/           # Backend tests
│
├── requirements.txt      # Python dependencies
└── package.json         # Node.js dependencies
```

## Setup Instructions

1. Clone the repository
2. Set up the backend:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   npm install
   ```

4. Configure environment variables:
   - Create `.env` file in the backend directory
   - Add OpenAI API key
   - Add Gmail API credentials

5. Run the application:
   - Backend: `uvicorn backend.app.main:app --reload`
   - Frontend: `npm start`

## Environment Variables

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `GMAIL_CLIENT_ID`: Gmail API client ID
- `GMAIL_CLIENT_SECRET`: Gmail API client secret
- `DATABASE_URL`: Database connection string

## License

MIT 