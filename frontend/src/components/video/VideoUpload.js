import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { videoAPI } from '../../services/api';
import { FiUpload, FiX, FiCheck, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

const VideoUpload = ({ courseId, onUploadComplete, existingVideos = [] }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [sections, setSections] = useState([{ id: 'main', name: 'Main Section' }]);
  const [selectedSection, setSelectedSection] = useState('main');
  const [showNewSectionInput, setShowNewSectionInput] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [videos, setVideos] = useState(existingVideos);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid video file (MP4, WebM, OGG, or MOV)');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size must be less than 100MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setValue('title', file.name.replace(/\.[^/.]+$/, '')); // Set default title from filename
  };

  // Add a new section
  const addSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    
    const newSection = {
      id: `section-${Date.now()}`,
      name: newSectionName.trim()
    };
    
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
    setNewSectionName('');
    setShowNewSectionInput(false);
  };

  // Handle video upload
  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('courseId', courseId);
      formData.append('sectionId', selectedSection);
      formData.append('isPublished', data.isPublished || false);

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      const response = await videoAPI.uploadVideo(formData, config);
      
      // Add the new video to the list
      setVideos([...videos, response.data]);
      
      toast.success('Video uploaded successfully!');
      reset();
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(response.data);
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle video deletion
  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      try {
        await videoAPI.deleteVideo(videoId);
        setVideos(videos.filter(video => video._id !== videoId));
        toast.success('Video deleted successfully');
      } catch (error) {
        console.error('Error deleting video:', error);
        toast.error(error.response?.data?.message || 'Failed to delete video');
      }
    }
  };

  // Handle video edit
  const handleEditVideo = (video) => {
    setIsEditing(true);
    setEditingVideo(video);
    setValue('title', video.title);
    setValue('description', video.description);
    setSelectedSection(video.section || 'main');
  };

  // Handle update video
  const handleUpdateVideo = async (data) => {
    try {
      const updatedVideo = {
        ...editingVideo,
        title: data.title,
        description: data.description,
        section: selectedSection,
        isPublished: data.isPublished || false
      };

      const response = await videoAPI.updateVideo(editingVideo._id, updatedVideo);
      
      // Update the video in the list
      setVideos(videos.map(video => 
        video._id === editingVideo._id ? response.data : video
      ));
      
      toast.success('Video updated successfully!');
      reset();
      setIsEditing(false);
      setEditingVideo(null);
    } catch (error) {
      console.error('Error updating video:', error);
      toast.error(error.response?.data?.message || 'Failed to update video');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingVideo(null);
    reset();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Video' : 'Upload New Video'}
      </h2>
      
      <form onSubmit={handleSubmit(isEditing ? handleUpdateVideo : onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Video upload/preview */}
          <div className="space-y-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                selectedFile ? 'border-green-500' : 'border-gray-300 hover:border-blue-500'
              }`}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isUploading || isEditing}
              />
              
              {selectedFile || (editingVideo && editingVideo.thumbnailUrl) ? (
                <div className="relative">
                  {selectedFile ? (
                    <video
                      src={previewUrl}
                      className="w-full h-48 object-cover rounded-md mb-4"
                      controls
                    />
                  ) : (
                    <img
                      src={editingVideo.thumbnailUrl}
                      alt={editingVideo.title}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {isUploading ? 'Uploading...' : 'Click to upload a video or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">MP4, WebM, OGG, or MOV (max. 100MB)</p>
                </div>
              )}
              
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
            
            {selectedFile && (
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">File:</span> {selectedFile.name}</p>
                <p><span className="font-medium">Size:</span> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            )}
          </div>
          
          {/* Right column - Form fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.title ? 'border-red-500' : ''
                }`}
                placeholder="Enter video title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter video description (optional)"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                  
                  {!showNewSectionInput ? (
                    <button
                      type="button"
                      onClick={() => setShowNewSectionInput(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPlus className="mr-1" /> New
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSectionName}
                        onChange={(e) => setNewSectionName(e.target.value)}
                        placeholder="Section name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={addSection}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <FiCheck />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewSectionInput(false)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isPublished')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish this video</span>
                </label>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    disabled={!selectedFile || isUploading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Video'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* Video List */}
      {videos.length > 0 && (
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Videos</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {videos.map((video) => (
                <li key={video._id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate">
                        <div className="flex text-sm">
                          <p className="font-medium text-blue-600 truncate">
                            {video.title}
                          </p>
                          <p className="ml-2 flex-shrink-0 font-normal text-gray-500">
                            {video.duration ? `(${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')})` : ''}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {video.isPublished ? 'Published' : 'Draft'}
                            </span>
                            <span className="ml-2">
                              {sections.find(s => s.id === video.section)?.name || 'Uncategorized'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditVideo(video)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(video._id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
