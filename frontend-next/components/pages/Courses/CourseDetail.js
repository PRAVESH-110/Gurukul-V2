'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Play, Users, Clock, Star, Calendar, CheckCircle, Share2, Heart, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUtils';
import ReactMarkdown from 'react-markdown';

const CourseDetail = () => {
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEnrolling, setIsEnrolling] = useState(false);

  const { data: courseData, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseAPI.getCourse(id),
    enabled: !!id
  });

  const { data: videosData } = useQuery({
    queryKey: ['courseVideos', id],
    queryFn: () => courseAPI.getCourseVideos(id),
    enabled: !!courseData?.data?.course && !!id
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseAPI.enrollInCourse(id),
    onSuccess: (response) => {
      const message = response?.data?.message || 'Successfully enrolled in course!';
      toast.success(message);
      queryClient.invalidateQueries(['course', id]);
      queryClient.invalidateQueries(['myCourses', user?._id]);
      setIsEnrolling(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
      setIsEnrolling(false);
    }
  });

  const unenrollMutation = useMutation({
    mutationFn: () => courseAPI.unenrollfromcourse(id),
    onSuccess: (response) => {
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
  });

  const handleEnroll = () => {
    setIsEnrolling(true);
    enrollMutation.mutate();
  };

  const handleUnenroll = () => {
    setIsEnrolling(true);
    unenrollMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load course details</h3>
          <p className="text-gray-600 mb-6">We couldn't fetch the course information. Please try again later.</p>
          <Link href="/courses" className="btn-primary w-full inline-block">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const course = courseData?.data?.course;
  const videos = videosData?.data?.data || [];
  const isEnrolled = course?.enrolledStudents?.some(student =>
    student?.user?.toString() === user?._id?.toString() ||
    student?.user?.toString() === user?.id?.toString()
  );

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-12">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-gray-900/50"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 text-primary-200 mb-6 text-sm font-medium">
                <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
                <span>/</span>
                <span className="text-white truncate">{course?.title}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {course?.title}
              </h1>

              <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl">
                {course?.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center text-yellow-400">
                  <span className="font-bold text-lg mr-1">{course?.rating?.average?.toFixed(1) || '0.0'}</span>
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(course?.rating?.average || 0)
                          ? 'fill-current'
                          : 'text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400 underline decoration-gray-600 underline-offset-2">
                    ({course?.rating?.count || 0} ratings)
                  </span>
                </div>

                <div className="flex items-center text-gray-300">
                  <Users className="h-4 w-4 mr-2" />
                  {course?.enrollmentCount || 0} students
                </div>

                <div className="flex items-center text-gray-300">
                  <Clock className="h-4 w-4 mr-2" />
                  {course?.duration || 'N/A'}
                </div>

                <div className="flex items-center text-gray-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last updated {new Date(course?.updatedAt || course?.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-8 flex items-center">
                <div className="flex items-center">
                  {course?.creator?.avatar ? (
                    <img
                      src={course.creator.avatar}
                      alt={`${course.creator.firstName} ${course.creator.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center border-2 border-gray-700">
                      <span className="text-sm font-bold text-white">
                        {course?.creator?.firstName?.[0]}{course?.creator?.lastName?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm text-gray-400">Created by</p>
                    <p className="text-sm font-medium text-white">
                      {course?.creator?.firstName} {course?.creator?.lastName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 lg:-mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mobile Video Preview (Only visible on mobile) */}
            <div className="lg:hidden bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="aspect-video bg-gray-900 relative group cursor-pointer">
                {course?.thumbnail ? (
                  <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-gray-600" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-8 w-8 text-white fill-current ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  {course?.price > 0 ? (
                    <div className="text-3xl font-bold text-gray-900">
                      ${course.price}
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-green-600">
                      Free
                    </div>
                  )}
                </div>
                {user ? (
                  isEnrolled ? (
                    <button
                      className="w-full btn-danger mb-3"
                      onClick={handleUnenroll}
                      disabled={isEnrolling}
                    >
                      Unenroll
                    </button>
                  ) : (
                    <button
                      className="w-full btn-primary mb-3"
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  )
                ) : (
                  <Link href="/register" className="w-full btn-primary mb-3 block text-center">
                    Sign up to Enroll
                  </Link>
                )}
              </div>
            </div>

            {/* What you'll learn */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  'Master the core concepts and advanced techniques',
                  'Build real-world projects to showcase your skills',
                  'Learn best practices and industry standards',
                  'Get hands-on experience with practical exercises'
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
                <span className="text-sm text-gray-500">
                  {videosData?.data?.count || course?.totalVideos || 0} lectures • {course?.duration || 'N/A'} total length
                </span>
              </div>

              {videos.length > 0 ? (
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
                  {videos.map((video, index) => (
                    <div
                      key={video._id}
                      className="group flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (isEnrolled) {
                          window.open(video.videoUrl, '_blank');
                        } else {
                          toast("Please enroll in the course to view this video.");
                        }
                      }}
                    >
                      <div className="flex-shrink-0 mr-4">
                        {isEnrolled ? (
                          <Play className="h-5 w-5 text-primary-600" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                          {video.title}
                        </h3>
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                          <span>Video</span>
                          <span>•</span>
                          <span>{video.duration || '10:00'}</span>
                        </div>
                      </div>
                      {isEnrolled ? (
                        <span className="px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-md">
                          Play
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Locked
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-600">No videos available yet.</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
              <div className="prose prose-blue max-w-none text-gray-600">
                <ReactMarkdown>{course?.description}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Course Preview Card */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="aspect-video bg-gray-900 relative group cursor-pointer">
                  {course?.thumbnail ? (
                    <img
                      src={getImageUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-8 w-8 text-white fill-current ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-white font-medium text-sm drop-shadow-md">Preview this course</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    {course?.price > 0 ? (
                      <div className="text-4xl w-full font-bold items-center text-center align-middle text-gray-900">
                        ${course.price}
                      </div>
                    ) : (
                      <div className="text-4xl w-full font-bold items-center text-center align-middle text-green-600">
                        Free
                      </div>
                    )}
                  </div>

                  {user ? (
                    <div className="space-y-3">
                      {isEnrolled ? (
                        <button
                          className="w-full btn-danger"
                          onClick={handleUnenroll}
                          disabled={isEnrolling}
                        >
                          Unenroll
                        </button>
                      ) : (
                        <button
                          className="w-full btn-primary text-lg py-3"
                          onClick={handleEnroll}
                          disabled={isEnrolling}
                        >
                          {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                        </button>
                      )}

                      <div className="flex gap-2 content-center fit-content w-full">
                        <button className="flex-1 btn-outline flex items-center justify-center">
                          <Heart className="h-3 w-3 " />
                          Wishlist
                        </button>
                        <button className="flex-2 btn-outline flex items-center justify-center">
                          <Share2 className="h-3 w-3 " />
                          Share
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link href="/register" className="w-full btn-primary block text-center text-lg py-3">
                        Sign up to Enroll
                      </Link>
                      <Link href="/login" className="w-full btn-outline block text-center">
                        Login
                      </Link>
                    </div>
                  )}

                  <div className="mt-8 space-y-4">
                    <h3 className="font-semibold text-gray-900">This course includes:</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center">
                        <Play className="h-4 w-4 mr-3 text-primary-600" />
                        {videosData?.data?.count || course?.totalVideos || 0} video lessons
                      </li>
                      <li className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-3 text-primary-600" />
                        Downloadable resources
                      </li>
                      <li className="flex items-center">
                        <Users className="h-4 w-4 mr-3 text-primary-600" />
                        Community access
                      </li>
                      <li className="flex items-center">
                        <Clock className="h-4 w-4 mr-3 text-primary-600" />
                        Lifetime access
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-3 text-primary-600" />
                        Certificate of completion
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;

