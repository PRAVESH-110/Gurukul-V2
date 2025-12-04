'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { videoAPI } from '@/services/api';
import { Upload, X, Check, Plus, Trash2, Edit2, FileVideo, AlertCircle, Film } from 'lucide-react';

const VideoUpload = ({ courseId, onUploadComplete, existingVideos = [] }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { user } = useAuth();
  const router = useRouter();
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
    if (!selectedFile && !isEditing) {
      toast.error('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let uploadResponse = null;

      // Step 1: Upload video to ImageKit first (only if new file selected)
      if (selectedFile) {
        const progressHandler = (progress) => {
          setUploadProgress(progress);
        };

        console.log('📤 Uploading video to ImageKit...');
        uploadResponse = await videoAPI.uploadVideoToImageKit(selectedFile, progressHandler);
        console.log('✅ Video uploaded to ImageKit:', uploadResponse);
      }

      // Step 2: Create or update video record
      if (isEditing) {
        const updatedVideo = {
          ...editingVideo,
          title: data.title,
          description: data.description,
          section: selectedSection,
          isPublished: data.isPublished || false
        };

        // If new file uploaded, update url and fileId
        if (uploadResponse) {
          updatedVideo.url = uploadResponse.url;
          updatedVideo.videoUrl = uploadResponse.url;
          updatedVideo.fileId = uploadResponse.fileId;
          updatedVideo.thumbnailUrl = uploadResponse.thumbnailUrl || '';
          updatedVideo.size = uploadResponse.size || selectedFile.size;
        }

        const response = await videoAPI.updateVideo(editingVideo._id, updatedVideo);

        // Update the video in the list
        setVideos(videos.map(video =>
          video._id === editingVideo._id ? response.data : video
        ));

        toast.success('Video updated successfully!');
        setIsEditing(false);
        setEditingVideo(null);
      } else {
        const videoRecord = {
          title: data.title,
          description: data.description || '',
          url: uploadResponse.url,
          videoUrl: uploadResponse.url,
          fileId: uploadResponse.fileId,
          course: courseId,
          section: selectedSection,
          isPublished: data.isPublished || false,
          thumbnailUrl: uploadResponse.thumbnailUrl || '',
          size: uploadResponse.size || selectedFile.size,
          bytes: uploadResponse.size || selectedFile.size,
          duration: 1, // Will be updated by webhook
          order: videos.length + 1,
          status: 'processing',
          isActive: true
        };

        console.log('📤 Creating video record:', videoRecord);
        const response = await videoAPI.createVideoRecord(videoRecord);

        const newVideo = response.data?.data || response.data;
        setVideos([...videos, newVideo]);

        toast.success('Video uploaded successfully!');

        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete(newVideo);
        }
      }

      reset();
      setSelectedFile(null);
      setPreviewUrl('');

    } catch (error) {
      console.error('❌ Error uploading video:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload video';
      toast.error(errorMessage);
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
    setValue('isPublished', video.isPublished);
    setSelectedSection(video.section || 'main');
    setPreviewUrl(video.url); // Show existing video
    setSelectedFile(null); // Reset file selection
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingVideo(null);
    reset();
    setSelectedFile(null);
    setPreviewUrl('');
  };

  return (
    <div className="bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Video upload/preview */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${selectedFile || (isEditing && previewUrl)
                ? 'border-primary-500 bg-primary-50/30'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                }`}
              onClick={() => fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              {selectedFile || (isEditing && previewUrl) ? (
                <div className="relative group">
                  <video
                    src={previewUrl}
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                    controls
                  />
                  {!isUploading && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <p className="text-white font-medium flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        Change Video
                      </p>
                    </div>
                  )}
                  {selectedFile && !isUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(isEditing ? editingVideo.url : '');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="py-8">
                  <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="text-base font-medium text-gray-900 mb-1">
                    Click to upload video
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or drag and drop MP4, WebM, OGG, or MOV
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Max size: 100MB
                  </p>
                </div>
              )}

              {isUploading && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm font-medium text-gray-900 mb-2">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Film className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Right column - Form fields */}
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Video Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className={`input w-full ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g. Introduction to React Hooks"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows="4"
                className="textarea w-full"
                placeholder="Briefly describe what this video covers..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <div className="flex space-x-2">
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="input w-full"
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
                      className="p-2 text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                      title="Add new section"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  ) : null}
                </div>

                {showNewSectionInput && (
                  <div className="mt-2 flex items-center space-x-2 animate-fade-in">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="New section name"
                      className="input w-full py-1 text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={addSection}
                      className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewSectionInput(false)}
                      className="p-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      {...register('isPublished')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">Publish immediately</span>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-6">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn-primary"
                  >
                    {isUploading ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="btn-primary w-full md:w-auto"
                >
                  {isUploading ? 'Uploading...' : 'Upload Video'}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VideoUpload;

