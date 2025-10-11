import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { searchAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { Search as SearchIcon, Filter, BookOpen, Users, MessageSquare, X } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    price: ''
  });

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', query, activeTab, filters],
    queryFn: () => {
      if (!query.trim()) return { data: { courses: [], communities: [], users: [], posts: [] } };

      const searchParams = { q: query };
      if (activeTab !== 'all') searchParams.type = activeTab;
      if (filters.category) searchParams.category = filters.category;
      if (filters.level) searchParams.level = filters.level;
      if (filters.price) searchParams.price = filters.price;

      return searchAPI.globalSearch(searchParams);
    },
    enabled: !!query.trim()
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  const results = searchResults?.data || {};

  const tabs = [
    { id: 'all', label: 'All', count: (results.courses?.length || 0) + (results.communities?.length || 0) + (results.users?.length || 0) + (results.posts?.length || 0) },
    { id: 'courses', label: 'Courses', count: results.courses?.length || 0 },
    { id: 'communities', label: 'Communities', count: results.communities?.length || 0 },
    { id: 'users', label: 'Users', count: results.users?.length || 0 },
    { id: 'posts', label: 'Posts', count: results.posts?.length || 0 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for courses, communities, users, or posts..."
                className="input pl-10 pr-10"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Search Results */}
      {query.trim() && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Results Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load search results</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Courses */}
              {(activeTab === 'all' || activeTab === 'courses') && results.courses?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Courses ({results.courses.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {results.courses.map((course) => (
                      <div key={course._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {course.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                By {course.creator?.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {course.enrollmentCount} students
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                ${course.price || 'Free'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communities */}
              {(activeTab === 'all' || activeTab === 'communities') && results.communities?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Communities ({results.communities.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {results.communities.map((community) => (
                      <div key={community._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {community.avatar ? (
                              <img
                                src={community.avatar}
                                alt={community.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">
                              {community.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {community.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                {community.memberCount} members
                              </span>
                              <span className="text-sm text-gray-500">
                                Created by {community.creator?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Users ({results.users.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {results.users.map((user) => (
                      <div key={user._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {user.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts */}
              {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Posts ({results.posts.length})
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {results.posts.map((post) => (
                      <div key={post._id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {post.author?.avatar ? (
                              <img
                                src={post.author.avatar}
                                alt={post.author.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {post.content?.substring(0, 150)}...
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-gray-500">
                                By {post.author?.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query.trim() && !isLoading && (
                results.courses?.length === 0 &&
                results.communities?.length === 0 &&
                results.users?.length === 0 &&
                results.posts?.length === 0
              ) && (
                <div className="text-center py-12">
                  <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!query.trim() && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Search for anything
          </h3>
          <p className="text-gray-600">
            Find courses, communities, users, and posts in our platform
          </p>
        </div>
      )}
    </div>
  );
};

export default Search;
