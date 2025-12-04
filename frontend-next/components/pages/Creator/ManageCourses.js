'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { courseAPI } from '@/services/api';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Users,
  Star,
  Eye,
  EyeOff,
  DollarSign,
  MoreVertical,
  Video
} from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUtils';

const ManageCourses = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: coursesData, isLoading, error, refetch } = useQuery({
    queryKey: ['creatorCourses'],
    queryFn: () => courseAPI.getCreatorCourses()
  });

  const handleDeleteCourse = async (courseId, courseName) => {
    const confirmMessage = `Are you sure you want to delete "${courseName}"?\n\nThis will permanently delete:\n• All course videos\n• Student enrollments\n• Course analytics\n• All course data\n\nThis action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      const deleteToast = toast.loading('Deleting course...');

      try {
        await courseAPI.deleteCourse(courseId);
        toast.success('Course deleted successfully', { id: deleteToast });
        refetch();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete course';
        toast.error(errorMessage, { id: deleteToast });
        console.error('Delete course error:', error);
      }
    }
  };

  const handleToggleVisibility = async (courseId, currentVisibility) => {
    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';

    // Optimistic update
    const previousData = queryClient.getQueryData(['creatorCourses']);

    queryClient.setQueryData(['creatorCourses'], (old) => {
      if (!old) return old;

      // Deep clone to avoid mutating state directly
      const newData = JSON.parse(JSON.stringify(old));

      // Navigate to the courses array
      // Structure: response.data.data.data (array of courses)
      if (newData.data?.data?.data) {
        const courseIndex = newData.data.data.data.findIndex(c => c._id === courseId);
        if (courseIndex !== -1) {
          newData.data.data.data[courseIndex].visibility = newVisibility;
          // Also update status for backward compatibility if needed by UI
          newData.data.data.data[courseIndex].status = newVisibility === 'public' ? 'published' : 'draft';
        }
      }

      return newData;
    });

    try {
      await courseAPI.updateCourse(courseId, { visibility: newVisibility });
      toast.success(`Course is now ${newVisibility}`);
      // No need to refetch immediately as we updated optimistically
      // But we can invalidate to ensure consistency eventually
      queryClient.invalidateQueries(['creatorCourses']);
    } catch (error) {
      console.error('Error toggling course visibility:', error);
      toast.error(error.response?.data?.message || 'Failed to update course visibility');
      // Revert on error
      queryClient.setQueryData(['creatorCourses'], previousData);
    }
  };

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
        <p className="text-red-600">Failed to load courses</p>
        <button onClick={() => refetch()} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  const courses = coursesData?.data?.data?.data || [];

  // Debug logging
  console.log('coursesData:', coursesData);
  console.log('courses:', courses);
  console.log('is array?', Array.isArray(courses));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage your courses</p>
        </div>
        <Link href="/create-course" className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>

          <div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Courses</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-full"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="enrollments">Most Enrolled</option>
              <option value="revenue">Highest Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesData?.data?.data?.stats?.totalCourses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {coursesData?.data?.data?.stats?.totalStudents || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${coursesData?.data?.data?.stats?.totalRevenue || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof coursesData?.data?.data?.stats?.averageRating === 'number'
                  ? coursesData.data.data.stats.averageRating.toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || visibilityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first course'
              }
            </p>
            <Link href="/create-course" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visibility
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Videos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {course.thumbnail ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={getImageUrl(course.thumbnail)}
                              alt={course.title}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-primary-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {course.title || 'Untitled Course'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.category || 'General'} • {course.level || 'Beginner'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.visibility === 'public'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                        }`}>
                        {course.visibility ? course.visibility.charAt(0).toUpperCase() + course.visibility.slice(1) : 'Private'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        {course.enrollmentCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Video className="h-4 w-4 text-blue-400 mr-1" />
                        <span className="font-medium text-blue-600">{course.videoCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {typeof course.rating === 'number' ? course.rating.toFixed(1) : '0.0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${typeof course.revenue === 'number' ? course.revenue.toFixed(2) : '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {course.status !== 'published' && (
                          <Link
                            href={`/courses/${course._id}`}
                            className="text-primary-600 hover:text-primary-900"
                            title="Preview course"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <div className="flex items-center space-x-1">
                          <Link
                            href={`/course-videos/${course._id}`}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full font-medium transition-colors"
                            title="Manage videos"
                          >
                            <Video className="h-3 w-3 inline mr-1" />
                            Videos ({course.videoCount || 0})
                          </Link>
                          <Link
                            href={`/edit-course/${course._id}`}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                            title="Edit course"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleToggleVisibility(course._id, course.visibility)}
                            className={`p-2 rounded-full ${course.visibility === 'public'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            title={course.visibility === 'public' ? 'Make Private' : 'Make Public'}
                          >
                            {course.visibility === 'public' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id, course.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            title="Delete course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;

