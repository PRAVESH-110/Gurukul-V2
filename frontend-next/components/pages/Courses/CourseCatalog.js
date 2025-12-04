'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { courseAPI } from '@/services/api';
import { Search, Filter, BookOpen, Star, Users, Clock, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { getImageUrl } from '@/utils/imageUtils';

const CourseCatalog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['courses', { search: searchTerm, category: selectedCategory, sort: sortBy }],
    queryFn: () => courseAPI.getCourses({
      search: searchTerm,
      category: selectedCategory,
      sort: sortBy
    })
  });

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing',
    'Data Science', 'Photography', 'Music', 'Language'
  ];

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
            <BookOpen className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load courses</h3>
          <p className="text-gray-600 mb-6">We couldn't fetch the course catalog. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const courses = coursesData?.data?.courses || [];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Courses</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover a world of knowledge with our expertly crafted courses.
              From coding to design, find the perfect path for your learning journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-10 sticky top-4 z-30 backdrop-blur-xl bg-white/90 supports-[backdrop-filter]:bg-white/60">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative min-w-[200px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full appearance-none px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course) => (
              <Link
                key={course._id}
                href={`/courses/${course._id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {course.thumbnail ? (
                    <img
                      src={getImageUrl(course.thumbnail)}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100"><svg class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <BookOpen className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                      {course.category || 'General'}
                    </span>
                    <div className="flex items-center text-yellow-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-700">
                        {course.rating?.average?.toFixed(1) || '4.5'}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-lg">
                    {course.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {course.enrollmentCount || 0} students
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {course.duration || 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {course.price > 0 ? (
                        <span className="text-xl font-bold text-gray-900">
                          ${course.price}
                        </span>
                      ) : (
                        <span className="text-xl font-bold text-green-600">Free</span>
                      )}
                      <span className="text-sm font-medium text-primary-600 group-hover:translate-x-1 transition-transform flex items-center">
                        View Course <ArrowRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              We couldn't find any courses matching your criteria. Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSortBy('popular');
              }}
              className="mt-6 btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;

