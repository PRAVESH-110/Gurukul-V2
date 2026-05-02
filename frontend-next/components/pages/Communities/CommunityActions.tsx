'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Calendar, Users, Settings, Share2, MoreHorizontal, Heart, Clock, MapPin } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface CommunityActionsProps {
    communityId: string;
    communityType: 'public' | 'private';
    creatorId: string;
    isMemberInitial: boolean;
}

/**
 * Client island: handles join/leave, tabs (posts/events/members),
 * and all auth-conditional UI for the community detail page.
 * The static hero, about sidebar etc. are server-rendered in page.tsx.
 */
const CommunityActions = ({
    communityId,
    communityType,
    creatorId,
    isMemberInitial,
}: CommunityActionsProps) => {
    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'members'>('posts');
    const [isMember, setIsMember] = useState(isMemberInitial);
    const [joining, setJoining] = useState(false);

    // Posts
    const { data: postsData } = useQuery({
        queryKey: ['communityPosts', communityId],
        queryFn: () => communityAPI.getCommunityPosts(communityId),
        enabled: activeTab === 'posts',
    });

    // Events
    const { data: eventsData } = useQuery({
        queryKey: ['communityEvents', communityId],
        queryFn: () => communityAPI.getCommunityEvents(communityId),
        enabled: activeTab === 'events',
    });

    const joinMutation = useMutation({
        mutationFn: () => communityAPI.joinCommunity(communityId),
        onSuccess: () => {
            setIsMember(true);
            setJoining(false);
            queryClient.invalidateQueries({ queryKey: ['community', communityId] });
            toast.success('Successfully joined community!');
        },
        onError: (error: any) => {
            setJoining(false);
            toast.error(error?.message || 'Failed to join community');
        },
    });

    const posts = (postsData as any)?.data?.posts || [];
    const events = (eventsData as any)?.data?.events || [];
    const isCreator = user?._id === creatorId || user?.id === creatorId;

    return (
        <div>
            {/* Action buttons row — rendered client side because they depend on auth */}
            <div className="flex items-center gap-3 mb-6">
                {user && !isMember && communityType === 'public' && (
                    <button
                        className="btn-primary shadow-lg shadow-primary/20"
                        onClick={() => { setJoining(true); joinMutation.mutate(); }}
                        disabled={joining}
                    >
                        {joining ? 'Joining...' : 'Join Community'}
                    </button>
                )}
                {isCreator && (
                    <button className="btn-secondary" onClick={() => router.push(`/edit-community/${communityId}`)}>
                        <Settings className="h-4 w-4 mr-2" /> Manage
                    </button>
                )}
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-8 border-b border-gray-200 mb-8">
                {(['posts', 'events', 'members'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab === 'posts' && <><MessageSquare className="h-4 w-4 mr-2 inline" />Discussion</>}
                        {tab === 'events' && <><Calendar className="h-4 w-4 mr-2 inline" />Events</>}
                        {tab === 'members' && <><Users className="h-4 w-4 mr-2 inline" />Members</>}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'posts' && (
                <div className="space-y-6">
                    {user && (
                        <div
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-center cursor-pointer hover:border-primary-200 transition-colors"
                            onClick={() => router.push(`/communities/${communityId}/create-post`)}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center bg-primary-100 text-primary-600 font-bold">
                                {user.firstName?.[0]}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-500 hover:bg-gray-100 transition-colors text-sm">
                                Start a discussion...
                            </div>
                        </div>
                    )}
                    {posts.length > 0 ? posts.map((post: any) => (
                        <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-gray-600 font-medium">
                                        {post.author?.avatar
                                            ? <img src={post.author.avatar} alt={post.author.firstName} className="w-full h-full object-cover" />
                                            : post.author?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-sm">{post.author?.firstName} {post.author?.lastName}</h4>
                                        <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                            <div className="text-gray-600 mb-4 leading-relaxed prose prose-sm max-w-none">
                                <ReactMarkdown>{post.content}</ReactMarkdown>
                            </div>
                            <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
                                    <Heart className="h-5 w-5" />{post.likeCount || 0} Likes
                                </button>
                                <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                                    <MessageSquare className="h-5 w-5" />{post.commentCount || 0} Comments
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No discussions yet</h3>
                            <p className="text-gray-600 mb-6">Be the first to start a conversation!</p>
                            {user && (
                                <button onClick={() => router.push(`/communities/${communityId}/create-post`)} className="btn-primary">
                                    Start Discussion
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'events' && (
                <div className="space-y-6">
                    {(user?.role === 'creator' || user?.role === 'admin') && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Host an Event</h3>
                            <p className="text-gray-600 mb-4">Create a new event for your community members.</p>
                            <button onClick={() => router.push(`/communities/${communityId}/create-event`)} className="btn-primary">
                                <Calendar className="h-4 w-4 mr-2" /> Create Event
                            </button>
                        </div>
                    )}
                    {events.length > 0 ? events.map((event: any) => (
                        <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                            <div className="md:w-48 bg-primary-50 flex flex-col items-center justify-center p-6 text-primary-700">
                                <span className="text-3xl font-bold">{new Date(event.startDate).getDate()}</span>
                                <span className="text-lg font-medium uppercase">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                                    {user && <button className="btn-outline text-sm py-1.5 px-3">RSVP</button>}
                                </div>
                                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center"><Clock className="h-4 w-4 mr-2" />{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{event.location || 'Online'}</div>
                                    <div className="flex items-center"><Users className="h-4 w-4 mr-2" />{event.attendeeCount || 0} attending</div>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                            <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No upcoming events</h3>
                            <p className="text-gray-600">Check back later or host one yourself!</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'members' && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Member list coming soon.</p>
                </div>
            )}
        </div>
    );
};

export default CommunityActions;
