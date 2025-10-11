import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { communityAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { FiImage, FiX } from 'react-icons/fi';

const CreatePost = () => {
  const { id: communityId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    // Reset file input
    document.getElementById('post-image').value = '';
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log('Community ID:', communityId); // Debug log
      
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      console.log('Form data:', {
        title: data.title,
        content: data.content,
        hasImage: !!selectedImage,
        communityId: communityId
      });

      const response = await communityAPI.createPost(communityId, formData);

      if (response.data && response.data.success) {
        toast.success('Post created successfully!');
        navigate(`/communities/${communityId}`);
      } else {
        throw new Error(response.data?.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="input w-full"
            placeholder="Enter post title"
          />
          {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <textarea
            {...register('content', { required: 'Content is required' })}
            rows={5}
            className="textarea w-full"
            placeholder="Write your post..."
          />
          {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>}
        </div>

        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Add Image (Optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mx-auto h-48 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <FiImage className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="post-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>Upload an image</span>
                      <input
                        id="post-image"
                        name="post-image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;