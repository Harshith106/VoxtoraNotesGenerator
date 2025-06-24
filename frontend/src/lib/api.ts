import axios from 'axios';

const API_BASE_URL = '/api';

export interface TranscriptRequest {
  youtube_url: string;
  model_size: string;
  target_language: string;
}

export interface TranscriptResponse {
  video_id: string;
  detected_language: string;
  target_language: string;
  translated: boolean;
  audio_path: string;
  transcript_path: string;
  notes_path: string;
  pdf_path: string;
}

export interface ProgressResponse {
  video_id: string;
  current_step: string;
  progress_percentage: number;
  step_description: string;
  completed: boolean;
  error?: string;
}

export const api = {
  async processVideo(data: TranscriptRequest): Promise<TranscriptResponse> {
    try {
      console.log('Sending request to API:', data);
      const response = await axios.post(`${API_BASE_URL}/transcript`, data, {
        timeout: 300000, // 5 minutes timeout
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('API response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const message = error.response.data?.detail || error.response.data?.message || `Server error: ${error.response.status}`;
          throw new Error(message);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('No response from server. Please check your connection.');
        } else {
          // Something else happened
          throw new Error(`Request failed: ${error.message}`);
        }
      }
      throw new Error('An unexpected error occurred');
    }
  },

  async getProgress(videoId: string): Promise<ProgressResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/progress/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Progress API Error:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Progress not found');
      }
      throw new Error('Failed to get progress');
    }
  }
};