'use client';

import React, { useState, useCallback } from 'react';
import { Upload, Video, X, AlertCircle, CheckCircle } from 'lucide-react';
import { videoAPI } from '@/services/api';
import toast from 'react-hot-toast';

const EnhancedVideoUpload = ({
  onUploadComplete,
  onUploadError,
  maxSize = 104857600, // 100MB in bytes
  acceptedFormats = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv']
}) => {
  const [uploadState, setUploadState] = useState({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    uploaded: false,
    error: null
  });

  const validateFile = useCallback((file) => {
    const errors = [];

    // Check file size (100MB limit)
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      errors.push('Supported formats: MP4, MOV, AVI, MKV');
    }

    return errors;
  }, [maxSize, acceptedFormats]);

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setUploadState(prev => ({
        ...prev,
        error: validationErrors.join('. ')
      }));
      toast.error(validationErrors[0]);
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setUploadState(prev => ({
      ...prev,
      file,
      preview: previewUrl,
      error: null,
      uploaded: false
    }));
  }, [validateFile]);

  const handleUpload = useCallback(async () => {
    if (!uploadState.file) {
      toast.error('Please select a video file first');
      return;
    }

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null
    }));

    try {
      // Create a custom progress handler
      const progressHandler = (progress) => {
        console.log('Progress update received:', progress, '%');
        setUploadState(prev => ({
          ...prev,
          progress
        }));
      };

      // Upload video to ImageKit via server
      toast.loading('Uploading video...', { id: 'video-upload' });

      console.log('Starting upload with progress handler');

      const response = await videoAPI.uploadVideoToImageKit(
        uploadState.file,
        progressHandler
      );

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        uploaded: true,
        progress: 100
      }));

      toast.success('Video uploaded successfully!', { id: 'video-upload' });
      onUploadComplete?.(response);
    } catch (error) {
      const errorMessage = error.message || 'Upload failed';

      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: errorMessage,
        progress: 0
      }));

      toast.error(errorMessage, { id: 'video-upload' });
      onUploadError?.(error);
    }
  }, [uploadState.file, onUploadComplete, onUploadError]);

  const handleRemove = useCallback(() => {
    if (uploadState.preview) {
      URL.revokeObjectURL(uploadState.preview);
    }

    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      uploaded: false,
      error: null
    });
  }, [uploadState.preview]);

  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-4">
      {!uploadState.file ? (
        // File Selection Area
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="video-upload-input"
            />
            <label
              htmlFor="video-upload-input"
              className="btn-primary cursor-pointer inline-flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Video File
            </label>
            <p className="text-sm text-gray-500">
              Max size: {Math.round(maxSize / (1024 * 1024))}MB • Formats: MP4, MOV, AVI, MKV
            </p>
          </div>
        </div>
      ) : (
        // File Preview and Upload Area
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {uploadState.preview && (
                  <video
                    src={uploadState.preview}
                    className="w-32 h-20 rounded object-cover"
                    controls={false}
                    muted
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadState.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadState.file.size)}
                    </p>
                  </div>

                  <button
                    onClick={handleRemove}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={uploadState.uploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Upload Progress */}
                {uploadState.uploading && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span>{uploadState.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Upload Status */}
                {uploadState.uploaded && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Upload completed successfully
                  </div>
                )}

                {/* Error Message */}
                {uploadState.error && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {uploadState.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!uploadState.uploaded && (
            <div className="flex space-x-2">
              <button
                onClick={handleUpload}
                disabled={uploadState.uploading}
                className="btn-primary flex-1"
              >
                {uploadState.uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </>
                )}
              </button>

              <button
                onClick={handleRemove}
                disabled={uploadState.uploading}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedVideoUpload;
