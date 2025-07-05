from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router
from .core.database import engine
from .models.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="HR AI Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, prefix="/api")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Serve static files and handle SPA routing
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # First try to serve the exact path
    file_path = f"static/{full_path}"
    try:
        return FileResponse(file_path)
    except:
        # If file not found, serve index.html for SPA routing
        return FileResponse("static/index.html") 