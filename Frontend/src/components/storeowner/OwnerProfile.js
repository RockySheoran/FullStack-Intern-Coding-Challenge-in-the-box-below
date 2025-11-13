import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const OwnerProfile = () => {
  const { user, updatePassword } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
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

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      // Password validation: 8-16 characters, at least one uppercase letter and one special character
      if (passwordData.newPassword.length < 8 || passwordData.newPassword.length > 16) {
        newErrors.newPassword = 'Password must be between 8 and 16 characters';
      } else if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one uppercase letter';
      } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one special character';
      }
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } catch (error) {
      setErrors({
        general: error.response?.data?.message || 'Failed to update password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPasswordForm = () => {
    setShowPasswordForm(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccess('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Profile Settings</h1>
      
      {/* User Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Name</label>
            <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-md">{user?.name}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Email</label>
            <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-md">{user?.email}</div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-600">Address</label>
            <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-md">{user?.address}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Role</label>
            <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-md">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Store Owner
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Account Created</label>
            <div className="text-lg text-gray-800 bg-gray-50 p-3 rounded-md">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Security Settings</h2>
        
        {!showPasswordForm ? (
          <div className="space-y-4">
            <p className="text-gray-600">Keep your account secure by updating your password regularly.</p>
            <button 
              onClick={() => setShowPasswordForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Update Password
            </button>
          </div>
        ) : (
          <div className="max-w-md">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Update Password</h3>
              
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {errors.general}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password *
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.currentPassword && (
                  <span className="text-sm text-red-600">{errors.currentPassword}</span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                <small className="text-sm text-gray-500">
                  8-16 characters, at least one uppercase letter and one special character
                </small>
                {errors.newPassword && (
                  <span className="text-sm text-red-600">{errors.newPassword}</span>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <span className="text-sm text-red-600">{errors.confirmPassword}</span>
                )}
              </div>

              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancelPasswordForm}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Account Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Account Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div className="text-3xl">🏪</div>
            <div>
              <div className="text-sm font-medium text-gray-600">Store Status</div>
              <div className="text-lg font-semibold text-gray-800">
                {user?.store_id ? (
                  <span className="text-green-600">Active</span>
                ) : (
                  <span className="text-orange-600">No Store</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="text-3xl">📅</div>
            <div>
              <div className="text-sm font-medium text-gray-600">Member Since</div>
              <div className="text-lg font-semibold text-gray-800">
                {user?.created_at ? new Date(user.created_at).getFullYear() : 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="text-3xl">🔐</div>
            <div>
              <div className="text-sm font-medium text-gray-600">Account Type</div>
              <div className="text-lg font-semibold text-gray-800">Store Owner</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfile;