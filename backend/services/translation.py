import logging
from deep_translator import GoogleTranslator
import re

logger = logging.getLogger(__name__)

def split_text(text: str, max_length: int = 4000) -> list:
    """Split text into chunks of maximum length, trying to break at sentence boundaries."""
    if len(text) <= max_length:
        return [text]
        
    chunks = []
    current_chunk = ""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) + 1 <= max_length:
            current_chunk += (sentence + " ")
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks

def preserve_code_blocks(text: str) -> tuple[str, list]:
    """Extract code blocks and replace them with placeholders."""
    code_blocks = []
    pattern = r'```[\s\S]*?```'
    
    def replace_code(match):
        code_blocks.append(match.group(0))
        return f"CODE_BLOCK_{len(code_blocks)-1}"
    
    text_without_code = re.sub(pattern, replace_code, text)
    return text_without_code, code_blocks

def restore_code_blocks(text: str, code_blocks: list) -> str:
    """Restore code blocks from placeholders."""
    for i, code in enumerate(code_blocks):
        text = text.replace(f"CODE_BLOCK_{i}", code)
    return text

async def translate_text(text: str, target_language: str) -> str:
    """
    Translate text to target language using Google Translate.
    
    Args:
        text (str): Text to translate
        target_language (str): Target language code (e.g., 'es', 'fr', 'de')
        
    Returns:
        str: Translated text
    """
    try:
        logger.info(f"Translating text to {target_language}...")
        
        # Skip translation if target language is English
        if target_language.lower() == 'en':
            logger.info("Target language is English, skipping translation")
            return text
            
        # Preserve code blocks
        text_without_code, code_blocks = preserve_code_blocks(text)
        
        # Split text into chunks if needed
        chunks = split_text(text_without_code)
        translated_chunks = []
        
        # Translate each chunk
        for chunk in chunks:
            try:
                translator = GoogleTranslator(source='auto', target=target_language)
                translated_chunk = translator.translate(chunk)
                translated_chunks.append(translated_chunk)
            except Exception as e:
                logger.error(f"Error translating chunk: {str(e)}")
                raise Exception(f"Translation failed: {str(e)}")
        
        # Combine translated chunks
        translated_text = " ".join(translated_chunks)
        
        # Restore code blocks
        final_text = restore_code_blocks(translated_text, code_blocks)
        
        logger.info("Translation completed successfully")
        return final_text
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise Exception(f"Translation failed: {str(e)}") 