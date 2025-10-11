import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { User, Mail, Calendar, MapPin, Edit } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => userAPI.getUser(user?.id),
    enabled: !!user?.id
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
        <p className="text-red-600">Failed to load profile data</p>
      </div>
    );
  }

  const profile = profileData?.data || user;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile?.name || 'User Name'}
                </h1>
                <p className="text-gray-600">{profile?.email}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {profile?.role || 'Student'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Full Name</p>
                <p className="text-sm text-gray-600">
                  {profile?.name || 'Not provided'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-600">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Joined</p>
                <p className="text-sm text-gray-600">
                  {profile?.createdAt ?
                    new Date(profile.createdAt).toLocaleDateString() :
                    'Not available'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">
                  {profile?.location || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Account Statistics
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Courses Enrolled</span>
              <span className="text-sm font-medium">
                {profile?.enrolledCourses?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Communities Joined</span>
              <span className="text-sm font-medium">
                {profile?.joinedCommunities?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Courses Created</span>
              <span className="text-sm font-medium">
                {profile?.createdCourses?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Communities Created</span>
              <span className="text-sm font-medium">
                {profile?.createdCommunities?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio/About Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">About</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600">
            {profile?.bio || 'No bio provided yet.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
