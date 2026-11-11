'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Clock, Award, Search, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Pagination from '@/components/UI/Pagination';
import { getImageUrl } from '@/utils/imageUtils';
import { MetricsSummaryBar, MetricSegment } from '@/components/UI/MetricsSummaryBar';
import EmptyStateCard from '@/components/UI/EmptyStateCard';
import StatusBadge from '@/components/UI/StatusBadge';
import { useDebounce } from '@/providers/useDebounceHook';

const MyCourses = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const {
    data: coursesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['myCourses', user?._id],
    queryFn: async () => {
      const result = await userAPI.getUserCourses(user._id);
      return result;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
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
        <p className="text-red-600">Failed to load your courses</p>
      </div>
    );
  }

  const courses = coursesData?.data?.data?.courses || [];
  console.log('Courses extracted:', courses);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'in-progress' && course.progress < 100) ||
      (filter === 'completed' && course.progress >= 100);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredCourses.length / pageSize) || 1;
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  const inProgressCount = courses.filter((c) => (c.progress || 0) < 100).length;
  const completedCount = courses.filter((c) => (c.progress || 0) >= 100).length;

  return (
    <div className="w-full space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-700 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enrolled Curriculum</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Courses</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Continue where you left off and keep track of your graduation progress.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            Browse Catalog
          </Link>
        </div>

        {/* Integrated Search and Filter Strip */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search your courses by title..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div className="min-w-[170px]">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer"
            >
              <option value="all">All Enrolled ({courses.length})</option>
              <option value="in-progress">In Progress ({inProgressCount})</option>
              <option value="completed">Completed ({completedCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unified Metrics Summary Bar */}
      <MetricsSummaryBar>
        <MetricSegment
          label="Total Enrolled"
          value={courses.length}
          icon={BookOpen}
          badgeText="All Paths"
          badgeColor="blue"
          subtitle="Courses in your library"
        />
        <MetricSegment
          label="In Progress"
          value={inProgressCount}
          icon={Clock}
          badgeText="Active"
          badgeColor="amber"
          subtitle="Courses with lessons remaining"
        />
        <MetricSegment
          label="Completed"
          value={completedCount}
          icon={Award}
          badgeText="100%"
          badgeColor="emerald"
          subtitle="Certificates and finished paths"
        />
      </MetricsSummaryBar>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCourses.map((course) => {
              const isCompleted = (course.progress || 0) >= 100;
              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
                >
                  <div className="aspect-video bg-slate-100 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={getImageUrl(course.thumbnail)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                        <BookOpen className="h-10 w-10 stroke-[1.5]" />
                      </div>
                    )}

                    <div className="absolute top-3 right-3">
                      <StatusBadge
                        status={isCompleted ? 'completed' : 'in-progress'}
                        label={isCompleted ? 'Completed' : 'In Progress'}
                      />
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        by {course.creator?.firstName} {course.creator?.lastName}
                      </p>

                      {/* Progress Section */}
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-semibold text-slate-700 text-[11px]">Progress</span>
                          <span className="font-bold text-slate-900 text-[11px]">
                            {Math.round(course.progress || 0)}%
                          </span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              isCompleted ? 'bg-emerald-600' : 'bg-primary-600'
                            }`}
                            style={{ width: `${Math.min(course.progress || 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-medium text-slate-400">
                        {course.completedVideos || 0} of {course.totalVideos || 0} lessons
                      </span>

                      <Link
                        href={`/courses/${course._id}`}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-xs'
                        }`}
                      >
                        {isCompleted ? 'Review' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-slate-200/80">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filteredCourses.length}
                pageSize={pageSize}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyStateCard
          icon={BookOpen}
          title={
            searchTerm || filter !== 'all' ? 'No matching courses found' : 'No courses enrolled yet'
          }
          description={
            searchTerm || filter !== 'all'
              ? 'Try modifying your search query or reset the filter dropdown above.'
              : 'Start learning by enrolling in your first course from the Gurukul catalog.'
          }
          actionText={searchTerm || filter !== 'all' ? 'Clear Filters' : 'Browse Courses'}
          onAction={
            searchTerm || filter !== 'all'
              ? () => {
                  setSearchTerm('');
                  setFilter('all');
                  setPage(1);
                }
              : undefined
          }
          actionHref={!searchTerm && filter === 'all' ? '/courses' : undefined}
        />
      )}
    </div>
  );
};

export default MyCourses;
