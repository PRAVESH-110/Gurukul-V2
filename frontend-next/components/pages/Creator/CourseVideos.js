'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { courseAPI, videoAPI } from '@/services/api';
import VideoUpload from '@/components/Video/VideoUpload';
import VideoEditModal from '@/components/Video/VideoEditModal';
import { ArrowLeft, Video, Plus, Edit, Trash2, Eye, Settings, Play, MoreVertical, Clock, HardDrive, FileText, AlertCircle } from 'lucide-react';

const CourseVideos = () => {
  const params = useParams();
  const courseId = params?.courseId || params?.id;
  const router = useRouter();
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
      if (!courseId) {
        console.error('No courseId provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch course details and videos
        const [courseRes, videosRes] = await Promise.all([
          courseAPI.getCourse(courseId),
          videoAPI.getCourseVideos(courseId)
        ]);

        // Handle course data
        const courseData = courseRes.data?.course || courseRes.data;
        setCourse(courseData);

        // Handle videos data
        let videosData = [];

        if (videosRes?.data && videosRes.data.success === false) {
          toast.error(videosRes.data.message || 'Failed to load videos');
          setVideos([]);
          setError(videosRes.data.message || 'Failed to load videos');
          setIsLoading(false);
          return;
        }

        if (videosRes?.data) {
          if (Array.isArray(videosRes.data.data)) {
            videosData = videosRes.data.data;
          } else if (Array.isArray(videosRes.data)) {
            videosData = videosRes.data;
          } else if (videosRes.data.videos && Array.isArray(videosRes.data.videos)) {
            videosData = videosRes.data.videos;
          }
        }

        setVideos(videosData);
        setError(null);
      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Failed to load course data. Please try again.');
        toast.error('Failed to load course data');
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Refetch videos from API
  const refetchVideos = async () => {
    if (!courseId) return;

    try {
      const videosRes = await videoAPI.getCourseVideos(courseId);
      let videosData = [];

      if (videosRes?.data) {
        if (Array.isArray(videosRes.data.data)) {
          videosData = videosRes.data.data;
        } else if (Array.isArray(videosRes.data)) {
          videosData = videosRes.data;
        } else if (videosRes.data.videos && Array.isArray(videosRes.data.videos)) {
          videosData = videosRes.data.videos;
        }
      }

      setVideos(videosData);
    } catch (err) {
      console.error('Error refetching videos:', err);
      toast.error('Failed to refresh videos');
    }
  };

  // Handle successful video upload
  const handleVideoUploaded = async (newVideo) => {
    setShowUploadForm(false);
    toast.success('Video uploaded successfully!');
    await refetchVideos();
  };

  // Handle video deletion
  const handleVideoDeleted = async (videoId) => {
    await refetchVideos();
  };

  // Handle video update
  const handleVideoUpdated = async (updatedVideo) => {
    await refetchVideos();
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
        await refetchVideos();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete video';
        toast.error(errorMessage, { id: deleteToast });
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Content</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course?.title || 'Course Videos'}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage your course content and videos
                </p>
              </div>
            </div>

            {!showUploadForm && (
              <button
                onClick={() => setShowUploadForm(true)}
                className="btn-primary flex items-center shadow-lg shadow-primary-600/20"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Video
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 mt-6 -mb-px">
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'videos'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sections'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Sections
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showUploadForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Upload New Video</h2>
                <p className="text-sm text-gray-500">Upload and configure your video content</p>
              </div>
              <button
                onClick={() => setShowUploadForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <VideoUpload
                courseId={courseId}
                onUploadComplete={handleVideoUploaded}
                existingVideos={videos}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'videos' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                {videos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                      <Video className="h-10 w-10 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No videos yet</h3>
                    <p className="text-gray-500 max-w-sm mb-8">
                      Get started by uploading your first video lesson to this course.
                    </p>
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="btn-primary flex items-center"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Upload Video
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Video List Header */}
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        All Videos <span className="ml-2 text-sm font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">{videos.length}</span>
                      </h3>
                      <div className="text-sm text-gray-500">
                        Total Duration: {Math.round(videos.reduce((acc, v) => acc + (v.duration || 0), 0) / 60)} mins
                      </div>
                    </div>

                    {/* Video List */}
                    <div className="divide-y divide-gray-100">
                      {videos.map((video, index) => (
                        <div key={video._id} className="group p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-4">
                            {/* Video Thumbnail/Icon */}
                            <div className="flex-shrink-0 relative">
                              {video.thumbnailUrl || video.videoUrl ? (
                                <div className="relative w-32 aspect-video rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                  <img
                                    src={video.thumbnailUrl || (video.videoUrl && video.videoUrl.includes('imagekit.io') ? `${video.videoUrl}/ik-thumbnail.jpg` : null)}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://placehold.co/600x400?text=No+Thumbnail';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transform scale-90 group-hover:scale-100 transition-all" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-32 aspect-video bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-gray-300 transition-colors">
                                  <Video className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                                {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                              </div>
                            </div>

                            {/* Video Info */}
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-medium flex items-center justify-center">
                                  {video.order || index + 1}
                                </span>
                                <h4 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                                  {video.title}
                                </h4>
                                {video.isPreview && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Preview
                                  </span>
                                )}
                                {!video.isPublished && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Draft
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                {video.description || 'No description provided for this video.'}
                              </p>

                              <div className="flex items-center space-x-6 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <HardDrive className="h-3.5 w-3.5 mr-1.5" />
                                  {video.size ? `${Math.round(video.size / (1024 * 1024))} MB` : 'Unknown size'}
                                </div>
                                <div className="flex items-center">
                                  <div className={`w-2 h-2 rounded-full mr-1.5 ${video.status === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                  {video.status || 'Processing'}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a
                                href={video.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                title="Watch video"
                              >
                                <Eye className="h-5 w-5" />
                              </a>
                              <button
                                onClick={() => handleEditVideo(video)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit details"
                              >
                                <Edit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video._id, video.title)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete video"
                              >
                                <Trash2 className="h-5 w-5" />
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Course Sections</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Organize your course content into sections and lectures. This feature is currently under development.
                </p>
                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
                  Coming Soon
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
    </div>
  );
};

export default CourseVideos;

