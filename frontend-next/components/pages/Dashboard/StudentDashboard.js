'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';
import {
  BookOpen,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Play,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { MetricsSummaryBar, MetricSegment } from '@/components/UI/MetricsSummaryBar';
import EmptyStateCard from '@/components/UI/EmptyStateCard';

const StudentDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => dashboardAPI.getStudentDashboard(),
  });

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
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const { dashboard } = dashboardData.data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm border border-primary-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white text-[11px] font-semibold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {dashboard.user.firstName}!
            </h1>
            <p className="text-primary-100 text-sm sm:text-base mt-1 max-w-xl">
              Track your enrollments, community discussions, and ongoing learning milestones.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href="/courses"
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors shadow-xs"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Unified Metrics Summary Bar (Super Admin Prototype Pattern) */}
      <MetricsSummaryBar>
        <MetricSegment
          label="Enrolled Courses"
          value={dashboard.stats.totalCoursesEnrolled}
          icon={BookOpen}
          badgeText="Active"
          badgeColor="blue"
          subtitle="All registered learning paths"
        />
        <MetricSegment
          label="Completed Courses"
          value={dashboard.stats.completedCourses}
          icon={Award}
          badgeText="Finished"
          badgeColor="emerald"
          subtitle="100% completion rate"
        />
        <MetricSegment
          label="Communities Joined"
          value={dashboard.stats.totalCommunitiesJoined}
          icon={Users}
          badgeText="Social"
          badgeColor="purple"
          subtitle="Collaborative forums & groups"
        />
        <MetricSegment
          label="Videos Watched"
          value={dashboard.stats.totalVideosWatched}
          icon={Play}
          badgeText="Watch Time"
          badgeColor="amber"
          subtitle="Total lecture modules viewed"
        />
      </MetricsSummaryBar>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-primary-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Continue Learning</h2>
            </div>
            <Link
              href="/my-courses"
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {dashboard.enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {dashboard.enrolledCourses.slice(0, 3).map((course) => (
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
                      <p className="text-xs text-slate-500 mt-0.5">
                        by {course.creator.firstName} {course.creator.lastName}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 text-[11px]">
                            {course.progress}% Complete
                          </span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/courses/${course._id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap transition-colors"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={BookOpen}
                title="No enrolled courses"
                description="Start your learning journey by exploring interactive courses tailored to your goals."
                actionText="Browse Courses"
                actionHref="/courses"
              />
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
            <div className="flex items-center gap-2">
              <Calendar className="w-4.5 h-4.5 text-primary-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Upcoming Events</h2>
            </div>
            <Link
              href="/my-communities"
              className="text-primary-600 hover:text-primary-700 text-xs font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            {dashboard.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {dashboard.upcomingEvents.slice(0, 3).map((event) => (
                  <div
                    key={event._id}
                    className="flex items-start space-x-3.5 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 bg-primary-50 border border-primary-100 rounded-xl flex flex-col items-center justify-center text-primary-700">
                        <span className="text-[10px] font-bold uppercase tracking-tight">
                          {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-base font-bold leading-none">
                          {new Date(event.startDate).getDate()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{event.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {event.community?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(event.startDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={Calendar}
                title="No upcoming events"
                description="Join communities to attend interactive workshops, live Q&A sessions, and study groups."
                actionText="Explore Communities"
                actionHref="/communities"
              />
            )}
          </div>
        </div>
      </div>

      {/* Recent Community Posts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
            Recent Community Posts
          </h2>
          <Link
            href="/my-communities"
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {dashboard.recentPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dashboard.recentPosts.slice(0, 3).map((post) => (
                <div
                  key={post._id}
                  className="flex flex-col h-full p-5 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all bg-gray-50/30 hover:bg-white"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.firstName}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {post.author.firstName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {post.author.firstName} {post.author.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">in {post.community.name}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{post.content}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center hover:text-primary-600 transition-colors">
                        {post.likeCount} Likes
                      </span>
                      <span className="flex items-center hover:text-primary-600 transition-colors">
                        {post.commentCount} Comments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No recent posts</p>
              <Link href="/communities" className="btn-primary text-sm mt-2">
                Join Communities
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
