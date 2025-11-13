import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8 || formData.newPassword.length > 16) {
      newErrors.newPassword = 'Password must be between 8 and 16 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      await apiService.updatePassword(formData.currentPassword, formData.newPassword);
      setSuccess('Password updated successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setErrors({ general: error.message || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="mb-8">
        <h1 className="text-gray-800 text-3xl font-semibold m-0">Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="mt-0 mb-5 text-gray-800 text-xl font-semibold">User Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
              <label className="font-medium text-gray-600">Name:</label>
              <span className="sm:col-span-2 text-gray-800">{user?.name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
              <label className="font-medium text-gray-600">Email:</label>
              <span className="sm:col-span-2 text-gray-800">{user?.email}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
              <label className="font-medium text-gray-600">Role:</label>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium uppercase ${
                user?.role === 'admin' ? 'bg-red-500 text-white' :
                user?.role === 'user' ? 'bg-green-500 text-white' :
                user?.role === 'store_owner' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
              }`}>
                {user?.role === 'store_owner' ? 'Store Owner' : 
                 user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
              <label className="font-medium text-gray-600">Address:</label>
              <span className="sm:col-span-2 text-gray-800">{user?.address}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="mt-0 mb-5 text-gray-800 text-xl font-semibold">Update Password</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded">
                {errors.general}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-300 text-green-800 px-3 py-2 rounded">
                {success}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="currentPassword" className="block font-medium text-gray-600">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={loading}
              />
              {errors.currentPassword && (
                <span className="text-red-500 text-sm">{errors.currentPassword}</span>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="newPassword" className="block font-medium text-gray-600">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={loading}
              />
              {errors.newPassword && (
                <span className="text-red-500 text-sm">{errors.newPassword}</span>
              )}
              <small className="text-xs text-gray-500">
                8-16 characters, must include uppercase letter and special character
              </small>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block font-medium text-gray-600">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm">{errors.confirmPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              className={`px-6 py-3 text-white border-none rounded text-base font-medium cursor-pointer transition-colors ${
                loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;