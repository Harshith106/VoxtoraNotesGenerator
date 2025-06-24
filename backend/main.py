from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator, ConfigDict
import logging
import mimetypes
import os
from services.youtube import download_audio, extract_video_id
from services.transcription import transcribe_audio
from services.translation import translate_text
from services.notes import generate_notes
from services.pdf import create_pdf
from services.file_manager import file_manager
import os
import mimetypes
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Removed complex progress tracking for simplicity

# Add JavaScript MIME type
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router FIRST
from fastapi import APIRouter
api_router = APIRouter(prefix="/api")

class TranscriptRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    youtube_url: str
    model_size: str = "base"
    target_language: str = "en"
    
    @field_validator('model_size')
    @classmethod
    def validate_model_size(cls, v):
        if v not in ["tiny", "base", "small", "medium", "large"]:
            raise ValueError("Invalid model size")
        return v

class TranscriptResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    video_id: str
    detected_language: str
    target_language: str
    translated: bool
    audio_path: str
    transcript_path: str
    notes_path: str
    pdf_path: str

# Removed complex progress tracking - keeping it simple

@api_router.post("/transcript", response_model=TranscriptResponse)
async def process_video(request: TranscriptRequest):
    try:
        # Extract video ID
        video_id = extract_video_id(request.youtube_url)
        logger.info(f"Processing video ID: {video_id}")

        # Check if all required files already exist
        required_files = ['audio', 'transcript', 'notes', 'pdf']
        existing_files = {file_type: file_manager.file_exists(video_id, file_type)
                         for file_type in required_files}

        if all(existing_files.values()):
            logger.info(f"All files already exist for video {video_id}, returning existing paths")
            return TranscriptResponse(
                video_id=video_id,
                detected_language="en",  # Default, will be updated if needed
                target_language=request.target_language,
                translated=False,  # Default, will be updated if needed
                audio_path=file_manager.get_file_path(video_id, "audio"),
                transcript_path=file_manager.get_file_path(video_id, "transcript"),
                notes_path=file_manager.get_file_path(video_id, "notes"),
                pdf_path=file_manager.get_file_path(video_id, "pdf")
            )
        
        # Step 1: Download audio if needed
        audio_path = None
        if not existing_files['audio']:
            logger.info(f"Downloading audio for video {video_id}")
            audio_path = await download_audio(request.youtube_url, video_id)
            if not os.path.exists(audio_path):
                raise HTTPException(status_code=500, detail="Failed to download audio file")
        else:
            audio_path = file_manager.get_file_path(video_id, "audio")
            logger.info(f"Using existing audio file: {audio_path}")
        
        # Step 2: Transcribe audio if needed
        transcript = None
        detected_lang = "en"
        translated = False
        transcript_path = None

        if not existing_files['transcript']:
            logger.info(f"Transcribing audio for video {video_id}")
            result = transcribe_audio(audio_path)
            transcript, detected_lang = result  # Unpack the tuple
            transcript_path = file_manager.get_file_path(video_id, "transcript")
            with open(transcript_path, "w", encoding="utf-8") as f:
                f.write(transcript)
        else:
            transcript_path = file_manager.get_file_path(video_id, "transcript")
            try:
                transcript = read_transcript(transcript_path)
                logger.info(f"Using existing transcript file: {transcript_path}")
            except Exception as e:
                logger.error(f"Error reading transcript file: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to read transcript file: {str(e)}")

        # Step 3: Translate if needed
        if request.target_language != detected_lang:
            logger.info(f"Translating transcript to {request.target_language}")
            transcript = await translate_text(transcript, request.target_language)
            translated = True
            with open(transcript_path, "w", encoding="utf-8") as f:
                f.write(transcript)

        # Step 4: Generate notes if needed
        if not existing_files['notes']:
            logger.info(f"Generating notes for video {video_id} in {request.target_language}")
            notes = generate_notes(transcript, request.target_language)
            notes_path = file_manager.get_file_path(video_id, "notes")
            with open(notes_path, "w", encoding="utf-8") as f:
                f.write(notes)
        else:
            notes_path = file_manager.get_file_path(video_id, "notes")
            try:
                notes = read_transcript(notes_path)
                logger.info(f"Using existing notes file: {notes_path}")
            except Exception as e:
                logger.error(f"Error reading notes file: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to read notes file: {str(e)}")

        # Step 5: Create PDF if needed
        if not existing_files['pdf']:
            logger.info(f"Creating PDF for video {video_id}")
            pdf_path = await create_pdf(notes, video_id)
        else:
            pdf_path = file_manager.get_file_path(video_id, "pdf")
            logger.info(f"Using existing PDF file: {pdf_path}")

        # Schedule cleanup
        file_manager.schedule_cleanup(video_id)

        return TranscriptResponse(
            video_id=video_id,
            detected_language=detected_lang,
            target_language=request.target_language,
            translated=translated,
            audio_path=audio_path,
            transcript_path=transcript_path,
            notes_path=notes_path,
            pdf_path=pdf_path
        )
        
    except Exception as e:
        logger.error(f"Error processing video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Test endpoint to check file existence
@api_router.get("/files/{video_id}")
async def list_files(video_id: str):
    """List available files for a video"""
    try:
        files = {}
        for file_type in ['audio', 'transcript', 'notes', 'pdf']:
            file_path = file_manager.get_file_path(video_id, file_type)
            files[file_type] = {
                'exists': os.path.exists(file_path),
                'path': file_path,
                'size': os.path.getsize(file_path) if os.path.exists(file_path) else 0
            }
        return files
    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Download endpoints
@api_router.get("/download/{video_id}/{file_type}")
async def download_file(video_id: str, file_type: str):
    """Download a specific file for a video"""
    try:
        if file_type not in ['audio', 'transcript', 'notes', 'pdf']:
            raise HTTPException(status_code=400, detail="Invalid file type")

        file_path = file_manager.get_file_path(video_id, file_type)

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        # Determine media type and filename
        media_types = {
            'audio': 'audio/mpeg',
            'transcript': 'text/plain',
            'notes': 'text/markdown',
            'pdf': 'application/pdf'
        }

        extensions = {
            'audio': 'mp3',
            'transcript': 'txt',
            'notes': 'md',
            'pdf': 'pdf'
        }

        media_type = media_types.get(file_type, 'application/octet-stream')
        extension = extensions.get(file_type, 'txt')
        filename = f"video_{video_id}_{file_type}.{extension}"

        return FileResponse(
            file_path,
            media_type=media_type,
            filename=filename,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "no-cache"
            }
        )

    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the API router BEFORE frontend routes
