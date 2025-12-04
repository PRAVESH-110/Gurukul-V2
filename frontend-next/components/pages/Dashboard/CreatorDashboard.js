'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  DollarSign,
  Plus,
  Star,
  TrendingUp,
  Users,
  Video
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { dashboardAPI } from '@/services/api';

const CreatorDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['creatorDashboard'],
    queryFn: () => dashboardAPI.getCreatorDashboard()
  });

  if (isLoading) {
    console.log('Still loading...');
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.log('Error loading dashboard:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
      </div>
    );
  }

  const { dashboard } = dashboardData?.data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className={`relative overflow-hidden rounded-2xl p-8 text-white shadow-lg ${dashboard?.user?.role === 'admin'
        ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-500/20'
        : 'bg-gradient-to-br from-primary-600 to-primary-800 shadow-primary/20'
        }`}>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">
            Welcome back, {dashboard?.user?.role === 'admin' ? 'SUPERADMIN' : dashboard?.user?.firstName}!
          </h1>
          <p className={dashboard?.user?.role === 'admin' ? 'text-red-100' : 'text-primary-100'}>
            Manage your courses and communities, track your success, and grow your audience.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link href="/create-course" className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200">
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
            <Plus className="h-6 w-6 text-primary-600" />
          </div>
          <span className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Create Course</span>
        </Link>

        <Link href="/create-community" className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all duration-200">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Create Community</span>
        </Link>

        {dashboard?.user?.role !== 'admin' && (
          <Link href="/upload-video" className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-200">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <Video className="h-6 w-6 text-green-600" />
            </div>
            <span className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Upload Video</span>
          </Link>
        )}

        <Link href="/manage-courses" className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
            <BookOpen className="h-6 w-6 text-orange-600" />
          </div>
          <span className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Manage Courses</span>
        </Link>

        <Link href="/analytics" className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Analytics</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboard?.stats?.totalCourses || 0}
            </p>
            <p className="text-sm font-medium text-gray-500">Active Courses</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Students</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboard?.stats?.totalEnrollments || 0}
            </p>
            <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Earnings</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              ${dashboard?.stats?.totalRevenue || 0}
            </p>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Rating</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {(typeof dashboard?.stats?.averageRating === 'number' ? dashboard.stats.averageRating.toFixed(1) : '0.0')}
            </p>
            <p className="text-sm font-medium text-gray-500">Average Rating</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
              Your Courses
            </h2>
            <Link
              href="/manage-courses"
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {dashboard?.createdCourses?.length > 0 ? (
              <div className="space-y-6">
                {dashboard.createdCourses.slice(0, 3).map((course) => (
                  <div key={course._id} className="group flex items-center space-x-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 relative">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-16 w-16 rounded-xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100">
                          <BookOpen className="h-8 w-8 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                          <Users className="h-3 w-3 mr-1" />
                          {course.enrollmentCount || 0} students
                        </span>
                        <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                          <Star className="h-3 w-3 mr-1 text-orange-400" />
                          {course?.rating?.average ? course.rating.average.toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      ${course.price || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">No courses created yet</p>
                <p className="text-gray-500 text-sm mb-4">Start sharing your knowledge</p>
                <Link href="/create-course" className="btn-primary text-sm">
                  Create Your First Course
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Communities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              Your Communities
            </h2>
            <Link
              href="/manage-communities"
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {dashboard?.createdCommunities?.length > 0 ? (
              <div className="space-y-6">
                {dashboard.createdCommunities.slice(0, 3).map((community) => (
                  <div key={community._id} className="group flex items-start space-x-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100 group-hover:bg-purple-100 transition-colors">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {community.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {community.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="flex items-center bg-gray-100 px-2 py-0.5 rounded-full">
                          <Users className="h-3 w-3 mr-1" />
                          {community.memberCount || 0} members
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">No communities created yet</p>
                <p className="text-gray-500 text-sm mb-4">Build your community today</p>
                <Link href="/create-community" className="btn-primary text-sm">
                  Create Your First Community
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Analytics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
            Performance Overview
          </h2>
          <Link
            href="/analytics"
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
          >
            View Detailed Analytics
          </Link>
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {dashboard?.analytics?.totalViews || 0}
              </div>
              <div className="text-sm font-medium text-gray-600">Total Views</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-green-50/50 border border-green-100">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {dashboard?.analytics?.completionRate || 0}%
              </div>
              <div className="text-sm font-medium text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-purple-50/50 border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                ${dashboard?.analytics?.monthlyRevenue || 0}
              </div>
              <div className="text-sm font-medium text-gray-600">Revenue (This Month)</div>
            </div>
          </div>
        </div>
      </div>

      {/* All Created Communities */}
      {dashboard?.createdCommunities?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-primary-600" />
              All Your Communities
            </h2>
            <Link
              href="/manage-communities"
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
            >
              Manage All
            </Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.createdCommunities.map((community) => (
                <Link
                  key={community._id}
                  href={`/communities/${community._id}`}
                  className="group flex flex-col space-y-3 hover:bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-primary-300 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                        <Users className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {community.name}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {community.memberCount || 0} members
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {community.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;

