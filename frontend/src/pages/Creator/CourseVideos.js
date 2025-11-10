import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI, videoAPI } from '../../services/api';
import VideoUpload from '../../components/video/VideoUpload';
import VideoEditModal from '../../components/video/VideoEditModal';
import { ArrowLeft, Video, Plus, Edit, Trash2, Eye, Settings, Play, MoreVertical } from 'lucide-react';

const CourseVideos = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'sections'
  const [editingVideo, setEditingVideo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch course and videos data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch course details and videos
        const [courseRes, videosRes] = await Promise.all([
          courseAPI.getCourse(courseId),
          videoAPI.getCourseVideos(courseId)
        ]);
        
        // Handle course data (which might be in courseRes.data.course or courseRes.data)
        const courseData = courseRes.data?.course || courseRes.data;
        setCourse(courseData);
        
        // Handle videos data (which might be in videosRes.data.data or just videosRes.data)
        const videosData = videosRes.data?.data || videosRes.data || [];
        setVideos(Array.isArray(videosData) ? videosData : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load course data. Please try again.');
        toast.error('Failed to load course data');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId]);

  // Handle successful video upload
  const handleVideoUploaded = (newVideo) => {
    setVideos([...videos, newVideo]);
    setShowUploadForm(false);
    toast.success('Video uploaded successfully!');
  };

  // Handle video deletion
  const handleVideoDeleted = (videoId) => {
    setVideos(videos.filter(video => video._id !== videoId));
  };

  // Handle video update
  const handleVideoUpdated = (updatedVideo) => {
    setVideos(videos.map(video => 
      video._id === updatedVideo._id ? updatedVideo : video
    ));
  };

  // Handle edit video
  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setShowEditModal(true);
  };

  // Handle delete video
  const handleDeleteVideo = async (videoId, videoTitle) => {
    const confirmMessage = `Are you sure you want to delete "${videoTitle}"?\n\nThis will permanently remove the video from the course.\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      const deleteToast = toast.loading('Deleting video...');
      
      try {
        await videoAPI.deleteVideo(videoId);
        toast.success('Video deleted successfully', { id: deleteToast });
        setVideos(videos.filter(video => video._id !== videoId));
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete video';
        toast.error(errorMessage, { id: deleteToast });
        console.error('Delete video error:', error);
      }
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingVideo(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Course
        </button>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {course?.title || 'Course Videos'}
            </h1>
            <p className="text-gray-600 mt-1">
              
            </p>
          </div>
          
          {!showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Video
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('videos')}
              className={`${
                activeTab === 'videos'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`${
                activeTab === 'sections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Sections
            </button>
          </nav>
        </div>
      </div>
      
      {showUploadForm ? (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Upload New Video</h2>
            <button
              onClick={() => setShowUploadForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          <VideoUpload 
            courseId={courseId} 
            onUploadComplete={handleVideoUploaded}
            existingVideos={videos}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === 'videos' ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              {videos.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No videos yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by uploading your first video.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Upload Video
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Video List Header */}
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Course Videos ({videos.length})
                      </h3>
                    </div>
                  </div>

                  {/* Video List */}
                  <div className="divide-y divide-gray-200">
                    {videos.map((video, index) => (
                      <div key={video._id} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          {/* Video Thumbnail/Icon */}
                          <div className="flex-shrink-0">
                            {video.thumbnailUrl ? (
                              <img
                                src={video.thumbnailUrl}
                                alt={video.title}
                                className="w-16 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-10 bg-primary-100 rounded flex items-center justify-center">
                                <Play className="h-4 w-4 text-primary-600" />
                              </div>
                            )}
                          </div>

                          {/* Video Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                #{video.order || index + 1}
                              </span>
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {video.title}
                              </h4>
                              {video.isPreview && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Preview
                                </span>
                              )}
                              {!video.isPublished && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {video.description || 'No description'}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Duration: {video.duration || 'Unknown'}</span>
                              <span>Size: {video.size ? Math.round(video.size / (1024 * 1024)) : 0}MB</span>
                              <span>Status: {video.status || 'Ready'}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Watch video"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                            <button
                              onClick={() => handleEditVideo(video)}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full"
                              title="Edit video"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video._id, video.title)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete video"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Course Sections</h2>
              <p className="text-gray-600 mb-6">
                Organize your course content into sections and lectures. Drag and drop to reorder.
              </p>
              
              {/* Sections list will be implemented here */}
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                <p className="text-gray-500">Sections management coming soon</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Edit Modal */}
      <VideoEditModal
        video={editingVideo}
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        courseId={courseId}
      />
    </div>
  );
};

export default CourseVideos;
