'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityAPI } from '@/services/api';
import { ArrowLeft, Upload, X, Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const EditCommunity = () => {
  const params = useParams();
  const communityId = params?.communityId;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    tags: [],
    rules: []
  });

  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [ruleInput, setRuleInput] = useState('');

  // Fetch community data
  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ['community', communityId],
    queryFn: () => communityAPI.getCommunity(communityId),
    enabled: !!communityId,
    onSuccess: (data) => {
      const community = data.data?.community || data.data;
      setFormData({
        name: community.name || '',
        description: community.description || '',
        type: community.type || 'public',
        tags: community.tags || [],
        rules: community.rules || []
      });
      setBannerPreview(community.coverImage?.url || community.banner);
    }
  });

  // Update community mutation
  const updateMutation = useMutation({
    mutationFn: (data) => communityAPI.updateCommunity(communityId, data),
    onSuccess: () => {
      toast.success('Community updated successfully!');
      queryClient.invalidateQueries(['community', communityId]);
      queryClient.invalidateQueries(['creatorCommunities']);
      router.push('/manage-communities');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update community');
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image must be less than 5MB');
        return;
      }
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRule = () => {
    if (ruleInput.trim()) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, ruleInput.trim()]
      }));
      setRuleInput('');
    }
  };

  const removeRule = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();

    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'tags' || key === 'rules') {
        submitData.append(key, JSON.stringify(formData[key]));
      } else {
        submitData.append(key, formData[key]);
      }
    });

    // Add banner if selected
    if (banner) {
      submitData.append('banner', banner);
    }

    updateMutation.mutate(submitData);
  };

  if (communityLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push('/manage-communities')}
          className="flex items-center text-primary-600 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Communities
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Community</h1>
        <p className="text-gray-600 mt-2">Update your community details and settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input w-full"
                placeholder="Enter community name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="input w-full"
                placeholder="Describe what your community is about..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="input w-full"
                required
              >
                <option value="public">Public - Anyone can join</option>
                <option value="private">Private - Approval required</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Banner</h2>

          <div className="flex items-start space-x-6">
            {bannerPreview && (
              <div className="relative">
                <img
                  src={bannerPreview}
                  alt="Banner preview"
                  className="w-48 h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBanner(null);
                    setBannerPreview(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-400">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Click to upload banner<br />
                    <span className="text-xs text-gray-500">Max 5MB, JPG/PNG</span>
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="input flex-1"
              placeholder="Add a tag and press Enter"
            />
            <button
              type="button"
              onClick={addTag}
              className="btn-secondary"
            >
              Add Tag
            </button>
          </div>
        </div>

        {/* Community Rules */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Community Rules</h2>

          <ul className="space-y-2 mb-4">
            {formData.rules.map((rule, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span>{rule}</span>
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <input
              type="text"
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
              className="input flex-1"
              placeholder="Add a community rule and press Enter"
            />
            <button
              type="button"
              onClick={addRule}
              className="btn-secondary"
            >
              Add Rule
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/manage-communities')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isLoading}
            className="btn-primary flex items-center"
          >
            {updateMutation.isLoading ? (
              <Loader className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Update Community
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCommunity;
