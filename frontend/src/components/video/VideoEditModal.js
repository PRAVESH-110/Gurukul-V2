import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videoAPI } from '../../services/api';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Video</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Video Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Video File</h3>
            <p className="text-sm text-gray-600">
              {video?.title} • {video?.size ? Math.round(video.size / (1024 * 1024)) : 0}MB
            </p>
            <a 
              href={video?.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              View Video →
            </a>
          </div>

          {/* Basic Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="input w-full"
                placeholder="Describe what this video covers..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </label>
              <textarea
                name="objectives"
                value={formData.objectives}
                onChange={handleInputChange}
                rows={2}
                className="input w-full"
                placeholder="What will students learn from this video?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Resources
              </label>
              <textarea
                name="resources"
                value={formData.resources}
                onChange={handleInputChange}
                rows={2}
                className="input w-full"
                placeholder="Links, materials, or references for this video..."
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Video Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span className="ml-3">
                  <span className="font-medium">Published</span>
                  <span className="block text-sm text-gray-500">
                    Students can access this video
                  </span>
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPreview"
                  checked={formData.isPreview}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span className="ml-3">
                  <span className="font-medium">Free Preview</span>
                  <span className="block text-sm text-gray-500">
                    Allow non-enrolled students to watch this video
                  </span>
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowDownload"
                  checked={formData.allowDownload}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span className="ml-3">
                  <span className="font-medium">Allow Download</span>
                  <span className="block text-sm text-gray-500">
                    Students can download this video
                  </span>
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="enableComments"
                  checked={formData.enableComments}
                  onChange={handleInputChange}
                  className="rounded border-gray-300"
                />
                <span className="ml-3">
                  <span className="font-medium">Enable Comments</span>
                  <span className="block text-sm text-gray-500">
                    Students can comment on this video
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
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