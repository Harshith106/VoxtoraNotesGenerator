import yt_dlp
import os
import logging
import asyncio
import re
from urllib.parse import urlparse, parse_qs
import shutil
import time
from .file_manager import file_manager

logger = logging.getLogger(__name__)

def validate_youtube_url(url: str) -> bool:
    """Validate YouTube URL format."""
    patterns = [
        r'^https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+',
        r'^https?://(?:www\.)?youtube\.com/v/[\w-]+',
        r'^https?://(?:www\.)?youtu\.be/[\w-]+',
        r'^https?://(?:www\.)?youtube\.com/embed/[\w-]+'
    ]
    return any(re.match(pattern, url) for pattern in patterns)

def extract_video_id(url: str) -> str:
    """Extract video ID from YouTube URL."""
    if not url:
        raise ValueError("URL cannot be empty")
        
    # Handle youtu.be URLs
    if 'youtu.be' in url:
        return url.split('/')[-1].split('?')[0]
        
    # Handle youtube.com URLs
    parsed_url = urlparse(url)
    if parsed_url.netloc in ['www.youtube.com', 'youtube.com']:
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
        elif parsed_url.path.startswith(('/v/', '/embed/')):
            return parsed_url.path.split('/')[2]
            
    raise ValueError("Invalid YouTube URL")

def download_audio(url: str, video_id: str) -> str:
    """Download audio from YouTube video in MP3 format"""
    try:
        # Check if audio file already exists
        output_path = file_manager.get_file_path(video_id, "audio")
        if file_manager.file_exists(video_id, "audio"):
            logger.info(f"Audio file already exists for video {video_id}")
            return output_path
            
        logger.info(f"Downloading audio for video {video_id}")
        
        # Configure yt-dlp options for MP3
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': output_path.replace('.mp3', ''),
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
            'no_playlist': True,
            'prefer_ffmpeg': True,
            'keepvideo': False
        }
        
        # Download audio
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
            
        # Verify the file exists and has content
        if not os.path.exists(output_path):
            raise Exception("Audio file was not created")
            
        file_size = os.path.getsize(output_path)
        if file_size == 0:
            raise Exception("Downloaded audio file is empty")
            
        logger.info(f"Audio downloaded successfully: {output_path} (size: {file_size} bytes)")
        return output_path
        
    except Exception as e:
        logger.error(f"Error downloading audio: {str(e)}")
        raise Exception(f"Failed to download audio: {str(e)}")

async def download_audio(url: str, video_id: str) -> str:
    """Download audio from YouTube video."""
    try:
        logger.info(f"Starting audio download for URL: {url}")
        
        # Get output path
        output_path = file_manager.get_file_path(video_id, "audio")
        
        # Configure yt-dlp options with more robust settings
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': output_path.replace('.mp3', ''),
            'quiet': True,
            'no_warnings': True,
            'extract_audio': True,
            'audio_format': 'mp3',
            'audio_quality': 0,
            'prefer_ffmpeg': True,
            'keepvideo': False,
            'postprocessor_args': [
                '-ar', '44100',
                '-ac', '2',
                '-b:a', '192k'
            ],
            # Add more robust options
            'nocheckcertificate': True,
            'ignoreerrors': True,
            'no_color': True,
            'geo_bypass': True,
            'geo_verification_proxy': None,
            'socket_timeout': 30,
            'retries': 10,
            'fragment_retries': 10,
            'skip_download_archive': True,
            'extractor_args': {
                'youtube': {
                    'skip': ['dash', 'hls'],
                    'player_client': ['android', 'web'],
                    'player_skip': ['js', 'configs', 'webpage']
                }
            }
        }
        
        # Try different formats if the first attempt fails
        formats = [
            'bestaudio/best',
            'worstaudio/worst',
            'bestaudio[ext=m4a]/bestaudio/best',
            'bestaudio[ext=mp3]/bestaudio/best'
        ]
        
        last_error = None
        for format in formats:
            try:
                ydl_opts['format'] = format
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([url])
                    
                # Check for the final file
                if os.path.exists(output_path):
                    logger.info(f"Successfully downloaded audio to: {output_path}")
                    return output_path
                    
                # Try alternative path (yt-dlp sometimes adds .mp3 to the output)
                alt_path = f"{output_path}.mp3"
                if os.path.exists(alt_path):
                    os.rename(alt_path, output_path)
                    logger.info(f"Successfully downloaded audio to: {output_path}")
                    return output_path
                    
            except Exception as e:
                last_error = e
                logger.warning(f"Failed to download with format {format}: {str(e)}")
                continue
        
        if last_error:
            raise last_error
            
        raise Exception("Failed to download audio after trying all formats")
        
    except Exception as e:
        logger.error(f"Error downloading audio: {str(e)}")
        if "403" in str(e):
            raise Exception("Access to this video is forbidden. The video might be private or restricted.")
        elif "404" in str(e):
            raise Exception("Video not found. The video might have been removed or is private.")
        elif "410" in str(e):
            raise Exception("Video is no longer available.")
        else:
            raise Exception(f"Failed to download audio: {str(e)}") 