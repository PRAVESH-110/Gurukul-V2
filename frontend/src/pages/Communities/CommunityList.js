import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import { Search, Users, Lock, Globe, Plus, Filter, ArrowRight, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const CommunityList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // Default to 'all' for everyone

  const { data: communitiesData, isLoading, error } = useQuery({
    queryKey: ['communities', { search: searchTerm, type: filterType }],
    queryFn: async () => {
      try {
        if (filterType === 'my' && user) {
          const result = await communityAPI.getCreatorCommunities({
            search: searchTerm
          });
          return result;
        } else {
          const result = await communityAPI.getCommunities({
            search: searchTerm,
            type: filterType === 'all' ? '' : filterType
          });
          return result;
        }
      } catch (err) {
        console.error('Communities fetch error:', err);
        throw err;
      }
    },
    enabled: filterType !== 'my' || !!user // Only enable query if not 'my' or user exists
  });

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
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load communities</h3>
          <p className="text-gray-600 mb-6">
            {error?.message || error?.response?.data?.message || 'Please check the console for details'}
          </p>
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

  // Handle different response structures
  const communities = communitiesData?.data?.communities || communitiesData?.data?.data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Community</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with like-minded learners, share knowledge, and grow together.
                Find your tribe in our diverse collection of communities.
              </p>
            </div>
            {(user?.role === 'creator' || user?.role === 'admin') && (
              <Link
                to="/create-community"
                className="btn-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 whitespace-nowrap"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Community
              </Link>
            )}
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
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => setFilterType('all')}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${filterType === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('my')}
                disabled={!user}
                title={!user ? 'Sign in to view your communities' : ''}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${filterType === 'my'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
              >
                My Communities
              </button>
            </div>

            {/* Type Filter Dropdown */}
            <div className="relative min-w-[180px]">
              <select
                value={filterType === 'my' ? 'all' : filterType} // Reset if in 'my' mode visually, though logic handles it
                onChange={(e) => setFilterType(e.target.value)}
                disabled={filterType === 'my'}
                className="w-full appearance-none px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <option value="all">All Types</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        {communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {communities.map((community) => (
              <Link
                key={community._id}
                to={`/communities/${community._id}`}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="h-32 bg-gradient-to-r from-primary-500 to-blue-600 relative">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-4 right-4">
                    {community.type === 'private' ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur text-xs font-medium text-white border border-white/20">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-medium text-white border border-white/20">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="-mt-10">
                      {community.creator?.avatar ? (
                        <img
                          src={community.creator.avatar}
                          alt={`${community.creator.firstName} ${community.creator.lastName}`}
                          className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-white flex items-center justify-center">
                          <div className="w-full h-full bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-2xl">
                            {community.name?.[0] || 'C'}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {community.category || 'General'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {community.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {community.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1.5" />
                        {community.memberCount || 0} members
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Active
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">Created by</span>
                        <span className="text-sm font-medium text-gray-900">
                          {community.creator?.firstName} {community.creator?.lastName}
                        </span>
                      </div>
                      <span className="text-primary-600 group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="h-5 w-5" />
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
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              We couldn't find any communities matching your criteria. Try adjusting your search or filters.
            </p>
            {(user?.role === 'creator' || user?.role === 'admin') ? (
              <Link to="/create-community" className="btn-primary inline-flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create the First Community
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="btn-secondary"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityList;
