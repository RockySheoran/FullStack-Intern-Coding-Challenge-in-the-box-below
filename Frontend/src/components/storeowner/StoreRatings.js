import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StoreRatings = ({ store }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    minRating: '',
    maxRating: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user?.store_id) {
      fetchRatings();
    }
  }, [user, filters]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.maxRating) params.append('maxRating', filters.maxRating);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

      const response = await axios.get(`/api/ratings/store/${user.store_id}?${params}`);
      setRatings(response.data.data.ratings || []);
    } catch (error) {
      setError('Failed to fetch ratings');
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      minRating: '',
      maxRating: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}
        >
          ⭐
        </span>
      );
    }
    return stars;
  };

  const getRatingStats = () => {
    if (ratings.length === 0) return null;

    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    const distribution = {};
    
    for (let i = 1; i <= 5; i++) {
      distribution[i] = ratings.filter(r => r.rating === i).length;
    }

    return { totalRatings, averageRating, distribution };
  };

  const stats = getRatingStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Loading ratings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Store Ratings</h1>
        <div className="text-sm text-gray-600">
          {store?.name} - {ratings.length} total ratings
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Rating Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rating Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Stats */}
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <div className="text-gray-600">
                Average from {stats.totalRatings} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center">
                  <span className="w-8 text-sm">{star}⭐</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${stats.totalRatings > 0 ? (stats.distribution[star] / stats.totalRatings * 100) : 0}%` 
                      }}
                    />
                  </div>
                  <span className="w-12 text-sm text-gray-600">
                    {stats.distribution[star]} ({stats.totalRatings > 0 ? ((stats.distribution[star] / stats.totalRatings) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Rating
            </label>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Any</option>
              <option value="1">1⭐</option>
              <option value="2">2⭐</option>
              <option value="3">3⭐</option>
              <option value="4">4⭐</option>
              <option value="5">5⭐</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Rating
            </label>
            <select
              name="maxRating"
              value={filters.maxRating}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Any</option>
              <option value="1">1⭐</option>
              <option value="2">2⭐</option>
              <option value="3">3⭐</option>
              <option value="4">4⭐</option>
              <option value="5">5⭐</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="created_at">Date</option>
              <option value="rating">Rating</option>
              <option value="user_name">Customer Name</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              name="sortOrder"
              value={filters.sortOrder}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Ratings List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Customer Reviews</h3>
        </div>
        
        {ratings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {ratings.map((rating) => (
              <div key={rating.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800">{rating.user_name}</h4>
                    <p className="text-sm text-gray-600">{rating.user_email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {renderStars(rating.rating)}
                      <span className="ml-2 text-sm text-gray-600">{rating.rating}/5</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(rating.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                
                {rating.updated_at !== rating.created_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Updated: {new Date(rating.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}

                {/* Rating Badge */}
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    rating.rating >= 4 
                      ? 'bg-green-100 text-green-800' 
                      : rating.rating >= 3 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {rating.rating >= 4 ? 'Positive' : rating.rating >= 3 ? 'Neutral' : 'Negative'} Review
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-lg font-medium mb-2">No Ratings Found</h3>
            <p>
              {Object.values(filters).some(f => f !== '' && f !== 'created_at' && f !== 'desc') 
                ? 'Try adjusting your filters to see more ratings.' 
                : 'Your store hasn\'t received any ratings yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreRatings;