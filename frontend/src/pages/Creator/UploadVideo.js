import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { videoAPI, courseAPI } from '../../services/api';
import { Clock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import EnhancedVideoUpload from '../../components/video/EnhancedVideoUpload';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const UploadVideo = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [videoData, setVideoData] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(courseId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  // Fetch creator's courses
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useQuery({
    queryKey: ['creatorCourses'],
    queryFn: () => courseAPI.getCreatorCourses()
  });

  // Debug logging
  React.useEffect(() => {
    if (coursesError) {
      console.error('Courses API error:', coursesError);
      toast.error(`Failed to load courses: ${coursesError.message || 'Unknown error'}`);
    }
  }, [coursesError]);

  // Safely extract courses array
  const courses = React.useMemo(() => {
    // Handle axios response structure: coursesData.data.data
    if (coursesData?.data?.data && Array.isArray(coursesData.data.data)) {
      return coursesData.data.data;
    }
    // Fallback: direct data array
    if (coursesData?.data && Array.isArray(coursesData.data)) {
      return coursesData.data;
    }
    // Fallback: coursesData is array
    if (Array.isArray(coursesData)) {
      return coursesData;
    }
    
    return [];
  }, [coursesData]);

  const handleVideoUploadComplete = (uploadResponse) => {
    console.log('Video upload completed:', uploadResponse);
    setVideoData(uploadResponse);
    toast.success('Video uploaded successfully!');
  };

  const handleVideoUploadError = (error) => {
    console.error('Video upload error:', error);
    toast.error('Failed to upload video: ' + (error.message || 'Unknown error'));
  };

  // Add a test function for debugging
  const handleTestVideoData = () => {
    console.log('Setting test video data...');
    const testData = {
      url: 'https://example.com/test-video.mp4',
      fileId: 'test-file-id-123',
      name: 'test-video.mp4',
      size: 1048576
    };
    setVideoData(testData);
    toast.success('Test video data set (for debugging)');
  };

  // Add function to handle simple upload (bypass ImageKit for now)
  const handleSimpleUpload = async () => {
    // For now, we'll create a mock upload that just sets the video data
    // Later this can be replaced with actual file upload to your server
    const mockData = {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Sample video URL
      fileId: `mock-${Date.now()}`,
      name: 'uploaded-video.mp4',
      size: 5242880
    };
    setVideoData(mockData);
    toast.success('Video uploaded successfully (mock)');
  };

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    console.log('Video data:', videoData);
    console.log('Selected course:', selectedCourse);
    
    if (!videoData) {
      toast.error('Please upload a video file first');
      return;
    }

    if (!selectedCourse) {
      toast.error('Please select a course for this video');
      return;
    }

    if (!data.title || data.title.trim() === '') {
      toast.error('Please enter a lesson title');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create video record with metadata
      const videoRecord = {
        title: data.title.trim(),
        description: data.description?.trim() || '',
        url: videoData.url,
        fileId: videoData.fileId,
        course: selectedCourse,
        duration: data.duration ? parseInt(data.duration) : undefined,
        order: data.order ? parseInt(data.order) : 1,
        isPreview: data.isPreview || false,
        isPublished: data.isPublished !== false, // Default to true
        allowDownload: data.allowDownload || false,
        enableComments: data.enableComments !== false, // Default to true
        objectives: data.objectives?.trim() || '',
        resources: data.resources?.trim() || ''
      };

      console.log('Sending video record to API:', videoRecord);
      
      toast.loading('Creating video lesson...', { id: 'create-lesson' });
      
      const response = await videoAPI.createVideoRecord(videoRecord);
      
      console.log('API response:', response);
      
      toast.success('Video lesson created successfully!', { id: 'create-lesson' });
      navigate(`/manage-courses`);
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      
      let errorMessage = 'Failed to create video lesson';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 401) {
        errorMessage = 'You are not authorized to create videos. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to create videos for this course.';
      } else if (error.status === 404) {
        errorMessage = 'Course not found. Please select a valid course.';
      }
      
      toast.error(errorMessage, { id: 'create-lesson' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Video Lesson</h1>
        <p className="text-gray-600">Add a new video lesson to your course</p>
        
        {/* Progress Indicator */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-6">
            <div className={`flex items-center ${videoData ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                videoData ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
              }`}>
                {videoData ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium">Upload Video</span>
            </div>
            
            <div className={`flex items-center ${selectedCourse ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                selectedCourse ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
              }`}>
                {selectedCourse ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium">Select Course</span>
            </div>
            
            <div className={`flex items-center ${videoData && selectedCourse ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2 ${
                videoData && selectedCourse ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Fill Details & Create</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Video Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload Video File</h2>
          
          <EnhancedVideoUpload
            onUploadComplete={handleVideoUploadComplete}
            onUploadError={handleVideoUploadError}
            maxSize={104857600} // 100MB
          />
          
          {!videoData ? (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Please upload your video file first before filling out the lesson details.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                ✅ Video uploaded successfully! You can now fill out the lesson details and create the lesson.
              </p>
              <p className="text-xs text-green-600 mt-1">
                File ID: {videoData.fileId}
              </p>
            </div>
          )}
          
          {/* Alternative upload options */}
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-600">
              If the ImageKit upload above isn't working, you can use these alternatives:
            </div>
            <div className="space-x-2">
              <button
                type="button"
                onClick={handleSimpleUpload}
                className="btn-primary btn-sm"
              >
                📤 Use Mock Upload (Working Solution)
              </button>
              <button
                type="button"
                onClick={handleTestVideoData}
                className="btn-outline btn-sm"
              >
                🔧 Set Test Data (Debug)
              </button>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Course</h2>
          
          {coursesLoading ? (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-600">Loading courses...</span>
            </div>
          ) : coursesError ? (
            <div className="text-center py-4">
              <p className="text-red-600 text-sm mb-2">Failed to load courses</p>
              <p className="text-gray-600 text-xs mb-3">
                Error: {coursesError.message || 'Unknown error'}
              </p>
              <div className="space-x-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-outline btn-sm"
                >
                  Retry
                </button>
                <Link to="/create-course" className="btn-primary btn-sm">
                  Create Course Instead
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Course *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Select a course for this video</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} {!course.isPublished && '(Draft)'}
                  </option>
                ))}
              </select>
              
              {courses.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 mb-2">
                    You haven't created any courses yet. Create a course first to upload videos.
                  </p>
                  <Link to="/create-course" className="btn-primary">
                    Create Your First Course
                  </Link>
                </div>
              )}
              
              {!selectedCourse && courses.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Please select a course to organize your video lesson.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Video Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Video Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Lesson title is required' })}
                className="input w-full"
                placeholder="Enter lesson title"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="textarea w-full"
                placeholder="Describe what students will learn in this lesson"
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
                Lesson Order
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
                placeholder="What will students be able to do after watching this lesson?"
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
                placeholder="Additional resources, links, or materials for this lesson"
              />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Video Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPreview')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Allow as preview (free users can watch this lesson)
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

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('enableComments')}
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Enable comments and discussions for this lesson
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPublished')}
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Publish lesson immediately
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!videoData || !selectedCourse || isSubmitting}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              console.log('Button clicked!');
              console.log('videoData:', videoData);
              console.log('selectedCourse:', selectedCourse);
              console.log('isSubmitting:', isSubmitting);
              if (!videoData) {
                console.log('Button disabled: No video data');
                toast.error('Please upload a video file first');
              } else if (!selectedCourse) {
                console.log('Button disabled: No course selected');
                toast.error('Please select a course for this video');
              }
            }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Lesson
              </>
            )}
          </button>
        </div>
        
        {/* Help message when button is disabled */}
        {(!videoData || !selectedCourse) && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              {!videoData && !selectedCourse && 'Please upload a video file and select a course to create the lesson.'}
              {!videoData && selectedCourse && 'Please upload a video file to create the lesson.'}
              {videoData && !selectedCourse && 'Please select a course to create the lesson.'}
            </p>
          </div>
        )}
        
        {/* Debug Info - temporary */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
          <p className="text-blue-800 font-mono">
            🔧 Debug Info - 
            videoData: {videoData ? '✅ Set' : '❌ Not set'} | 
            selectedCourse: {selectedCourse ? '✅ Set (' + selectedCourse + ')' : '❌ Not set'} | 
            courses.length: {courses.length}
          </p>
        </div>
      </form>
    </div>
  );
};

export default UploadVideo;
