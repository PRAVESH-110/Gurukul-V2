import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import { Search, Users, Lock, Globe, Plus } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const CommunityList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // Default to 'all' for everyone

  const { data: communitiesData, isLoading, error } = useQuery({
    queryKey: ['communities', { search: searchTerm, type: filterType }],
    queryFn: async () => {
      console.log('Fetching communities with filter:', filterType);
      try {
        if (filterType === 'my' && user) {
          const result = await communityAPI.getCreatorCommunities({ 
            search: searchTerm 
          });
          console.log('My communities response:', result.data);
          return result;
        } else {
          const result = await communityAPI.getCommunities({ 
            search: searchTerm, 
            type: filterType === 'all' ? '' : filterType 
          });
          console.log('Communities response:', result.data);
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
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    console.error('Community list error:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load communities</p>
        <p className="text-sm text-gray-500 mt-2">
          {error?.message || error?.response?.data?.message || 'Please check the console for details'}
        </p>
      </div>
    );
  }

  // Handle different response structures
  const communities = communitiesData?.data?.communities || communitiesData?.data?.data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Communities</h1>
          <p className="text-gray-600">Connect with learners and creators in your field</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setFilterType('my')}
              className={`px-4 py-2 text-sm font-medium ${filterType === 'my' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              disabled={!user}
              title={!user ? 'Sign in to view your communities' : ''}
            >
              My Communities
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 text-sm font-medium ${filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              All Communities
            </button>
          </div>
          {user?.role === 'creator' && (
            <Link to="/create-community" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Communities</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Communities Grid */}
      {communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Link
              key={community._id}
              to={`/communities/${community._id}`}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-gray-900 mr-2">
                        {community.name}
                      </h3>
                      {community.type === 'private' ? (
                        <Lock className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {community.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {community.memberCount || 0} members
                  </span>
                  <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {community.category || 'General'}
                  </span>
                </div>

                <div className="mt-4 flex items-center">
                  {community.creator?.avatar ? (
                    <img
                      src={community.creator.avatar}
                      alt={`${community.creator.firstName} ${community.creator.lastName}`}
                      className="w-6 h-6 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <span className="text-xs font-medium text-gray-700">
                        {community.creator?.firstName?.[0]}
                      </span>
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    by {community.creator?.firstName} {community.creator?.lastName}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          {user?.role === 'creator' && (
            <Link to="/create-community" className="btn-primary">
              Create the First Community
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityList;
