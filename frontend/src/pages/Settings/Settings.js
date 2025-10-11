import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    notifications: {
      email: true,
      push: true,
      courseUpdates: true,
      communityUpdates: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showActivity: true
    },
    theme: 'light'
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userAPI.updateUser(user?.id, data),
    onSuccess: () => {
      toast.success('Settings updated successfully');
      queryClient.invalidateQueries(['userProfile']);
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: settings.name,
      bio: settings.bio,
      location: settings.location
    });
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="input"
                placeholder="Enter your email"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={settings.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="input"
              rows="3"
              placeholder="Tell us about yourself"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={settings.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="input"
              placeholder="Enter your location"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive push notifications in browser</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => handleNotificationChange('push', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Course Updates</p>
              <p className="text-sm text-gray-600">Get notified about course updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.courseUpdates}
                onChange={(e) => handleNotificationChange('courseUpdates', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              className="input"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Show Email</p>
              <p className="text-sm text-gray-600">Display your email on your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.showEmail}
                onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updateProfileMutation.isLoading}
          className="btn-primary"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
