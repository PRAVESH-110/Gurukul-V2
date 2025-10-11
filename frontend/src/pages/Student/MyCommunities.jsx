import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '../../services/api';
import { 
  Users, 
  Search, 
  MessageSquare,
  Calendar,
  Eye,
  ExternalLink,
  Filter
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const MyCommunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('joined');

  const { data: communitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['myCommunities', searchTerm, sortBy],
    queryFn: () => communityAPI.getCreatorCommunities({
      search: searchTerm,
      sort: sortBy
    })
  });

  const handleLeaveCommunity = async (communityId, communityName) => {
    if (window.confirm(`Are you sure you want to leave "${communityName}"?`)) {
      try {
        await communityAPI.leaveCommunity(communityId);
        toast.success('Left community successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to leave community');
      }
    }
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
        <p className="text-red-600">Failed to load your communities</p>
        <button onClick={() => refetch()} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  const communities = communitiesData?.data?.data || communitiesData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Communities</h1>
          <p className="text-gray-600 mt-1">Communities you've joined and participate in</p>
        </div>
        <Link to="/communities" className="btn-primary mt-4 sm:mt-0">
          <Search className="h-4 w-4 mr-2" />
          Discover Communities
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search your communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>
          
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-full"
            >
              <option value="joined">Recently Joined</option>
              <option value="name">Name A-Z</option>
              <option value="activity">Most Active</option>
              <option value="members">Most Members</option>
            </select>
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      {communities.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'You haven\'t joined any communities yet'
            }
          </p>
          <Link to="/communities" className="btn-primary">
            <Search className="h-4 w-4 mr-2" />
            Browse Communities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <div key={community._id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Community Header */}
              <div className="relative h-32 bg-gradient-to-r from-primary-500 to-primary-600">
                {community.coverImage ? (
                  <img
                    src={community.coverImage}
                    alt={community.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                )}
                
                {/* Community Type Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    community.type === 'private' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {community.type}
                  </span>
                </div>
              </div>

              {/* Community Content */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {community.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {community.description}
                  </p>
                </div>

                {/* Community Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div>
                    <div className="flex items-center justify-center text-gray-600 mb-1">
                      <Users className="h-4 w-4 mr-1" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {community.memberCount || community.members?.length || 0}
                    </div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-gray-600 mb-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {community.postCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Posts</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center text-gray-600 mb-1">
                      <Calendar className="h-4 w-4 mr-1" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {community.eventCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Events</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Link
                    to={`/communities/${community._id}`}
                    className="flex-1 btn-primary text-center text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                  
                  <button
                    onClick={() => handleLeaveCommunity(community._id, community.name)}
                    className="flex-1 btn-outline text-sm"
                  >
                    Leave
                  </button>
                </div>
              </div>

              {/* Community Footer - Creator Info */}
              {community.creator && (
                <div className="px-4 py-3 bg-gray-50 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-1">Created by</span>
                    <span className="font-medium text-gray-900">
                      {community.creator.firstName} {community.creator.lastName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCommunities;