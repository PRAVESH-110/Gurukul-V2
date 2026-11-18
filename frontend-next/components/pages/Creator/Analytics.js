'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';
import {
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  BookOpen,
  Star,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { MetricsSummaryBar, MetricSegment } from '@/components/UI/MetricsSummaryBar';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const {
    data: analyticsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['creatorAnalytics', timeRange],
    queryFn: () => dashboardAPI.getAnalytics({ timeRange }),
  });

  const handleExport = () => {
    const rows = analytics?.courses || [];
    const csv = [
      ['Course', 'Students', 'Revenue', 'Rating', 'Completion Rate'],
      ...rows.map((course) => [
        course.title,
        course.enrollmentCount || 0,
        course.revenue || 0,
        course.rating || 0,
        course.completionRate || 0,
      ]),
    ]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gurukul-analytics-${timeRange}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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
        <p className="text-red-600">Failed to load analytics data</p>
      </div>
    );
  }

  const { analytics } = analyticsData?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your performance and growth</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          <button className="btn-outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <MetricsSummaryBar>
        <MetricSegment
          label="Total Revenue"
          value={`$${analytics?.revenue?.total || 0}`}
          icon={DollarSign}
          badgeText={`+${analytics?.revenue?.growth || 0}%`}
          badgeColor="emerald"
          subtitle="From last period"
        />
        <MetricSegment
          label="Total Students"
          value={analytics?.students?.total || 0}
          icon={Users}
          badgeText={`+${analytics?.students?.new || 0} new`}
          badgeColor="blue"
          subtitle="Enrolled students"
        />
        <MetricSegment
          label="Course Views"
          value={analytics?.views?.total || 0}
          icon={Eye}
          badgeText={`${analytics?.views?.avgPerCourse || 0} avg`}
          badgeColor="purple"
          subtitle="Views per course"
        />
        <MetricSegment
          label="Avg Rating"
          value={analytics?.rating?.average?.toFixed(1) || '0.0'}
          icon={Star}
          badgeText={`${analytics?.rating?.totalReviews || 0} reviews`}
          badgeColor="amber"
          subtitle="Student reviews"
        />
      </MetricsSummaryBar>

      {/* Charts Section */}
      {(() => {
        const chartCourses = (analytics?.courses || []).slice(0, 8);
        const maxRevenue = Math.max(...chartCourses.map((item) => item.revenue || 0), 1);
        const maxEnrollments = Math.max(
          ...chartCourses.map((item) => item.enrollmentCount || 0),
          1,
        );

        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden min-w-0">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4.5 w-4.5 text-black stroke-[2]" />
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Revenue Trend</h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">By Course</span>
              </div>
              <div className="p-6">
                {chartCourses.length > 0 ? (
                  <div className="h-64 w-full flex flex-col justify-end">
                    {/* Bars Row */}
                    <div className="flex-1 w-full flex items-end justify-around gap-2 sm:gap-3 min-w-0 border-b border-slate-200/80 pb-2">
                      {chartCourses.map((course) => {
                        const height = Math.max(
                          8,
                          Math.min(100, Math.round(((course.revenue || 0) / maxRevenue) * 100)),
                        );
                        return (
                          <div
                            key={course._id}
                            className="flex-1 min-w-0 h-full flex items-end justify-center group relative"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-semibold py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-xs">
                              ${course.revenue || 0}
                            </div>
                            <div
                              className="w-full max-w-[42px] bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all duration-300 cursor-pointer"
                              style={{ height: `${height}%` }}
                              title={`${course.title}: $${course.revenue || 0}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Labels Row */}
                    <div className="flex w-full items-start justify-around gap-2 sm:gap-3 min-w-0 pt-2.5">
                      {chartCourses.map((course) => (
                        <div key={`label-${course._id}`} className="flex-1 min-w-0 text-center">
                          <span
                            className="text-[11px] text-slate-500 font-medium truncate block w-full hover:text-slate-900 transition-colors"
                            title={course.title}
                          >
                            {course.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                    No revenue data recorded yet
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment Chart */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden min-w-0">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-black stroke-[2]" />
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Student Enrollments
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">By Course</span>
              </div>
              <div className="p-6">
                {chartCourses.length > 0 ? (
                  <div className="h-64 w-full flex flex-col justify-end">
                    {/* Bars Row */}
                    <div className="flex-1 w-full flex items-end justify-around gap-2 sm:gap-3 min-w-0 border-b border-slate-200/80 pb-2">
                      {chartCourses.map((course) => {
                        const height = Math.max(
                          8,
                          Math.min(
                            100,
                            Math.round(((course.enrollmentCount || 0) / maxEnrollments) * 100),
                          ),
                        );
                        return (
                          <div
                            key={course._id}
                            className="flex-1 min-w-0 h-full flex items-end justify-center group relative"
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-semibold py-1 px-2 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-xs">
                              {course.enrollmentCount || 0} students
                            </div>
                            <div
                              className="w-full max-w-[42px] bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all duration-300 cursor-pointer"
                              style={{ height: `${height}%` }}
                              title={`${course.title}: ${course.enrollmentCount || 0} students`}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Labels Row */}
                    <div className="flex w-full items-start justify-around gap-2 sm:gap-3 min-w-0 pt-2.5">
                      {chartCourses.map((course) => (
                        <div key={`label-${course._id}`} className="flex-1 min-w-0 text-center">
                          <span
                            className="text-[11px] text-slate-500 font-medium truncate block w-full hover:text-slate-900 transition-colors"
                            title={course.title}
                          >
                            {course.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                    No enrollment data recorded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Course Performance */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Course Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {analytics?.courses?.map((course, index) => (
                <tr key={course._id || index} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {course.thumbnail ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover shadow-2xs"
                            src={course.thumbnail}
                            alt={course.title}
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center text-black">
                            <BookOpen className="h-5 w-5 text-black stroke-[1.5]" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900">{course.title}</div>
                        <div className="text-xs text-slate-500">{course.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    {course.enrollmentCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                    ${course.revenue || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
                      <span className="text-sm font-semibold text-slate-900">
                        {course.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center max-w-[140px]">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mr-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${course.completionRate || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {course.completionRate || 0}%
                      </span>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-xs text-slate-400">
                    No course data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Content */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Top Content</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics?.topContent?.map((content, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{content.title}</p>
                    <p className="text-xs text-slate-500">{content.views} views</p>
                  </div>
                  <div className="text-xs font-bold text-emerald-600">#{index + 1}</div>
                </div>
              )) || <p className="text-slate-400 text-xs text-center">No data available</p>}
            </div>
          </div>
        </div>

        {/* Student Engagement */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Engagement</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-600">Avg Watch Time</span>
                <span className="text-xs font-bold text-slate-900">
                  {analytics?.engagement?.avgWatchTime || '0m'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-600">Discussion Posts</span>
                <span className="text-xs font-bold text-slate-900">
                  {analytics?.engagement?.discussionPosts || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-600">Q&A Questions</span>
                <span className="text-xs font-bold text-slate-900">
                  {analytics?.engagement?.questions || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Revenue Sources</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-600">Course Sales</span>
                <span className="text-xs font-bold text-slate-900">
                  ${analytics?.revenueBreakdown?.courses || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-600">Subscriptions</span>
                <span className="text-xs font-bold text-slate-900">
                  ${analytics?.revenueBreakdown?.subscriptions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-medium text-slate-600">Other</span>
                <span className="text-xs font-bold text-slate-900">
                  ${analytics?.revenueBreakdown?.other || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
