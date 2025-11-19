import axios from 'axios';
import { toast } from 'react-hot-toast';

// Determine the base URL based on the environment
const getBaseUrl = () => {
  // In development, use the local backend
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }
  // In production, use the production URL
  return import.meta.env.VITE_API_URL_PROD || 'https://gurukul-platform-api.onrender.com/api';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  validateStatus: (status) => status >= 200 && status < 500, // Resolve only if the status code is less than 500
  crossDomain: true,
  withXSRFToken: true
});

// Request interceptor to handle form data vs JSON
api.interceptors.request.use((config) => {
  // Don't set Content-Type for FormData, let the browser set it with the correct boundary
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Add a request interceptor to handle credentials
api.interceptors.request.use(config => {
  // Get the CSRF token from cookies if it exists
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  
  // Ensure credentials are sent with every request
  config.withCredentials = true;
  
  return config;
});

// Request interceptor to add auth token and handle request logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      console.log(`%c ${config.method?.toUpperCase()} ${config.url}`, 
        'color: #0086b3; font-weight: bold', 
        { params: config.params, data: config.data }
      );
    }
    
    return config;
  },
  (error) => {
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      console.log(
        `%c ${response.status} ${response.config.url}`, 
        `color: ${response.status >= 200 && response.status < 300 ? '#4CAF50' : '#FFA000'}; font-weight: bold`,
        response.data
      );
    }
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear any existing token
      localStorage.removeItem('token');
      // Redirect to login or show unauthorized message
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?sessionExpired=true';
      }
    }
    
    return response;
  },
  (error) => {
    // Handle errors
    if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true') {
      console.error('API Error:', error);
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?sessionExpired=true';
        }
      } else if (status === 403) {
        // Forbidden - show access denied
        toast.error('You do not have permission to perform this action');
      } else if (status === 404) {
        // Not found
        console.error('API Endpoint not found:', error.config.url);
      } else if (status >= 500) {
        // Server error
        toast.error('Server error. Please try again later.');
      }
      
      // Log detailed error in development
      if (import.meta.env.VITE_APP_ENV === 'development') {
        console.error('API Error:', {
          url: error.config.url,
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      }
      
      return Promise.reject({
        status: error.response.status,
        message: data.message || 'An error occurred',
        errors: data.errors,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response from server:', error.request);
      toast.error('Unable to connect to the server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserCommunities: (id) => api.get(`/users/${id}/communities`),
  getUserCourses: (id) => api.get(`/users/${id}/courses`),
};

// Community API
export const communityAPI = {
  getCommunities: (params) => api.get('/communities', { params }),
  getCreatorCommunities: (params) => api.get('/communities/me', { params }),
  createCommunity: (data) => api.post('/communities', data),
  getCommunity: (id) => api.get(`/communities/${id}`),
  updateCommunity: (id, data) => api.put(`/communities/${id}`, data),
  deleteCommunity: (id) => api.delete(`/communities/${id}`),
  updateCommunityStatus: (id, status) => api.patch(`/communities/${id}/status`, { status }),
  joinCommunity: (id) => api.post(`/communities/${id}/join`),
  leaveCommunity: (id) => api.post(`/communities/${id}/leave`),
  getCommunityMembers: (id) => api.get(`/communities/${id}/members`),
  getCommunityPosts: (id, params) => api.get(`/communities/${id}/posts`, { params }),

  
  createPost: (communityId, formData) => {
    console.log(`Sending request to: /api/communities/${communityId}/posts`);
    return api.post(`/communities/${communityId}/posts`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch(error => {
      console.error('API Error:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
    });
  },
  getCommunityEvents: (id, params) => api.get(`/communities/${id}/events`, { params }),
  createEvent: (communityId, data) => api.post(`/communities/${communityId}/events`, data),
};

// Course API
export const courseAPI = {
  getCourses: (params) => api.get('/courses', { params }),
  getCreatorCourses: () => api.get('/courses/creator/me'),
  createCourse: (data) => api.post('/courses', data),
  getCourse: (id) => api.get(`/courses/${id}`),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  unenrollfromcourse: (id) => api.delete(`/courses/${id}/unenroll`),
  getCourseVideos: (id) => api.get(`/videos/course/${id}`),
  getEnrolledStudents: (id) => api.get(`/courses/${id}/students`),
  addCourseReview: (id, data) => api.post(`/courses/${id}/review`, data),
};

// Video API
export const videoAPI = {
  createVideo: (data) => api.post('/videos', data),
  
  // Enhanced video upload with ImageKit.io
  uploadVideo: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // 10 minutes for video upload (max 100MB)
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined,
    });
  },
  
  // Server-side video upload (fallback for CORS issues)
  uploadVideoToServer: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // 10 minutes for video upload
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined,
    });
  },

  // ImageKit.io video upload via server (primary method)
  uploadVideoToImageKit: async (file, onProgress) => {
    try {
      console.log('🎬 Starting video upload:', file.name, `(${Math.round(file.size/1024/1024)}MB)`);
      console.log('📡 Uploading via server to ImageKit...');
      
      const serverResponse = await videoAPI.uploadVideoToServer(file, onProgress);
      console.log('✅ Video uploaded successfully to ImageKit!');
      
      return {
        url: serverResponse.data.url,
        fileId: serverResponse.data.fileId,
        name: serverResponse.data.name,
        size: serverResponse.data.size,
        thumbnailUrl: serverResponse.data.thumbnailUrl
      };
      
    } catch (error) {
      console.error('❌ Video upload failed:', error);
      throw new Error(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  },
  
  getVideo: (id) => api.get(`/videos/${id}`),
  updateVideo: (id, data) => api.put(`/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/videos/${id}`),
  updateWatchProgress: (id, progress) => api.post(`/videos/${id}/watch`, { progress }),
  getVideoStream: (id) => `${api.defaults.baseURL}/videos/${id}/stream`,
  getImageKitAuth: () => api.get('/upload/imagekit-auth'),
  createVideoRecord: (data) => api.post('/videos', data), // Create video record after upload
  getCourseVideos: (courseId) => api.get(`/videos/course/${courseId}`), // Get videos for a specific course
};

// Post API
export const postAPI = {
  getPost: (id) => api.get(`/posts/${id}`),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comments`, data),
  updateComment: (postId, commentId, data) => api.put(`/posts/${postId}/comments/${commentId}`, data),
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

// Event API
export const eventAPI = {
  getEvent: (id) => api.get(`/events/${id}`),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  rsvpToEvent: (id, status) => api.post(`/events/${id}/attend`, { status }),
};

// Dashboard API
export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getCreatorDashboard: () => api.get('/dashboard/creator'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getImageKitAuth: () => api.get('/upload/auth'),
};

// Search API
export const searchAPI = {
  searchCommunities: (params) => api.get('/search/communities', { params }),
  searchCourses: (params) => api.get('/search/courses', { params }),
  searchUsers: (params) => api.get('/search/users', { params }),
  searchPosts: (params) => api.get('/search/posts', { params }),
  globalSearch: (params) => api.get('/search/global', { params }),
};

export default api;
