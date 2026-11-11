'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { communityAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Users, Globe, Lock, MessageSquare, Calendar, Search, Plus, Sparkles } from 'lucide-react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import Pagination from '@/components/UI/Pagination';
import EmptyStateCard from '@/components/UI/EmptyStateCard';
import StatusBadge from '@/components/UI/StatusBadge';
import { useDebounce } from '@/providers/useDebounceHook';

const MyCommunities = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const {
    data: communitiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['myCommunities', user?._id],
    queryFn: () => communityAPI.getCreatorCommunities(),
    enabled: !!user,
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

  const filteredCommunities = communities.filter(
    (community) =>
      community.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      community.description?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCommunities.length / pageSize) || 1;
  const paginatedCommunities = filteredCommunities.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-full space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Social Circles</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Communities</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Engage with study peers, participate in live events, and stay active in discussions.
            </p>
          </div>
          <Link
            href="/communities"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Join Communities</span>
          </Link>
        </div>

        {/* Integrated Search Strip */}
        <div className="pt-4 border-t border-slate-100">
          <div className="relative max-w-lg">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search your communities by name or topic..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      {filteredCommunities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCommunities.map((community) => (
              <Link
                key={community._id}
                href={`/communities/${community._id}`}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.04)] hover:border-slate-300 hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate text-sm">
                          {community.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {community.category || 'General'}
                        </span>
                      </div>
                    </div>
                    <StatusBadge
                      status={community.type === 'private' ? 'private' : 'public'}
                      label={community.type === 'private' ? 'Private' : 'Public'}
                    />
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                    {community.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center text-[11.5px] font-semibold text-slate-700">
                      <Users className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      {community.memberCount || 0} members
                    </span>

                    <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                        {community.recentPostsCount || 0}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {community.upcomingEventsCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-slate-200/80">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filteredCommunities.length}
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
          icon={Users}
          title={searchTerm ? 'No matching communities found' : 'No communities joined yet'}
          description={
            searchTerm
              ? 'Try modifying your search keywords.'
              : 'Join interest-based groups, ask questions, and share insights with students around the globe.'
          }
          actionText={searchTerm ? 'Clear Search' : 'Explore Communities'}
          onAction={searchTerm ? () => setSearchTerm('') : undefined}
          actionHref={!searchTerm ? '/communities' : undefined}
        />
      )}
    </div>
  );
};

export default MyCommunities;
