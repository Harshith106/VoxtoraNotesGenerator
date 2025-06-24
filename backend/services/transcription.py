import whisper
import logging
import torch
import numpy as np
import soundfile as sf

logger = logging.getLogger(__name__)

def transcribe_audio(audio_path: str, model_size: str = "base") -> tuple[str, str]:
    """
    Transcribe audio file using Whisper.
    
    Args:
        audio_path (str): Path to audio file
        model_size (str): Whisper model size (tiny, base, small, medium, large)
        
    Returns:
        tuple[str, str]: (transcript, detected_language)
    """
    try:
        logger.info(f"Loading Whisper {model_size} model...")
        model = whisper.load_model(model_size)
        
        logger.info("Loading audio file...")
        # Load audio using soundfile
        audio, sample_rate = sf.read(audio_path)
        
        # Convert to mono if stereo
        if len(audio.shape) > 1:
            audio = audio.mean(axis=1)
            
        # Resample to 16kHz if needed
        if sample_rate != 16000:
            audio = torch.from_numpy(audio).float()
            audio = torch.nn.functional.interpolate(
                audio.unsqueeze(0).unsqueeze(0),
                size=int(len(audio) * 16000 / sample_rate),
                mode='linear'
            ).squeeze().numpy()
        
        logger.info("Transcribing audio...")
        # Convert to float32
        audio = audio.astype(np.float32)
        
        # Normalize audio
        audio = audio / np.max(np.abs(audio))
        
        # Transcribe
        result = model.transcribe(audio)
        
        transcript = result["text"]
        detected_language = result["language"]
        
        logger.info(f"Transcription completed. Detected language: {detected_language}")
        return transcript, detected_language
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise Exception(f"Failed to transcribe audio: {str(e)}") 