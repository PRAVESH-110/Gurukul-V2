'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { communityAPI } from '@/services/api';
import { Users, Upload, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCommunity = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Create form data for file upload
      const formData = new FormData();

      // Map form fields to backend expected format
      const communityData = {
        name: data.name,
        description: data.description,
        type: data.privacy, // Map privacy to type
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };

      // Add all fields to form data
      Object.entries(communityData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Add banner file if exists
      if (banner) {
        formData.append('banner', banner);
      }

      // Log the form data for debugging
      console.log('Submitting community data:', communityData);

      const response = await communityAPI.createCommunity(formData);

      if (response.data && response.data.success) {
        toast.success('Community created successfully!');
        router.push(`/communities/${response.data.community._id}`);
      } else {
        throw new Error(response.data?.message || 'Failed to create community');
      }
    } catch (error) {
      console.error('Error creating community:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Failed to create community';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Technology', 'Education', 'Business', 'Arts & Design',
    'Health & Wellness', 'Sports & Fitness', 'Gaming', 'Music',
    'Photography', 'Cooking', 'Travel', 'Books & Literature',
    'Science', 'Politics', 'Environment', 'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Community</h1>
        <p className="text-gray-600">Build a space for like-minded people to connect and learn together</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Community name is required' })}
                className="input w-full"
                placeholder="Enter community name"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Description *
              </label>
              <textarea
                {...register('description', { required: 'Community description is required' })}
                rows={4}
                className="textarea w-full"
                placeholder="Describe what this community is about and what members can expect"
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="input w-full"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Setting *
              </label>
              <select
                {...register('privacy', { required: 'Privacy setting is required' })}
                className="input w-full"
              >
                <option value="">Select privacy</option>
                <option value="public">Public - Anyone can join</option>
                <option value="private">Private - Approval required</option>
              </select>
              {errors.privacy && (
                <p className="text-red-600 text-sm mt-1">{errors.privacy.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Rules (Optional)
              </label>
              <textarea
                {...register('rules')}
                rows={3}
                className="textarea w-full"
                placeholder="Set community guidelines and rules for members to follow"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                {...register('tags')}
                className="input w-full"
                placeholder="Enter tags separated by commas (e.g., programming, javascript, web development)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Tags help people discover your community
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Banner</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Banner Image (Optional)
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="btn-outline cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Banner
                  </label>
                </div>
                {bannerPreview && (
                  <div className="w-full max-w-md h-32 rounded-lg overflow-hidden border">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recommended size: 1200x300px. This will be displayed at the top of your community page.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Settings</h2>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('allowPosts')}
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Allow members to create posts
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('allowEvents')}
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Allow members to create events
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('moderateContent')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Moderate content before publishing
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Make community active immediately
              </label>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <Users className="h-5 w-5 text-blue-400 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Community Guidelines
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Foster a welcoming and inclusive environment</li>
                  <li>Encourage meaningful discussions and knowledge sharing</li>
                  <li>Respect all community members and their opinions</li>
                  <li>Keep content relevant to the community's purpose</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/manage-communities')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Community'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunity;

