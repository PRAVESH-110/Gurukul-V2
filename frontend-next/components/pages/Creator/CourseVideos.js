'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { courseAPI, videoAPI } from '@/services/api';
import VideoUpload from '@/components/Video/VideoUpload';
import VideoEditModal from '@/components/Video/VideoEditModal';
import {
  ArrowLeft,
  Video,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Play,
  MoreVertical,
  Clock,
  HardDrive,
  FileText,
  AlertCircle,
  Folder,
  Layers,
  Check,
  X,
} from 'lucide-react';

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

  // Sections management state
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionDescription, setNewSectionDescription] = useState('');
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionTitle, setEditSectionTitle] = useState('');
  const [editSectionDescription, setEditSectionDescription] = useState('');

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
          videoAPI.getCourseVideos(courseId),
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

  // Sections CRUD operations
  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newSectionTitle.trim()) {
      toast.error('Please enter a section title');
      return;
    }

    try {
      const res = await courseAPI.addCourseSection(courseId, {
        title: newSectionTitle.trim(),
        description: newSectionDescription.trim(),
      });
      toast.success('Section created successfully!');
      setNewSectionTitle('');
      setNewSectionDescription('');
      setIsCreatingSection(false);
      setCourse((prev) => ({
        ...prev,
        sections: res.data?.sections || [...(prev?.sections || []), res.data?.section],
      }));
    } catch (err) {
      console.error('Failed to create section:', err);
      toast.error(err.response?.data?.message || 'Failed to create section');
    }
  };

  const handleUpdateSection = async (sectionId) => {
    if (!editSectionTitle.trim()) {
      toast.error('Section title cannot be empty');
      return;
    }

    try {
      const res = await courseAPI.updateCourseSection(courseId, sectionId, {
        title: editSectionTitle.trim(),
        description: editSectionDescription.trim(),
      });
      toast.success('Section updated successfully!');
      setEditingSectionId(null);
      setCourse((prev) => ({
        ...prev,
        sections:
          res.data?.sections ||
          prev?.sections?.map((s) => (s._id === sectionId ? { ...s, ...res.data?.section } : s)),
      }));
    } catch (err) {
      console.error('Failed to update section:', err);
      toast.error(err.response?.data?.message || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (sectionId, sectionTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${sectionTitle}"? Any videos in this section will be moved to the General section.`,
      )
    ) {
      return;
    }

    try {
      const res = await courseAPI.deleteCourseSection(courseId, sectionId);
      toast.success('Section deleted successfully!');
      setCourse((prev) => ({
        ...prev,
        sections: res.data?.sections || prev?.sections?.filter((s) => s._id !== sectionId),
      }));
      await refetchVideos();
    } catch (err) {
      console.error('Failed to delete section:', err);
      toast.error(err.response?.data?.message || 'Failed to delete section');
    }
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
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Content</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
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
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'videos'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'sections'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sections
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                        All Videos{' '}
                        <span className="ml-2 text-sm font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                          {videos.length}
                        </span>
                      </h3>
                      <div className="text-sm text-gray-500">
                        Total Duration:{' '}
                        {Math.round(videos.reduce((acc, v) => acc + (v.duration || 0), 0) / 60)}{' '}
                        mins
                      </div>
                    </div>

                    {/* Video List */}
                    <div className="divide-y divide-gray-100">
                      {videos.map((video, index) => (
                        <div
                          key={video._id}
                          className="group p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-4">
                            {/* Video Thumbnail/Icon */}
                            <div className="flex-shrink-0 relative">
                              {video.thumbnailUrl || video.videoUrl ? (
                                <div className="relative w-32 aspect-video rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                                  <img
                                    src={
                                      video.thumbnailUrl ||
                                      (video.videoUrl && video.videoUrl.includes('imagekit.io')
                                        ? `${video.videoUrl}/ik-thumbnail.jpg`
                                        : null)
                                    }
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        'https://placehold.co/600x400?text=No+Thumbnail';
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
                                {video.duration
                                  ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`
                                  : '0:00'}
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
                                  {video.size
                                    ? `${Math.round(video.size / (1024 * 1024))} MB`
                                    : 'Unknown size'}
                                </div>
                                <div className="flex items-center">
                                  <div
                                    className={`w-2 h-2 rounded-full mr-1.5 ${video.status === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'}`}
                                  ></div>
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
              <div className="space-y-6">
                {/* Section Creation Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  {!isCreatingSection ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Curriculum Sections</h2>
                        <p className="text-sm text-gray-500">
                          Group your course videos into organized modules, chapters, or weeks.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsCreatingSection(true)}
                        className="btn-primary flex items-center shrink-0 shadow-sm"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Section
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateSection} className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b pb-3">
                        <h3 className="font-semibold text-gray-900 text-base">New Section</h3>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingSection(false);
                            setNewSectionTitle('');
                            setNewSectionDescription('');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Section Title *
                          </label>
                          <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            placeholder="e.g. Chapter 1: Introduction to Web Development"
                            className="input w-full"
                            autoFocus
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            value={newSectionDescription}
                            onChange={(e) => setNewSectionDescription(e.target.value)}
                            placeholder="Briefly describe what this section covers"
                            className="input w-full"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingSection(false)}
                          className="btn-outline text-sm py-2 px-4"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary text-sm py-2 px-5">
                          Save Section
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Sections List */}
                {!course?.sections || course.sections.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Folder className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No sections created yet
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm">
                      Create your first section above to start organizing your lectures into logical
                      curriculum milestones.
                    </p>
                    <button
                      onClick={() => setIsCreatingSection(true)}
                      className="btn-primary inline-flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Section
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {course.sections.map((section, sIndex) => {
                      const isEditing = editingSectionId === section._id;
                      const sectionVideos = videos.filter(
                        (v) =>
                          v.section === section._id ||
                          v.section?.toString() === section._id?.toString() ||
                          (sIndex === 0 &&
                            (!v.section || v.section === 'Main' || v.section === 'main')),
                      );

                      return (
                        <div
                          key={section._id || sIndex}
                          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200"
                        >
                          {/* Section Header */}
                          <div className="p-5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                            {isEditing ? (
                              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mr-3">
                                <input
                                  type="text"
                                  value={editSectionTitle}
                                  onChange={(e) => setEditSectionTitle(e.target.value)}
                                  className="input flex-1 py-1.5 text-sm font-semibold"
                                  placeholder="Section Title"
                                />
                                <input
                                  type="text"
                                  value={editSectionDescription}
                                  onChange={(e) => setEditSectionDescription(e.target.value)}
                                  className="input flex-1 py-1.5 text-xs"
                                  placeholder="Section Description"
                                />
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => handleUpdateSection(section._id)}
                                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                    title="Save"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingSectionId(null)}
                                    className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 text-primary-700 text-xs font-bold shrink-0">
                                  {sIndex + 1}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-base font-bold text-gray-900 truncate">
                                    {section.title}
                                  </h4>
                                  {section.description && (
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                      {section.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {!isEditing && (
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs font-medium text-gray-500 bg-white border px-2.5 py-1 rounded-full">
                                  {sectionVideos.length}{' '}
                                  {sectionVideos.length === 1 ? 'lecture' : 'lectures'}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingSectionId(section._id);
                                    setEditSectionTitle(section.title);
                                    setEditSectionDescription(section.description || '');
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Section"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(section._id, section.title)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Section"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Section Lectures */}
                          <div className="p-4">
                            {sectionVideos.length === 0 ? (
                              <p className="text-xs text-gray-400 italic py-3 text-center">
                                No lectures assigned to this section yet. Edit a video or upload one
                                to assign it here.
                              </p>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {sectionVideos.map((video, vIndex) => (
                                  <div
                                    key={video._id}
                                    className="py-2.5 flex items-center justify-between text-sm hover:bg-gray-50/50 px-2 rounded-lg transition-colors"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <Play className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                                      <span className="font-medium text-gray-800 truncate">
                                        {video.title}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                                      <span>
                                        {video.duration
                                          ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`
                                          : '0:00'}
                                      </span>
                                      <button
                                        onClick={() => handleEditVideo(video)}
                                        className="text-primary-600 hover:underline"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
          sections={course?.sections || []}
        />
      </div>
    </div>
  );
};

export default CourseVideos;
