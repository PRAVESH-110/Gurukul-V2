'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { videoAPI, courseAPI } from '@/services/api';
import { Clock, Save, ArrowLeft, Video, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import EnhancedVideoUpload from '@/components/Video/EnhancedVideoUpload';

const VideoUploadPage = () => {
  const router = useRouter();
  const [videoData, setVideoData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      isPublished: false,
      allowDownload: false,
      enableComments: true,
      isPreview: false,
    }
  });

  // Fetch creator's courses for the dropdown
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['creatorCourses'],
    queryFn: () => courseAPI.getCourses({ creator: true }),
  });

  const handleVideoUploadComplete = (uploadResponse) => {
    setVideoData(uploadResponse);
    toast.success('Video uploaded successfully! Now fill in the details.');
  };

  const handleVideoUploadError = (error) => {
    console.error('Video upload error:', error);
    toast.error('Failed to upload video. Please try again.');
  };

  const onSubmit = async (data) => {
    if (!videoData) {
      toast.error('Please upload a video file first');
      return;
    }

    if (!selectedCourse) {
      toast.error('Please select a course for this video');
      return;
    }

    try {
      // Create video record with metadata and ImageKit.io URL
      const videoRecord = {
        title: data.title,
        description: data.description,
        url: videoData.url,
        fileId: videoData.fileId,
        thumbnailUrl: videoData.thumbnailUrl,
        course: selectedCourse,
        duration: data.duration ? parseInt(data.duration) : undefined,
        order: data.order ? parseInt(data.order) : 1,
        isPreview: data.isPreview || false,
        isPublished: data.isPublished || false,
        allowDownload: data.allowDownload || false,
        enableComments: data.enableComments !== false,
        objectives: data.objectives,
        resources: data.resources,
        // ImageKit.io specific fields
        filePath: videoData.filePath,
        fileSize: videoData.size,
        fileName: videoData.name,
      };

      await videoAPI.createVideoRecord(videoRecord);

      toast.success('Video lesson created successfully!');
      router.push(`/courses/${selectedCourse}/manage`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create video lesson');
      console.error('Error creating video lesson:', error);
    }
  };

  const courses = coursesData?.data?.courses || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Video className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Video</h1>
            <p className="text-gray-600">Upload a video to add to your course series (max 100MB)</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Video Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Video File</h2>
              <p className="text-sm text-gray-600">Upload your video to ImageKit.io (max 100MB)</p>
            </div>
          </div>

          <EnhancedVideoUpload
            onUploadComplete={handleVideoUploadComplete}
            onUploadError={handleVideoUploadError}
            maxSize={104857600} // 100MB
            acceptedFormats={['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm']}
          />

          {videoData && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Video uploaded successfully!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                File: {videoData.name} • URL: {videoData.url}
              </p>
            </div>
          )}

          {!videoData && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    Upload your video first
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please upload your video file before filling out the lesson details below.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Course</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course *
            </label>
            {coursesLoading ? (
              <div className="animate-pulse bg-gray-200 rounded-md h-10 w-full"></div>
            ) : (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            )}
            {courses.length === 0 && !coursesLoading && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  You need to create a course first before uploading videos.{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/create-course')}
                    className="underline hover:no-underline"
                  >
                    Create a course
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Video Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Video Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Video title is required' })}
                className="input w-full"
                placeholder="Enter video title"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="textarea w-full"
                placeholder="Describe what students will learn in this video"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  min="1"
                  {...register('duration')}
                  className="input w-full pl-10"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Order
              </label>
              <input
                type="number"
                min="1"
                {...register('order')}
                className="input w-full"
                placeholder="1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </label>
              <textarea
                {...register('objectives')}
                rows={3}
                className="textarea w-full"
                placeholder="What will students be able to do after watching this video?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resources/Links (Optional)
              </label>
              <textarea
                {...register('resources')}
                rows={2}
                className="textarea w-full"
                placeholder="Additional resources, links, or materials for this video"
              />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Video Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isPreview')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Allow as preview (free users can watch this video)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('allowDownload')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Allow students to download this video
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('enableComments')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Enable comments and discussions for this video
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isPublished')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Publish video immediately
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!videoData || !selectedCourse}
            className="btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Video Lesson
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoUploadPage;
