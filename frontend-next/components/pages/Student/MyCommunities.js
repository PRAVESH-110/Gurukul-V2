'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Users, Globe, Lock, MessageSquare, Calendar, Search, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

const MyCommunities = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: communitiesData, isLoading, error } = useQuery({
    queryKey: ['myCommunities', user?._id],
    queryFn: () => communityAPI.getCreatorCommunities(), // This will route to student communities for students
    enabled: !!user
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
        <p className="text-red-600">Failed to load your communities</p>
      </div>
    );
  }

  const communities = communitiesData?.data?.data?.data || communitiesData?.data?.communities || [];

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Communities</h1>
          <p className="text-gray-600">Connect and engage with your learning communities</p>
        </div>
        <Link href="/communities" className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Join More Communities
        </Link>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search your communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Link
              key={community._id}
              href={`/communities/${community._id}`}
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

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {community.memberCount || 0} members
                  </span>
                  <span className="capitalize px-2 py-1 bg-gray-100 rounded-full text-xs">
                    {community.category || 'General'}
                  </span>
                </div>

                {/* Recent Activity */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{community.recentPostsCount || 0} recent posts</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{community.upcomingEventsCount || 0} events</span>
                    </div>
                  </div>
                </div>

                {/* Join Date */}
                <div className="mt-3 text-xs text-gray-500">
                  Joined {new Date(community.joinedAt || community.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No communities match your search' : 'No communities joined yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Join communities to connect with other learners and creators'
            }
          </p>
          {!searchTerm && (
            <Link href="/communities" className="btn-primary">
              Explore Communities
            </Link>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {communities.length > 0 && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-primary-600 mb-2">
              {communities.length}
            </div>
            <div className="text-sm text-gray-600">Communities Joined</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {communities.reduce((sum, c) => sum + (c.recentPostsCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Recent Posts</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {communities.reduce((sum, c) => sum + (c.upcomingEventsCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCommunities;

