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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analytics?.revenue?.total || 0}</p>
              <p className="text-xs text-green-600 mt-1">
                +{analytics?.revenue?.growth || 0}% from last period
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.students?.total || 0}</p>
              <p className="text-xs text-blue-600 mt-1">
                +{analytics?.students?.new || 0} new this period
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Course Views</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.views?.total || 0}</p>
              <p className="text-xs text-purple-600 mt-1">
                {analytics?.views?.avgPerCourse || 0} avg per course
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.rating?.average?.toFixed(1) || '0.0'}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {analytics?.rating?.totalReviews || 0} total reviews
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end gap-3 bg-gray-50 rounded-lg p-6">
              {(analytics?.courses || []).slice(0, 8).map((course) => {
                const maxRevenue = Math.max(
                  ...(analytics?.courses || []).map((item) => item.revenue || 0),
                  1,
                );
                const height = Math.max(8, ((course.revenue || 0) / maxRevenue) * 100);
                return (
                  <div
                    key={course._id}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                  >
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${course.title}: $${course.revenue || 0}`}
                    />
                    <span className="text-[10px] text-gray-500 truncate w-full text-center">
                      {course.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enrollment Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Student Enrollments</h2>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end gap-3 bg-gray-50 rounded-lg p-6">
              {(analytics?.courses || []).slice(0, 8).map((course) => {
                const maxEnrollments = Math.max(
                  ...(analytics?.courses || []).map((item) => item.enrollmentCount || 0),
                  1,
                );
                const height = Math.max(8, ((course.enrollmentCount || 0) / maxEnrollments) * 100);
                return (
                  <div
                    key={course._id}
                    className="flex-1 h-full flex flex-col justify-end items-center gap-2"
                  >
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${course.title}: ${course.enrollmentCount || 0} students`}
                    />
                    <span className="text-[10px] text-gray-500 truncate w-full text-center">
                      {course.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Course Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics?.courses?.map((course, index) => (
                <tr key={course._id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {course.thumbnail ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={course.thumbnail}
                            alt={course.title}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">{course.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.enrollmentCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${course.revenue || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-900">
                        {course.rating?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${course.completionRate || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{course.completionRate || 0}%</span>
                    </div>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Content</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics?.topContent?.map((content, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{content.title}</p>
                    <p className="text-xs text-gray-500">{content.views} views</p>
                  </div>
                  <div className="text-sm font-medium text-green-600">#{index + 1}</div>
                </div>
              )) || <p className="text-gray-500 text-center">No data available</p>}
            </div>
          </div>
        </div>

        {/* Student Engagement */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Engagement</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Watch Time</span>
                <span className="text-sm font-medium">
                  {analytics?.engagement?.avgWatchTime || '0m'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discussion Posts</span>
                <span className="text-sm font-medium">
                  {analytics?.engagement?.discussionPosts || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Q&A Questions</span>
                <span className="text-sm font-medium">{analytics?.engagement?.questions || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Sources</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Course Sales</span>
                <span className="text-sm font-medium">
                  ${analytics?.revenueBreakdown?.courses || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subscriptions</span>
                <span className="text-sm font-medium">
                  ${analytics?.revenueBreakdown?.subscriptions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Other</span>
                <span className="text-sm font-medium">
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
