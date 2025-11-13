import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const StoreList = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    address: '',
    minRating: '',
    hasUserRating: ''
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [filters]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStores(filters);
      if (response.success) {
        setStores(response.data.stores);
      } else {
        setError(response.message || 'Failed to fetch stores');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchStores();
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.getStores({ search: searchTerm });
      if (response.success) {
        setStores(response.data.stores);
      } else {
        setError(response.message || 'Failed to search stores');
      }
    } catch (error) {
      setError(error.message || 'Failed to search stores');
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
      name: '',
      address: '',
      minRating: '',
      hasUserRating: ''
    });
    setSearchTerm('');
  };

  const openRatingModal = (store) => {
    setSelectedStore(store);
    setNewRating(store.user_rating || 5);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedStore) return;

    try {
      setRatingLoading(true);
      let response;
      
      if (selectedStore.user_rating) {
        // Update existing rating
        response = await apiService.updateRating(selectedStore.rating_id, newRating);
      } else {
        // Submit new rating
        response = await apiService.submitRating(selectedStore.id, newRating);
      }

      if (response.success) {
        // Update the store in the list
        setStores(prev => prev.map(store => 
          store.id === selectedStore.id 
            ? { ...store, user_rating: newRating, rating_date: new Date().toISOString() }
            : store
        ));
        setShowRatingModal(false);
        setSelectedStore(null);
      } else {
        setError(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      setError(error.message || 'Failed to submit rating');
    } finally {
      setRatingLoading(false);
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

  if (loading) {
    return (
      <div className="p-5">
        <div className="text-center py-10 text-lg text-gray-600">Loading stores...</div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Browse Stores</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search stores by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Filter by name"
              value={filters.name}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="address"
              placeholder="Filter by address"
              value={filters.address}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{store.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{store.address}</p>
              <p className="text-gray-500 text-xs">{store.email}</p>
            </div>

            {/* Store Rating */}
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                <span className="text-sm text-gray-500">({store.total_ratings} reviews)</span>
              </div>
              <div className="flex items-center">
                {getRatingStars(store.average_rating || 0)}
                <span className="ml-2 text-sm text-gray-600">
                  {store.average_rating ? parseFloat(store.average_rating).toFixed(1) : 'No ratings'}
                </span>
              </div>
            </div>

            {/* User Rating */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Your Rating</span>
                {store.user_rating && (
                  <span className="text-xs text-gray-500">
                    Rated on {new Date(store.rating_date).toLocaleDateString()}
                  </span>
                )}
              </div>
              
              {store.user_rating ? (
                <div className="flex items-center">
                  {getRatingStars(store.user_rating)}
                  <span className="ml-2 text-sm text-gray-600">{store.user_rating}/5</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Not rated yet</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => openRatingModal(store)}
                className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                  store.user_rating
                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {store.user_rating ? 'Update Rating' : 'Rate Store'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No stores found matching your criteria.
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {selectedStore.user_rating ? 'Update Rating' : 'Rate Store'}
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-800">{selectedStore.name}</h4>
              <p className="text-sm text-gray-600">{selectedStore.address}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              {getRatingInput(newRating, setNewRating)}
              <p className="text-sm text-gray-500 mt-2">
                {newRating} out of 5 stars
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedStore(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                disabled={ratingLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={ratingLoading}
              >
                {ratingLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreList;