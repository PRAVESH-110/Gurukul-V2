import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { courseAPI, videoAPI } from '../../services/api';
import { BookOpen, Upload, DollarSign, Globe, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Prepare the course data
      const courseData = {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        price: parseFloat(data.price) || 0,
        language: data.language || 'English',
        isPublished: data.isPublished || false,
        allowComments: data.allowComments !== false, // Default to true
        // Add other fields as needed
        tags: [], // Add tags if you have them
        requirements: [], // Add requirements if you have them
        learningOutcomes: [] // Add learning outcomes if you have them
      };

      // If using FormData for file upload
      if (thumbnail) {
        const formData = new FormData();
        Object.keys(courseData).forEach(key => {
          if (Array.isArray(courseData[key])) {
            formData.append(key, JSON.stringify(courseData[key]));
          } else {
            formData.append(key, courseData[key]);
          }
        });
        formData.append('thumbnail', thumbnail);
        
        const response = await courseAPI.createCourse(formData);
        toast.success('Course created successfully!');
        navigate(`/courses/${response.data.course._id}`);
      } else {
        // Send as JSON if no file
        const response = await courseAPI.createCourse(courseData);
        toast.success('Course created successfully!');
        navigate(`/courses/${response.data.course._id}`);
      }
    } catch (error) {
      console.error('Course creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create course';
      
      // Show specific validation errors if available
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(err => err.msg || err.message).join(', ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 
    'Data Science', 'Photography', 'Music', 'Language',
    'Health & Fitness', 'Cooking', 'Art', 'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create New Course</h1>
        <p className="text-gray-600">Share your knowledge and create an engaging learning experience</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Course title is required' })}
                className="input w-full"
                placeholder="Enter course title"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                {...register('description', { required: 'Course description is required' })}
                rows={4}
                className="textarea w-full"
                placeholder="Describe what students will learn in this course"
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
                Difficulty Level *
              </label>
              <select
                {...register('level', { required: 'Difficulty level is required' })}
                className="input w-full"
              >
                <option value="">Select difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.level && (
                <p className="text-red-600 text-sm mt-1">{errors.level.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be 0 or greater' }
                  })}
                  className="input w-full pl-10"
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">Set to 0 for free course</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <input
                type="text"
                {...register('language')}
                className="input w-full"
                placeholder="English"
                defaultValue="English"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Thumbnail</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Thumbnail Image
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="btn-outline cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </label>
                {thumbnailPreview && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Recommended size: 1280x720px (16:9 aspect ratio)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPublished')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Publish course immediately
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('allowComments')}
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Allow student comments and discussions
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/manage-courses')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;
