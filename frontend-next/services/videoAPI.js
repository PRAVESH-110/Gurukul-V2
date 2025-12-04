import api from './api';

const videoAPI = {
  // Upload a new video
  uploadVideo: async (formData, config = {}) => {
    try {
      const response = await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: config.onUploadProgress,
      });
      return response;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  // Get video details
  getVideo: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Update video details
  updateVideo: async (videoId, videoData) => {
    try {
      const response = await api.put(`/videos/${videoId}`, videoData);
      return response.data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  // Delete a video
  deleteVideo: async (videoId) => {
    try {
      const response = await api.delete(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // Get all videos for a course
  getCourseVideos: async (courseId) => {
    try {
      const response = await api.get(`/videos/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course videos:', error);
      throw error;
    }
  },

  // Get upload URL for direct upload
  getUploadUrl: async (filename, mimeType) => {
    try {
      const response = await api.get('/videos/upload-url', {
        params: { filename, mimeType },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting upload URL:', error);
      throw error;
    }
  },

  // Get video analytics
  getVideoAnalytics: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      throw error;
    }
  },

  // Update video order in a section
  updateVideoOrder: async (courseId, sectionId, videoOrder) => {
    try {
      const response = await api.put(`/videos/course/${courseId}/order`, {
        sectionId,
        videoOrder,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating video order:', error);
      throw error;
    }
  },
};

export default videoAPI;
