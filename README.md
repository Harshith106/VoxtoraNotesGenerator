# YouTube Transcription & Notes API

A FastAPI-based backend service that transcribes YouTube videos and generates structured notes.

## Features

- Download audio from YouTube videos
- Transcribe audio using OpenAI Whisper
- Automatic language detection and translation
- Generate structured notes using OpenRouter API
- Convert notes to PDF
- Automatic cleanup of old files

## Prerequisites

- Python 3.8+
- FFmpeg (for audio processing)
- OpenRouter API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd youtube-transcription-notes-api
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the project root with:
```
OPENROUTER_API_KEY=your_api_key_here
```

## Usage

1. Start the server:
```bash
uvicorn main:app --reload
```

2. The API will be available at `http://localhost:8000`

3. API Documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### POST /transcript

Process a YouTube video and generate notes.

Request body:
```json
{
    "youtube_url": "https://www.youtube.com/watch?v=...",
    "model_size": "base",  // Optional: "base", "small", or "medium"
    "target_language": "en"  // Optional: target language code
}
```

Response:
```json
{
    "detected_language": "en",
    "translation_status": "not_needed",
    "audio_path": "outputs/20240315_123456/audio.mp3",
    "transcript_path": "outputs/20240315_123456/transcript.txt",
    "notes_md_path": "outputs/20240315_123456/notes.md",
    "notes_pdf_path": "outputs/20240315_123456/notes.pdf",
    "notes_markdown": "# Generated Notes..."
}
```

## Project Structure

```
.
├── main.py              # FastAPI application entry point
├── requirements.txt     # Project dependencies
├── .env                # Environment variables
├── outputs/            # Generated files directory
├── services/           # Service modules
│   ├── youtube.py      # YouTube audio download
│   ├── transcription.py # Whisper transcription
│   ├── translation.py  # Text translation
│   ├── notes.py        # Notes generation
│   └── pdf.py          # PDF generation
└── utils/              # Utility functions
    └── file_management.py # File cleanup
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid YouTube URLs
- Audio download failures
- Transcription errors
- Translation issues
- Notes generation failures
- PDF creation problems

All errors are logged and returned with appropriate HTTP status codes.

## File Management

- All generated files are stored in the `outputs/` directory
- Files are automatically deleted after 1 hour
- Each request creates a timestamped subdirectory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 