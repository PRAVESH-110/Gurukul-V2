import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Globe, Lock, MessageSquare, Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { communityAPI } from '../../services/api';

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
    },
    onError: () => {
      setJoining(false);
    }
  });

  const handleJoin = () => {
    setJoining(true);
    joinMutation.mutate();
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
        <p className="text-red-600">Failed to load community details</p>
      </div>
    );
  }

  const community = communityData?.data?.community;
  const posts = postsData?.data?.posts || [];
  const events = eventsData?.data?.events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Community Header */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-900 mr-3 ">
                  {community?.name}
                </h1>
                {community?.type === 'private' ? (
                  <Lock className="h-6 w-6 text-gray-500" />
                ) : (
                  <Globe className="h-6 w-6 text-green-500" />
                )}
              </div>
              
              <p className="text-gray-700 mb-4 max-w-3xl">
                {community?.description}
              </p>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {community?.memberCount || 0} members
                </span>
                <span className="capitalize">
                  {community?.category || 'General'}
                </span>
                <span>
                  Created {new Date(community?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {user && !community?.members?.some(m => m.user === user._id) && community?.type === 'public' && (
                <button className="btn-primary" onClick={handleJoin} disabled={joining}>
                  {joining ? 'Joining...' : 'Join Community'}
                </button>
              )}
              {user?._id === community?.creator?._id && (
                <button 
                  className="btn-outline"
                  onClick={() => navigate(`/edit-community/${id}`)}
                  title="Edit community settings"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Posts
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'events'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2 inline" />
                Events
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {user && (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <button
                    onClick={() => navigate(`/communities/${id}/create-post`)}
                    className="w-full block text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-500">Share something with the community...</span>
                  </button>
                </div>
              )}

              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start space-x-3">
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.firstName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {post.author?.firstName?.[0]}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {post.author?.firstName} {post.author?.lastName}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-700 mb-4">{post.content}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.likeCount || 0} likes</span>
                          <span>{post.commentCount || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">Be the first to share something!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              {user?.role === 'creator' && (
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
                  <button
                    onClick={() => navigate(`/communities/${id}/create-event`)}
                    className="w-full block text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-500">Host a new event for this community...</span>
                  </button>
                </div>
              )}
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event._id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-700 mb-4">{event.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(event.startDate).toLocaleDateString()}
                          </span>
                          <span>
                            {new Date(event.startDate).toLocaleTimeString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendeeCount || 0} attending
                          </span>
                        </div>
                      </div>
                      {user && (
                        <button className="btn-outline">RSVP</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events scheduled</h3>
                  <p className="text-gray-600">Check back later for upcoming events</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="font-semibold text-gray-900 mb-4">About</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 capitalize">{community?.type}</span>
              </div>
              <div>
                <span className="text-gray-600">Category:</span>
                <span className="ml-2">{community?.category || 'General'}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">
                  {new Date(community?.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Creator</h4>
              <div className="flex items-center">
                {community?.creator?.avatar ? (
                  <img
                    src={community.creator.avatar}
                    alt={`${community.creator.firstName} ${community.creator.lastName}`}
                    className="w-8 h-8 rounded-full object-cover mr-3"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-gray-700">
                      {community?.creator?.firstName?.[0]}
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-900">
                  {community?.creator?.firstName} {community?.creator?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;