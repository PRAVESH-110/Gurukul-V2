'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { userAPI } from '@/services/api';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { User, Mail, Calendar, MapPin, Edit } from 'lucide-react';
import EditProfile from './EditProfileModal';
import toast from 'react-hot-toast';


const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isModalOpen || event.click === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };



    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const handleProfileUpdate = (updatedUser) => {
    if (!updatedUser) {
      console.error('No user data received');
      return;
    }

    // Get the user ID first (handle both _id and id)
    const userId = user?._id || user?.id || updatedUser?._id || updatedUser?.id;

    if (!userId) {
      console.error('No user ID found');
      return;
    }

    // Update the query cache with the new data IMMEDIATELY
    // The API returns { success: true, user: {...} }, so we need to match that structure
    queryClient.setQueryData(['userProfile', userId], (oldData) => {
      console.log('Updating cache with userId:', userId);
      console.log('Old data:', oldData);
      console.log('New user data:', updatedUser);

      // Create a completely new object to ensure React Query detects the change
      const newData = {
        success: true,
        user: { ...updatedUser } // Create a new user object reference
      };
      // If oldData exists, merge it but ensure we create new object references
      if (oldData) {
        const updated = {
          ...oldData,
          user: { ...updatedUser } // Force new reference
        };
        console.log('Updated cache data:', updated);
        return updated;
      }
      console.log('New cache data:', newData);
      return newData;
    });

    // Update the auth context with the new user data
    updateUser(updatedUser);

    // Close the modal
    setIsModalOpen(false);

    // Show success message
    toast.success('Profile updated successfully');
  };


  // Get user ID (handle both _id and id)
  const userId = user?._id || user?.id;

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userAPI.getUser(userId),
    enabled: !!userId,
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

  // The API returns { success: true, user: {...} }, so we need profileData.user
  // We also combine firstName and lastName for display.
  const profile = profileData?.user || user;

  return (
    <div className=" space-y-6">
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
                  {`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'User Name'}
                </h1>
                <p className="text-gray-600">{profile?.email}</p>
                <p className="text-sm text-gray-500 capitalize">
                  {profile?.role || 'Student'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-outline "
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
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
                  {`${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Not provided'}
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
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : 'Not available'}
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
              <span className="text-sm text-gray-600">
                Communities Created
              </span>
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

      {/* Edit Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <EditProfile
              user={profile}
              onCancel={() => setIsModalOpen(false)}
              onSuccess={handleProfileUpdate}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

