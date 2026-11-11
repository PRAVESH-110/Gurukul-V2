'use client';

import { useQuery } from '@tanstack/react-query';
import { BookOpen, DollarSign, Plus, Star, TrendingUp, Users, Video, Sparkles } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { dashboardAPI } from '@/services/api';
import { MetricsSummaryBar, MetricSegment } from '@/components/UI/MetricsSummaryBar';
import EmptyStateCard from '@/components/UI/EmptyStateCard';

const CreatorDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['creatorDashboard'],
    queryFn: () => dashboardAPI.getCreatorDashboard(),
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
      <div
        className={`relative overflow-hidden rounded-2xl p-8 text-white shadow-lg ${
          dashboard?.user?.role === 'admin'
            ? 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-500/20'
            : 'bg-gradient-to-br from-primary-600 to-primary-800 shadow-primary/20'
        }`}
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">
            Welcome back,{' '}
            {dashboard?.user?.role === 'admin' ? 'SUPERADMIN' : dashboard?.user?.firstName}!
          </h1>
          <p className={dashboard?.user?.role === 'admin' ? 'text-red-100' : 'text-primary-100'}>
            Manage your courses and communities, track your success, and grow your audience.
          </p>
        </div>
      </div>

      {/* Welcome Banner */}
      <div
        className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 text-white shadow-sm border ${
          dashboard?.user?.role === 'admin'
            ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-800 border-red-500/20'
            : 'bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 border-primary-500/20'
        }`}
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-semibold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {dashboard?.user?.role === 'admin' ? 'Superadmin Workspace' : 'Creator Portal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back,{' '}
              {dashboard?.user?.role === 'admin' ? 'SUPERADMIN' : dashboard?.user?.firstName}!
            </h1>
            <p
              className={
                dashboard?.user?.role === 'admin'
                  ? 'text-red-100 text-sm sm:text-base mt-1 max-w-xl'
                  : 'text-primary-100 text-sm sm:text-base mt-1 max-w-xl'
              }
            >
              Manage your published courses, community engagement, audience analytics, and earnings.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/create-course"
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
            >
              Create Course
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] p-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <Link
            href="/create-course"
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all duration-150"
          >
            <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Plus className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Create Course
            </span>
          </Link>

          <Link
            href="/create-community"
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all duration-150"
          >
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Create Community
            </span>
          </Link>

          {dashboard?.user?.role !== 'admin' && (
            <Link
              href="/upload-video"
              className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all duration-150"
            >
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Video className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                Upload Video
              </span>
            </Link>
          )}

          <Link
            href="/manage-courses"
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all duration-150"
          >
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <BookOpen className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Manage Courses
            </span>
          </Link>

          <Link
            href="/analytics"
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-all duration-150"
          >
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              Analytics
            </span>
          </Link>
        </div>
      </div>

      {/* Unified Metrics Summary Bar */}
      <MetricsSummaryBar>
        <MetricSegment
          label="Active Courses"
          value={dashboard?.stats?.totalCourses || 0}
          icon={BookOpen}
          badgeText="Catalog"
          badgeColor="blue"
          subtitle="Courses currently live"
        />
        <MetricSegment
          label="Total Enrollments"
          value={dashboard?.stats?.totalEnrollments || 0}
          icon={Users}
          badgeText="Audience"
          badgeColor="emerald"
          subtitle="Students learning from your content"
        />
        <MetricSegment
          label="Total Revenue"
          value={`$${Number(dashboard?.stats?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          badgeText="ARR"
          badgeColor="purple"
          subtitle="Gross lifetime course earnings"
        />
        <MetricSegment
          label="Average Rating"
          value={
            typeof dashboard?.stats?.averageRating === 'number'
              ? dashboard.stats.averageRating.toFixed(1)
              : '0.0'
          }
          icon={Star}
          badgeText="Reviews"
          badgeColor="amber"
          subtitle="Community satisfaction score"
        />
      </MetricsSummaryBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-primary-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Your Courses</h2>
            </div>
            <Link
              href="/manage-courses"
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {dashboard?.createdCourses?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.createdCourses.slice(0, 3).map((course) => (
                  <div
                    key={course._id}
                    className="group flex items-center space-x-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all"
                  >
                    <div className="flex-shrink-0 relative">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-14 w-14 rounded-xl object-cover shadow-2xs"
                        />
                      ) : (
                        <div className="h-14 w-14 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100">
                          <BookOpen className="h-7 w-7 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1 text-slate-400" />
                          {course.enrollmentCount || 0} students
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-amber-500 fill-amber-500" />
                          {course?.rating?.average ? course.rating.average.toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      ${course.price || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={BookOpen}
                title="No courses created yet"
                description="Start sharing your knowledge and monetizing your expertise with students."
                actionText="Create Course"
                actionHref="/create-course"
              />
            )}
          </div>
        </div>

        {/* Recent Communities */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-primary-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Your Communities</h2>
            </div>
            <Link
              href="/manage-communities"
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {dashboard?.createdCommunities?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.createdCommunities.slice(0, 3).map((community) => (
                  <div
                    key={community._id}
                    className="group flex items-start space-x-3.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">
                        {community.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {community.description}
                      </p>
                      <div className="flex items-center mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Users className="h-3 w-3 mr-1 text-slate-400" />
                          {community.memberCount || 0} members
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={Users}
                title="No communities created yet"
                description="Build interactive learning communities for collaborative discussion and student retention."
                actionText="Create Community"
                actionHref="/create-community"
              />
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