app.include_router(api_router)

# Mount the frontend static files
app.mount("/assets", StaticFiles(directory="../frontend/dist/assets"), name="assets")

@app.get("/{path:path}")
async def serve_frontend(path: str):
    if path == "" or path == "index.html":
        return FileResponse(
            "../frontend/dist/index.html",
            media_type="text/html"
        )

    file_path = f"../frontend/dist/{path}"
    if not os.path.exists(file_path):
        return FileResponse("../frontend/dist/index.html", media_type="text/html")

    # Determine the correct media type
    media_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"

    return FileResponse(
        file_path,
        media_type=media_type
    )

@app.on_event("shutdown")
async def shutdown_event():
    file_manager.scheduler.shutdown()

def read_transcript(file_path: str) -> str:
    """Read transcript file with robust encoding handling."""
    try:
        # First try reading as binary
        with open(file_path, 'rb') as f:
            content = f.read()
            
        # Try to detect encoding using chardet
        import chardet
        detected = chardet.detect(content)
        encoding = detected['encoding'] if detected['encoding'] else 'utf-8'
        
        # Try detected encoding first
        try:
            return content.decode(encoding, errors='replace')
        except UnicodeDecodeError:
            pass
            
        # If detected encoding fails, try common encodings
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1', 'ascii']
        for enc in encodings:
            try:
                return content.decode(enc, errors='replace')
            except UnicodeDecodeError:
                continue
                
        # If all else fails, use latin-1 which can decode any byte sequence
        return content.decode('latin-1', errors='replace')
        
    except Exception as e:
        logger.error(f"Error reading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}") 