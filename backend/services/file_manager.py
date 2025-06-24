import os
import shutil
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler

logger = logging.getLogger(__name__)

class FileManager:
    def __init__(self):
        self.base_dir = "outputs"
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        os.makedirs(self.base_dir, exist_ok=True)
        
    def get_file_path(self, video_id: str, file_type: str) -> str:
        """Get path for a specific file type"""
        extensions = {
            'audio': 'mp3',
            'transcript': 'txt',
            'notes': 'md',
            'pdf': 'pdf'
        }
        extension = extensions.get(file_type, 'txt')
        return os.path.join(self.base_dir, f"{video_id}_{file_type}.{extension}")
        
    def file_exists(self, video_id: str, file_type: str) -> bool:
        """Check if a file exists"""
        return os.path.exists(self.get_file_path(video_id, file_type))
        
    def schedule_cleanup(self, video_id: str, delay_hours: int = 1):
        """Schedule cleanup of video files after specified hours"""
        job_id = f"cleanup_{video_id}"
        
        # Remove existing job if it exists
        try:
            if self.scheduler.get_job(job_id):
                self.scheduler.remove_job(job_id)
                logger.info(f"Removed existing cleanup job for video {video_id}")
        except Exception as e:
            logger.warning(f"Error removing existing cleanup job: {str(e)}")
        
        # Schedule new cleanup
        cleanup_time = datetime.now() + timedelta(hours=delay_hours)
        self.scheduler.add_job(
            self.cleanup_files,
            'date',
            run_date=cleanup_time,
            args=[video_id],
            id=job_id,
            replace_existing=True
        )
        logger.info(f"Scheduled cleanup for video {video_id} at {cleanup_time}")
        
    def cleanup_files(self, video_id: str):
        """Remove all files for a video"""
        try:
            for file_type in ['audio', 'transcript', 'notes', 'pdf']:
                file_path = self.get_file_path(video_id, file_type)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up {file_type} file for video {video_id}")
        except Exception as e:
            logger.error(f"Error cleaning up files for video {video_id}: {str(e)}")
            
    def cleanup_all_files(self):
        """Remove all files in the output directory"""
        try:
            if os.path.exists(self.base_dir):
                for file in os.listdir(self.base_dir):
                    file_path = os.path.join(self.base_dir, file)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                logger.info("Cleaned up all output files")
        except Exception as e:
            logger.error(f"Error cleaning up all files: {str(e)}")

# Create global file manager instance
file_manager = FileManager() 