'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Loader, FileVideo, Download, MessageSquare, Eye, Lock, Globe } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videoAPI } from '@/services/api';
import toast from 'react-hot-toast';

const VideoEditModal = ({ video, isOpen, onClose, courseId }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    isPreview: false,
    isPublished: true,
    allowDownload: false,
    enableComments: true,
    objectives: '',
    resources: ''
  });

  // Update form data when video changes
  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        order: video.order || 1,
        isPreview: video.isPreview || false,
        isPublished: video.isPublished !== false,
        allowDownload: video.allowDownload || false,
        enableComments: video.enableComments !== false,
        objectives: video.objectives || '',
        resources: video.resources || ''
      });
    }
  }, [video]);

  const updateMutation = useMutation({
    mutationFn: (data) => videoAPI.updateVideo(video._id, data),
    onSuccess: () => {
      toast.success('Video updated successfully!');
      queryClient.invalidateQueries(['courseVideos', courseId]);
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update video');
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up ring-1 ring-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Video Details</h2>
            <p className="text-sm text-gray-500 mt-0.5">Update information and settings for this lesson</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Video Info Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-start space-x-4">
            <div className="h-16 w-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {video?.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <FileVideo className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{video?.title}</h3>
              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                <span>{video?.size ? Math.round(video.size / (1024 * 1024)) : 0} MB</span>
                <span>•</span>
                <span>{video?.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
              </div>
              <a
                href={video?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview Video
              </a>
            </div>
          </div>

          {/* Basic Details */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter video title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="textarea w-full"
                placeholder="Describe what this video covers..."
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="input w-full"
                  min="1"
                />
                <p className="mt-1 text-xs text-gray-500">Sequence number in the course</p>
              </div>
            </div>
          </div>

          {/* Educational Content */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Educational Content</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Objectives
              </label>
              <textarea
                name="objectives"
                value={formData.objectives}
                onChange={handleInputChange}
                rows={2}
                className="textarea w-full"
                placeholder="What will students learn from this video?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Resources
              </label>
              <textarea
                name="resources"
                value={formData.resources}
                onChange={handleInputChange}
                rows={2}
                className="textarea w-full"
                placeholder="Links, materials, or references for this video..."
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Video Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`flex items-start p-3 rounded-xl border transition-all cursor-pointer ${formData.isPublished ? 'bg-primary-50 border-primary-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className={`font-medium block ${formData.isPublished ? 'text-primary-900' : 'text-gray-900'}`}>Published</span>
                  <span className={`block mt-0.5 ${formData.isPublished ? 'text-primary-700' : 'text-gray-500'}`}>
                    Visible to enrolled students
                  </span>
                </div>
                <Globe className={`ml-auto h-5 w-5 ${formData.isPublished ? 'text-primary-500' : 'text-gray-400'}`} />
              </label>

              <label className={`flex items-start p-3 rounded-xl border transition-all cursor-pointer ${formData.isPreview ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="isPreview"
                    checked={formData.isPreview}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className={`font-medium block ${formData.isPreview ? 'text-green-900' : 'text-gray-900'}`}>Free Preview</span>
                  <span className={`block mt-0.5 ${formData.isPreview ? 'text-green-700' : 'text-gray-500'}`}>
                    Available without enrollment
                  </span>
                </div>
                <Eye className={`ml-auto h-5 w-5 ${formData.isPreview ? 'text-green-500' : 'text-gray-400'}`} />
              </label>

              <label className={`flex items-start p-3 rounded-xl border transition-all cursor-pointer ${formData.allowDownload ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="allowDownload"
                    checked={formData.allowDownload}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className={`font-medium block ${formData.allowDownload ? 'text-blue-900' : 'text-gray-900'}`}>Allow Download</span>
                  <span className={`block mt-0.5 ${formData.allowDownload ? 'text-blue-700' : 'text-gray-500'}`}>
                    Students can save offline
                  </span>
                </div>
                <Download className={`ml-auto h-5 w-5 ${formData.allowDownload ? 'text-blue-500' : 'text-gray-400'}`} />
              </label>

              <label className={`flex items-start p-3 rounded-xl border transition-all cursor-pointer ${formData.enableComments ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    name="enableComments"
                    checked={formData.enableComments}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <span className={`font-medium block ${formData.enableComments ? 'text-purple-900' : 'text-gray-900'}`}>Enable Comments</span>
                  <span className={`block mt-0.5 ${formData.enableComments ? 'text-purple-700' : 'text-gray-500'}`}>
                    Allow student discussions
                  </span>
                </div>
                <MessageSquare className={`ml-auto h-5 w-5 ${formData.enableComments ? 'text-purple-500' : 'text-gray-400'}`} />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn-primary flex items-center"
            >
              {updateMutation.isLoading ? (
                <Loader className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoEditModal;
