import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Globe, Lock, MessageSquare, Settings, Users, Heart, Share2, MoreHorizontal, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { communityAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [joining, setJoining] = useState(false);
  const queryClient = useQueryClient();

  const { data: communityData, isLoading, error } = useQuery({
    queryKey: ['community', id],
    queryFn: () => communityAPI.getCommunity(id)
  });

  const { data: postsData } = useQuery({
    queryKey: ['communityPosts', id],
    queryFn: () => communityAPI.getCommunityPosts(id),
    enabled: !!communityData && activeTab === 'posts'
  });

  const { data: eventsData } = useQuery({
    queryKey: ['communityEvents', id],
    queryFn: () => communityAPI.getCommunityEvents(id),
    enabled: !!communityData && activeTab === 'events'
  });

  const joinMutation = useMutation({
    mutationFn: () => communityAPI.joinCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['community', id]);
      queryClient.invalidateQueries(['communityMembers', id]);
      setJoining(false);
      toast.success('Successfully joined community!');
    },
    onError: (error) => {
      setJoining(false);
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  });

  const handleJoin = () => {
    setJoining(true);
    joinMutation.mutate();
  };

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
          <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to load community details</h3>
          <p className="text-gray-600 mb-6">We couldn't fetch the community information. Please try again later.</p>
          <button
            onClick={() => navigate('/communities')}
            className="btn-primary w-full"
          >
            Back to Communities
          </button>
        </div>
      </div>
    );
  }

  const community = communityData?.data?.community;
  const posts = postsData?.data?.posts || [];
  const events = eventsData?.data?.events || [];

  const isMember = community?.members?.some(
    (m) => m?.user?._id?.toString() === user?._id?.toString() || m?.user === user?._id
  );

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans pb-12">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 md:-mt-20 mb-8 flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center flex-shrink-0">
              {community?.creator?.avatar ? (
                <img
                  src={community.creator.avatar}
                  alt={community.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-4xl">
                  {community?.name?.[0] || 'C'}
                </div>
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {community?.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      {community?.type === 'private' ? (
                        <Lock className="h-4 w-4 mr-1.5" />
                      ) : (
                        <Globe className="h-4 w-4 mr-1.5 text-green-500" />
                      )}
                      <span className="capitalize">{community?.type} Group</span>
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1.5" />
                      {community?.memberCount || 0} members
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {community?.category || 'General'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {user && !isMember && community?.type === 'public' && (
                    <button
                      className="btn-primary shadow-lg shadow-primary/20"
                      onClick={handleJoin}
                      disabled={joining}
                    >
                      {joining ? 'Joining...' : 'Join Community'}
                    </button>
                  )}

                  {user?._id === community?.creator?._id && (
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/edit-community/${id}`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage
                    </button>
                  )}

                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'posts'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <MessageSquare className="h-4 w-4 mr-2 inline" />
              Discussion
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'events'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Events
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'members'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Users className="h-4 w-4 mr-2 inline" />
              Members
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Input */}
            {activeTab === 'posts' && user && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-center cursor-pointer hover:border-primary-200 transition-colors"
                onClick={() => navigate(`/communities/${id}/create-post`)}>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">
                      {user.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 text-gray-500 hover:bg-gray-100 transition-colors text-sm">
                  Start a discussion...
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                            {post.author?.avatar ? (
                              <img
                                src={post.author.avatar}
                                alt={post.author.firstName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-medium">
                                {post.author?.firstName?.[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {post.author?.firstName} {post.author?.lastName}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{post.content}</p>

                      <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors group">
                          <Heart className="h-5 w-5 group-hover:fill-current" />
                          <span>{post.likeCount || 0} Likes</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
                          <MessageSquare className="h-5 w-5" />
                          <span>{post.commentCount || 0} Comments</span>
                        </button>
                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors ml-auto">
                          <Share2 className="h-5 w-5" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No discussions yet</h3>
                    <p className="text-gray-600 mb-6">Be the first to start a conversation in this community!</p>
                    {user && (
                      <button
                        onClick={() => navigate(`/communities/${id}/create-post`)}
                        className="btn-primary"
                      >
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
                    <p className="text-gray-600 mb-4">Create a new event for your community members to join.</p>
                    <button
                      onClick={() => navigate(`/communities/${id}/create-event`)}
                      className="btn-primary"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Event
                    </button>
                  </div>
                )}

                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row">
                      <div className="md:w-48 bg-primary-50 flex flex-col items-center justify-center p-6 text-primary-700 border-b md:border-b-0 md:border-r border-gray-100">
                        <span className="text-3xl font-bold">{new Date(event.startDate).getDate()}</span>
                        <span className="text-lg font-medium uppercase">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-sm opacity-75 mt-1">{new Date(event.startDate).getFullYear()}</span>
                      </div>

                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                          {user && <button className="btn-outline text-sm py-1.5 px-3">RSVP</button>}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {event.location || 'Online'}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            {event.attendeeCount || 0} attending
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No upcoming events</h3>
                    <p className="text-gray-600">Check back later for new events or host one yourself!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">About Community</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {community?.description}
              </p>

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(community?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Privacy</span>
                  <span className="font-medium text-gray-900 capitalize">{community?.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900">{community?.category || 'General'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Community Admin</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                  {community?.creator?.avatar ? (
                    <img
                      src={community.creator.avatar}
                      alt={`${community.creator.firstName} ${community.creator.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">
                      {community?.creator?.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {community?.creator?.firstName} {community?.creator?.lastName}
                  </h4>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;