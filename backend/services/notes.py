import logging
import os
import requests
import json

logger = logging.getLogger(__name__)

def generate_notes(transcript: str, target_language: str = "en") -> str:
    """Generate concise notes from transcript using OpenRouter API in the requested language."""
    try:
        logger.info(f"Generating notes from transcript in {target_language}...")
        
        # Get API key from environment
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            raise Exception(
                "OPENROUTER_API_KEY environment variable not set. "
                "Please create a .env file in the backend directory with your OpenRouter API key. "
                "Get your API key from https://openrouter.ai/"
            )
            
        # Choose model
        model = "mistralai/mistral-7b-instruct"
        
        # Prepare the prompt
        prompt = f"""Please create detailed ,lengthy, well-structured notes from this video transcript. \
        Focus on key concepts, examples, and important points that transcript is talking about. Format the output with clear hierarchy and minimal spacing.\n\n        Generate the notes in {target_language}. All headings, bullet points, and explanations should be in {target_language}.\n\n        Formatting Guidelines:\n        1. Main Headings: Use '###' prefix (e.g., \"### Section 1: Introduction\")\n        2. Sub-headings: Use '##' prefix (e.g., \"## Key Concepts\")\n        3. Content: Start with a single space after headings\n        4. Code Blocks: Use triple backticks with language specification\n        5. Lists: Use '--' for bullet points, no extra line breaks between items\n        6. Spacing:\n           - One blank line between main sections\n           - No extra lines between related content\n           - One blank line before and after code blocks\n           - No extra lines between list items\n\n        Transcript:\n        {transcript}\n        \n        Please include:\n        - Clear hierarchical structure with main and sub-headings\n        - Bullet points for key concepts\n        - Code examples if applicable\n        """
        
        # Make API request
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenRouter API error: {response.text}")
            
        result = response.json()
        notes = result['choices'][0]['message']['content']
        
        logger.info("Notes generation completed successfully")
        return notes
        
    except Exception as e:
        logger.error(f"Error in generate_notes: {str(e)}")
        raise Exception(f"Notes generation failed: {str(e)}") 