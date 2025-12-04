'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '@/services/api';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
  Eye,
  MoreVertical,
  Settings
} from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const ManageCommunities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const { data: communitiesData, isLoading, error, refetch } = useQuery({
    queryKey: ['creatorCommunities'],
    queryFn: () => communityAPI.getCreatorCommunities()
  });

  const handleDeleteCommunity = async (communityId, communityName) => {
    const confirmMessage = `Are you sure you want to delete "${communityName}"?\n\nThis will permanently delete:\n• All community posts\n• All community events\n• All member data\n• All community content\n\nThis action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      const deleteToast = toast.loading('Deleting community...');

      try {
        await communityAPI.deleteCommunity(communityId);
        toast.success('Community deleted successfully', { id: deleteToast });
        refetch();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete community';
        toast.error(errorMessage, { id: deleteToast });
        console.error('Delete community error:', error);
      }
    }
  };

  const handleToggleStatus = async (communityId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await communityAPI.updateCommunityStatus(communityId, newStatus);
      toast.success(`Community ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error) {
      toast.error('Failed to update community status');
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
        <p className="text-red-600">Failed to load communities</p>
        <button onClick={() => refetch()} className="btn-primary mt-4">
          Try Again
        </button>
      </div>
    );
  }

  const communities = communitiesData?.data?.data?.data || [];

  // Debug logging
  console.log('communitiesData:', communitiesData);
  console.log('communities:', communities);
  console.log('is array?', Array.isArray(communities));

  return (


    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Communities</h1>
          <p className="text-gray-600 mt-1">Create, edit, and manage your communities</p>
        </div>
        <Link href="/create-community" className="btn-primary mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-full"
            >
              <option value="all">All Communities</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>

          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-full"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="members">Most Members</option>
              <option value="activity">Most Active</option>
            </select>
          </div>
        </div>
      </div>


      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Communities</p>


              <p className="text-2xl font-bold text-gray-900">
                {communitiesData?.data?.data?.stats?.totalCommunities || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {communitiesData?.data?.data?.stats?.totalMembers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {communitiesData?.data?.data?.stats?.totalPosts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {communitiesData?.data?.data?.stats?.totalEvents || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Communities List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {communities.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first community'
              }
            </p>
            <Link href="/create-community" className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Community
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Community
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Events
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {communities.map((community) => (
                  <tr key={community._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {community.banner ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={community.banner}
                              alt={community.name}
                            />
                          ) : (
                            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Users className="h-6 w-6 text-primary-600" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link href={`/communities/${community._id}`} // or community.slug, depending on your app
                            className="text-sm font-medium text-gray-900 hover:text-primary-600 hover:underline">
                            {community.name}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {community.category} • {community.privacy}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${community.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {community.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-1" />
                        {community.memberCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 text-gray-400 mr-1" />
                        {community.postCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {community.eventCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(community.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/communities/${community._id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/edit-community/${community._id}`}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/community-settings/${community._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Settings className="h-4 w-4" />
                        </Link>


                        <button
                          onClick={() => handleDeleteCommunity(community._id, community.name)}
                          className="text-red-600 hover:text-red-900"
                          title={`Delete ${community.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCommunities;

