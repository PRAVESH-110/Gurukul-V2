import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Play, Users, Clock, Star, Calendar } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEnrolling, setIsEnrolling] = useState(false);
  // const[enrolled, setIsEnrolled]= usestate(false);

  const { data: courseData, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseAPI.getCourse(id)
  });

  const { data: videosData } = useQuery({
    queryKey: ['courseVideos', id],
    queryFn: () => courseAPI.getCourseVideos(id),
    enabled: !!courseData?.data?.course
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseAPI.enrollInCourse(id),
    onSuccess: (response) => {
      // Use the message from the backend response
      const message = response?.data?.message || 'Successfully enrolled in course!';
      toast.success(message);
      queryClient.invalidateQueries(['course', id]);
      queryClient.invalidateQueries(['myCourses', user?._id]);
      setIsEnrolling(false);

      // onSuccess && ()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
      setIsEnrolling(false);
    }
  });

  const unenrollMutation= useMutation({
    mutationFn: ()=>courseAPI.unenrollfromcourse(id),
    onSuccess: (response) => {
      // Use the message from the backend response
      const message = response?.data?.message || 'Successfully unenrolled from course!';
      toast.success(message);
      queryClient.invalidateQueries(['course', id]);
      queryClient.invalidateQueries(['myCourses', user?._id]);
      setIsEnrolling(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unenroll from course');
      setIsEnrolling(false);
    }
  })

  const handleEnroll = () => {
    setIsEnrolling(true);
    enrollMutation.mutate();
  };

  const handleUnenroll = () => {
    setIsEnrolling(true);
    unenrollMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load course details</p>
      </div>
    );
  }

  const course = courseData?.data?.course;
  const videos = videosData?.data?.data || [];
  
  // Debug: Log videos to see what we're getting
  console.log('Videos data:', videosData);
  console.log('Videos array:', videos);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Header */}
          <div className="mb-8">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-6">
              {course?.thumbnail ? (
                <img
                  src={getImageUrl(course.thumbnail)}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {course?.title}
            </h1>

            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {course?.enrollmentCount || 0} students
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {course?.duration || 'N/A'}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Created {new Date(course?.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(course?.rating?.average || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {course?.rating?.average ? course.rating.average.toFixed(1) : 'No rating'} ({course?.rating?.count || 0} reviews)
              </span>
            </div>
          </div>

          {/* Course Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About this course</h2>
            <p className="text-gray-700 leading-relaxed">
              {course?.description}
            </p>
          </div>

          {/* Course Content */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2>
            {videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div
                    key={video._id}
                    className="flex items-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-sm font-medium text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        <button onClick={()=>window.open(video.url, '_blank')}>
                          {video.title}
                          </button>
                          </h3>
                      <p className="text-sm text-gray-600">{video.description}</p>
                      {/* <a href={video.url} className="text-sm text-gray-600">Click here to watch the video</a> */}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Play 
                      onClick={() => window.open(video.url, '_blank')}
                      className="h-4 w-4 mr-1 text-blue-600 cursor-pointer" />
                      {video.duration || '0:00'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No videos available yet.</p>
            )}
          </div>

          {/* Instructor */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Instructor</h2>
            <div className="flex items-center">
              {course?.creator?.avatar ? (
                <img
                  src={course.creator.avatar}
                  alt={`${course.creator.firstName} ${course.creator.lastName}`}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-medium text-gray-700">
                    {course?.creator?.firstName?.[0]}{course?.creator?.lastName?.[0]}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  {course?.creator?.firstName} {course?.creator?.lastName}
                </h3>
                <p className="text-sm text-gray-600">{course?.creator?.title || 'Instructor'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
            <div className="text-center mb-6">
              {course?.price > 0 ? (
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  ${course.price}
                </div>
              ) : (
                <div className="text-3xl font-bold text-green-600 mb-2">
                  Free
                </div>
              )}
            </div>

            {user ? (
              <div className="space-y-4">
                {course?.enrolledStudents?.some(student => 
                  student?.user?.toString() === user._id?.toString() || 
                  student?.user?.toString() === user.id?.toString()
                ) ? (
                  
                  <button 
                className='bg-red-400 text-gray-50 w-full py-2  px-3 text-center rounded-lg hover:text-white hover:bg-red-500 transition-colors duration-200'
                onClick={handleUnenroll}
                disabled={isEnrolling}
              >
                  Unenroll
                </button>
                  
                ) : (
                  <button 
                    className="w-full btn-primary" 
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                  </button>
                )}

                {/* unenroll */}
                
                <button className="w-full btn-outline">
                  Add to Wishlist
                </button>

                
              </div>
            ) : (
              <div className="space-y-4">
                <Link to="/register" className="w-full btn-primary block text-center">
                  Sign up to Enroll
                </Link>
                <Link to="/login" className="w-full btn-outline block text-center">
                  Login
                </Link>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-gray-900">This course includes:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <Play className="h-4 w-4 mr-2 text-primary-600" />
                  {videosData?.data?.count || course?.totalVideos || 0} video lessons
                </li>
                <li className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary-600" />
                  Downloadable resources
                </li>
                <li className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-primary-600" />
                  Community access
                </li>
                <li className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary-600" />
                  Lifetime access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
