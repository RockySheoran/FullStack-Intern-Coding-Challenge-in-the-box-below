import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const MyRatings = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [newRatingValue, setNewRatingValue] = useState(5);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchMyRatings();
  }, []);

  const fetchMyRatings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyRatings();
      if (response.success) {
        setRatings(response.data.ratings);
      } else {
        setError(response.message || 'Failed to fetch ratings');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (rating) => {
    setSelectedRating(rating);
    setNewRatingValue(rating.rating);
    setShowEditModal(true);
  };

  const updateRating = async () => {
    if (!selectedRating) return;

    try {
      setUpdateLoading(true);
      const response = await apiService.updateRating(selectedRating.id, newRatingValue);
      
      if (response.success) {
        setRatings(prev => prev.map(rating => 
          rating.id === selectedRating.id 
            ? { ...rating, rating: newRatingValue, updated_at: new Date().toISOString() }
            : rating
        ));
        setShowEditModal(false);
        setSelectedRating(null);
      } else {
        setError(response.message || 'Failed to update rating');
      }
    } catch (error) {
      setError(error.message || 'Failed to update rating');
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      const response = await apiService.deleteRating(ratingId);
      
      if (response.success) {
        setRatings(prev => prev.filter(rating => rating.id !== ratingId));
      } else {
        setError(response.message || 'Failed to delete rating');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete rating');
    }
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`text-lg ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingInput = (value, onChange) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl ${star <= value ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="p-5">
        <div className="text-center py-10 text-lg text-gray-600">Loading your ratings...</div>
      </div>
    );
  }

  const distribution = getRatingDistribution();

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">My Ratings</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Rating Summary */}
        {ratings.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Rating Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{ratings.length}</div>
                <div className="text-gray-600">Total Ratings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">{getAverageRating()}</div>
                <div className="text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {ratings.filter(r => r.rating >= 4).length}
                </div>
                <div className="text-gray-600">4+ Star Ratings</div>
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Rating Distribution</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(star => (
                  <div key={star} className="flex items-center">
                    <span className="w-8 text-sm">{star}★</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ 
                          width: ratings.length > 0 ? `${(distribution[star] / ratings.length) * 100}%` : '0%' 
                        }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-600">{distribution[star]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ratings List */}
      {ratings.length > 0 ? (
        <div className="space-y-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {rating.store_name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{rating.store_address}</p>
                  <div className="flex items-center mb-2">
                    {getRatingStars(rating.rating)}
                    <span className="ml-2 text-sm text-gray-600">
                      {rating.rating}/5 stars
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(rating)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRating(rating.id)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Rated on: {new Date(rating.created_at).toLocaleDateString()}
                </span>
                {rating.updated_at !== rating.created_at && (
                  <span>
                    Updated: {new Date(rating.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {rating.store_average_rating && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <span>Store Average: </span>
                    <div className="flex items-center ml-2">
                      {getRatingStars(Math.round(rating.store_average_rating))}
                      <span className="ml-1">
                        {parseFloat(rating.store_average_rating).toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Ratings Yet</h3>
          <p className="text-gray-500 mb-6">
            You haven't rated any stores yet. Start exploring and rating stores to see them here!
          </p>
          <button
            onClick={() => window.location.href = '/stores'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Stores
          </button>
        </div>
      )}

      {/* Edit Rating Modal */}
      {showEditModal && selectedRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Update Rating</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800">{selectedRating.store_name}</h4>
              <p className="text-sm text-gray-600">{selectedRating.store_address}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              {getRatingInput(newRatingValue, setNewRatingValue)}
              <p className="text-sm text-gray-500 mt-2">
                {newRatingValue} out of 5 stars
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRating(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={updateLoading}
              >
                Cancel
              </button>
              <button
                onClick={updateRating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRatings;