import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../services/api';
import { User, Mail, MapPin, Phone, Calendar } from 'lucide-react';

const EditProfile = ({ user, onCancel, onSuccess, setIsModalOpen }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '', // Add other fields if they exist in your User model
    address: '',
    dateOfBirth: ''
  });

  const queryClient = useQueryClient(); 

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
  mutationFn: (updatedData) => userAPI.updateUser(user._id, updatedData),

  onSuccess: (response) => {
    console.log('Mutation onSuccess called with response:', response);
    
    // Extract user data from axios response (response.data contains the API response)
    // Axios wraps the API response in response.data
    const responseData = response?.data || response;
    const updatedUser = responseData?.user;
    
    console.log('Extracted updatedUser:', updatedUser);
    
    if (!updatedUser) {
      console.error('No user data in response. Full response:', response);
      // Close modal even if no user data
      if (onCancel) {
        onCancel();
      }
      if (setIsModalOpen) {
        setIsModalOpen(false);
      }
      return;
    }

    // Close the modal immediately
    if (setIsModalOpen) {
      setIsModalOpen(false);
    } else if (onCancel) {
      onCancel();
    }
    
    // Notify parent component with updated user data
    // handleProfileUpdate will update the cache directly, so we don't need to invalidate
    if (onSuccess) {
      onSuccess(updatedUser);
    }
  },

  onError: (error) => {
    console.error("Error updating profile:", error);
  }
});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfileMutation.mutateAsync(formData);
      // The mutation's onSuccess will handle closing the modal
      // But if for some reason it doesn't, we'll close it here as a fallback
      console.log('Update successful, response:', response);
    } catch (error) {
      console.error('Error updating profile:', error);
      // Don't close modal on error - let user see the error
    }
  };


  return (
    <div className="bg-white rounded-sm h-shadow-sm border border-rounded p-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
        <button
          onClick={onCancel}  // Use onCancel prop instead of setIsModalOpen
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          type="button"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Name Field */}
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (cannot be changed)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>
          </div>
          {/* Phone Field */}
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Address Field */}
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-6 flex-shrink-0" />
            <div className="flex-1">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Date of Birth Field */}
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex">
          {/* <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button> */}
          <button
            type="submit"
            // onClick={()=> setIsModalOpen(false)}   //closed on onsuccess in mutation
            disabled={updateProfileMutation.isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateProfileMutation.isLoading ? 'Saving...' 
            
            
            : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;