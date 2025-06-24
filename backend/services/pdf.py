import os
import logging
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import black
import markdown2
import re
from .file_manager import file_manager

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """Clean text by removing HTML tags and special characters."""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Remove special characters that might cause issues
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    return text.strip()

async def create_pdf(markdown_content: str, video_id: str) -> str:
    """
    Create a PDF from markdown content using reportlab.
    
    Args:
        markdown_content (str): Markdown content to convert to PDF
        video_id (str): ID of the video associated with the markdown content
        
    Returns:
        str: Path to the created PDF file
    """
    try:
        logger.info("Starting PDF creation...")
        
        # Set output path
        output_path = file_manager.get_file_path(video_id, "pdf")
        logger.info(f"Output PDF path: {output_path}")
        
        # Remove existing PDF if it exists
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
                logger.info(f"Removed existing PDF file: {output_path}")
            except Exception as e:
                logger.warning(f"Error removing existing PDF: {str(e)}")
        
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Create styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=black
        )
        heading1_style = ParagraphStyle(
            'CustomHeading1',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=20,
            spaceBefore=20,
            textColor=black
        )
        heading2_style = ParagraphStyle(
            'CustomHeading2',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=15,
            spaceBefore=15,
            textColor=black
        )
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            leading=14,
            textColor=black
        )
        
        # Create content
        content = [
            Paragraph('Video Notes', title_style),
            Spacer(1, 20)
        ]
        
        # Process markdown content
        lines = markdown_content.split('\n')
        current_section = []
        
        for line in lines:
            line = clean_text(line)
            if not line:
                if current_section:
                    # Add accumulated section content
                    content.extend(current_section)
                    content.append(Spacer(1, 12))
                    current_section = []
                continue
                
            try:
                if line.startswith('###'):
                    # Main heading
                    if current_section:
                        content.extend(current_section)
                        content.append(Spacer(1, 12))
                        current_section = []
                    content.append(Paragraph(line[4:], heading1_style))
                elif line.startswith('##'):
                    # Sub-heading
                    if current_section:
                        content.extend(current_section)
                        content.append(Spacer(1, 12))
                        current_section = []
                    content.append(Paragraph(line[3:], heading2_style))
                elif line.startswith('--'):
                    # Bullet point
                    current_section.append(Paragraph('• ' + line[2:], body_style))
                elif line.startswith('```'):
                    # Code block - skip for now
                    continue
                else:
                    # Regular text
                    current_section.append(Paragraph(line, body_style))
            except Exception as e:
                logger.warning(f"Error processing line: {str(e)}")
                continue
        
        # Add any remaining content
        if current_section:
            content.extend(current_section)
        
        # Build PDF
        doc.build(content)
        
        if not os.path.exists(output_path):
            raise Exception("PDF file was not created")
            
        file_size = os.path.getsize(output_path)
        if file_size == 0:
            raise Exception("Created PDF file is empty")
            
        logger.info(f"PDF created successfully at: {output_path} (size: {file_size} bytes)")
        return output_path
        
    except Exception as e:
        logger.error(f"Error creating PDF: {str(e)}")
        raise Exception(f"Failed to create PDF: {str(e)}") 