import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStoreOwnerSummary();
      if (response.success) {
        setStoreData(response.data);
      } else {
        setError(response.message || 'Failed to fetch store data');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch store data');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8 || passwordData.newPassword.length > 16) {
      errors.newPassword = 'Password must be between 8 and 16 characters';
    } else if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(passwordData.newPassword)) {
      errors.newPassword = 'Password must contain at least one special character';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await apiService.updatePassword(
        passwordData.currentPassword, 
        passwordData.newPassword
      );
      
      if (response.success) {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordErrors({ general: response.message || 'Failed to update password' });
      }
    } catch (error) {
      setPasswordErrors({ general: error.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-500">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-500">☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    
    return stars;
  };

  const getRatingDistribution = () => {
    if (!storeData?.stats?.distribution) return null;
    
    const distribution = storeData.stats.distribution;
    const total = storeData.stats.total_ratings;
    
    return [5, 4, 3, 2, 1].map(star => ({
      star,
      count: distribution[star] || 0,
      percentage: total > 0 ? ((distribution[star] || 0) / total * 100).toFixed(1) : 0
    }));
  };

  if (loading) {
    return (
      <div className="p-5">
        <div className="text-center py-10 text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5">
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Store Owner Dashboard</h1>
        <button
          onClick={() => setShowPasswordForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Change Password
        </button>
      </div>

      {passwordSuccess && (
        <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded mb-4">
          {passwordSuccess}
        </div>
      )}

      {/* Store Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Rating Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Rating Overview</h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">
              {storeData?.stats?.average_rating ? parseFloat(storeData.stats.average_rating).toFixed(1) : '0.0'}
            </div>
            <div className="flex justify-center mb-2">
              {getRatingStars(storeData?.stats?.average_rating || 0)}
            </div>
            <div className="text-gray-600">
              {storeData?.stats?.total_ratings || 0} total ratings
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Reviews:</span>
              <span className="font-medium">{storeData?.stats?.total_ratings || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Highest Rating:</span>
              <span className="font-medium">{storeData?.stats?.max_rating || 0}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lowest Rating:</span>
              <span className="font-medium">{storeData?.stats?.min_rating || 0}/5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recent Reviews:</span>
              <span className="font-medium">
                {storeData?.ratings?.filter(r => 
                  new Date(r.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
          {ratingDistribution ? (
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center">
                  <span className="w-8 text-sm">{star}★</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-600">{count} ({percentage}%)</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No ratings yet</div>
          )}
        </div>
      </div>

      {/* Recent Ratings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Customer Ratings</h2>
        </div>
        
        {storeData?.ratings && storeData.ratings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {storeData.ratings.slice(0, 10).map((rating) => (
              <div key={rating.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{rating.user_name}</h4>
                    <p className="text-sm text-gray-600">{rating.user_email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {getRatingStars(rating.rating)}
                      <span className="ml-2 text-sm text-gray-600">{rating.rating}/5</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(rating.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {rating.updated_at !== rating.created_at && (
                  <p className="text-xs text-gray-500">
                    Updated: {new Date(rating.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-medium mb-2">No Ratings Yet</h3>
            <p>Your store hasn't received any ratings yet. Encourage customers to rate your store!</p>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            
            {passwordErrors.general && (
              <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded mb-4">
                {passwordErrors.general}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={passwordLoading}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={passwordLoading}
                />
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                )}
                <small className="text-xs text-gray-500">
                  8-16 characters, must include uppercase letter and special character
                </small>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={passwordLoading}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordErrors({});
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;