import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseAPI } from '../../services/api';
import { Search, Filter, BookOpen, Star, Users, Clock } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { getImageUrl } from '../../utils/imageUtils';

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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load courses</p>
      </div>
    );
  }

  const courses = coursesData?.data?.courses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Catalog</h1>
        <p className="text-gray-600">Discover and learn from our extensive collection of courses</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id}
              to={`/courses/${course._id}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
            >
              <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                {course.thumbnail ? (
                  <img
                    src={getImageUrl(course.thumbnail)}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrollmentCount || 0}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration || 'N/A'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(course.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      ({course.reviewCount || 0})
                    </span>
                  </div>
                  
                  <div className="text-right">
                    {course.price > 0 ? (
                      <span className="font-semibold text-primary-600">
                        ${course.price}
                      </span>
                    ) : (
                      <span className="font-semibold text-green-600">Free</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default CourseCatalog;
