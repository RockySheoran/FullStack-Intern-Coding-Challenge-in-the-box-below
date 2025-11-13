import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StoreRatings from './StoreRatings';
import OwnerProfile from './OwnerProfile';
import axios from 'axios';

const StoreOwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [ratingsData, setRatingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.store_id) {
      fetchStoreData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchStoreData = async () => {
    try {
      const [storeResponse, ratingsResponse] = await Promise.all([
        axios.get(`/api/stores/${user.store_id}`),
        axios.get(`/api/ratings/store/${user.store_id}`)
      ]);
      
      setStoreData(storeResponse.data.data.store);
      setRatingsData(ratingsResponse.data.data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (!user?.store_id || !storeData) {
    return <CreateStoreForm onStoreCreated={fetchStoreData} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold">{storeData.name}</h2>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                ⭐ {storeData.average_rating || '0.0'}
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <Link 
                to="/store-owner" 
                className="hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md transition duration-200"
              >
                Dashboard
              </Link>
              <Link 
                to="/store-owner/ratings" 
                className="hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md transition duration-200"
              >
                Ratings
              </Link>
              <Link 
                to="/store-owner/profile" 
                className="hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-md transition duration-200"
              >
                Profile
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block">Welcome, {user?.name}</span>
              <button 
                onClick={handleLogout}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-md transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<DashboardHome store={storeData} ratings={ratingsData} />} />
          <Route path="/ratings" element={<StoreRatings store={storeData} />} />
          <Route path="/profile" element={<OwnerProfile />} />
        </Routes>
      </main>
    </div>
  );
};

// Create Store Form Component
const CreateStoreForm = ({ onStoreCreated, onLogout }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/stores', formData);
      // Refresh user data to get the new store_id
      window.location.reload(); // Simple way to refresh user context
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Create Your Store</h2>
        <p className="text-gray-600 text-center mb-6">Welcome! Let's set up your store to get started.</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your store name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Store Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter store contact email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Store Address *
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter complete store address"
              maxLength="400"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              {loading ? 'Creating Store...' : 'Create Store'}
            </button>
            <button 
              type="button" 
              onClick={onLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ store, ratings }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-yellow-400">⭐</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-400">⭐</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">⭐</span>);
      }
    }
    return stars;
  };

  const getRatingDistribution = () => {
    if (!ratings?.stats?.rating_distribution) return null;
    
    const distribution = ratings.stats.rating_distribution;
    const total = ratings.stats.total_ratings;
    
    return Object.keys(distribution)
      .sort((a, b) => b - a)
      .map(rating => ({
        rating: parseInt(rating),
        count: distribution[rating],
        percentage: total > 0 ? (distribution[rating] / total * 100).toFixed(1) : 0
      }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Store Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Rating Card */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">
            {store.average_rating || '0.0'}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(store.average_rating || 0)}
          </div>
          <div className="text-gray-600">
            Based on {store.total_ratings || 0} reviews
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Reviews</h3>
              <p className="text-2xl font-bold text-purple-600">{store.total_ratings || 0}</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              <p className="text-2xl font-bold text-purple-600">
                {ratings?.ratings?.filter(r => {
                  const ratingDate = new Date(r.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return ratingDate > weekAgo;
                }).length || 0}
              </p>
              <p className="text-sm text-gray-500">This week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      {getRatingDistribution() && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Rating Breakdown</h2>
          <div className="space-y-3">
            {getRatingDistribution().map(item => (
              <div key={item.rating} className="flex items-center">
                <div className="w-12 text-sm font-medium text-gray-700">
                  {item.rating} ⭐
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-600 text-right">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Reviews</h2>
        {ratings?.ratings?.length > 0 ? (
          <div className="space-y-4">
            {ratings.ratings.slice(0, 5).map(rating => (
              <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800">{rating.user_name}</div>
                    <div className="flex items-center mt-1">
                      {renderStars(rating.rating)}
                      <span className="ml-2 text-sm text-gray-600">{rating.rating}/5</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(rating.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">⭐</div>
            <p className="text-lg font-medium mb-2">No reviews yet</p>
            <p>Encourage your customers to leave reviews!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;