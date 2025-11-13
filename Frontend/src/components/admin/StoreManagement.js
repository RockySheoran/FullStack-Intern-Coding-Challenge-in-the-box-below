import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    address: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
console.log(stores)
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewStoreChange = (e) => {
    const { name, value } = e.target;
    setNewStore(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!newStore.name || newStore.name.length > 255) {
      errors.name = 'Store name is required and must not exceed 255 characters';
    }
    
    if (!newStore.email || !/\S+@\S+\.\S+/.test(newStore.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newStore.address || newStore.address.length > 400) {
      errors.address = 'Address is required and must not exceed 400 characters';
    }
    
    return errors;
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await apiService.createStore(newStore);
      if (response.success) {
        setStores(prev => [response.data.store, ...prev]);
        setNewStore({ name: '', email: '', address: '' });
        setShowAddForm(false);
        setFormErrors({});
      } else {
        setFormErrors({ general: response.message || 'Failed to create store' });
      }
    } catch (error) {
      setFormErrors({ general: error.message || 'Failed to create store' });
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        const response = await apiService.deleteStore(storeId);
        if (response.success) {
          setStores(prev => prev.filter(store => store.id !== storeId));
        } else {
          setError(response.message || 'Failed to delete store');
        }
      } catch (error) {
        setError(error.message || 'Failed to delete store');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      address: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };

  const getRatingDisplay = (rating, totalRatings) => {
    if (totalRatings === 0) {
      return <span className="text-gray-400">No ratings</span>;
    }
    return (
      <div className="flex items-center">
        <span className="text-yellow-500 mr-1">⭐</span>
        <span className="font-medium">{parseFloat(rating).toFixed(1)}</span>
        <span className="text-gray-500 ml-1">({totalRatings})</span>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Store Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Add New Store
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Filter by store name"
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
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at">Created Date</option>
            <option value="name">Name</option>
            <option value="average_rating">Rating</option>
            <option value="total_ratings">Total Ratings</option>
          </select>
          <button
            onClick={clearFilters}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div key={store.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{store.name}</h3>
              <button
                onClick={() => handleDeleteStore(store.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {store.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Address:</span> {store.address}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Created:</span> {new Date(store.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                {getRatingDisplay(store.average_rating, store.total_ratings)}
              </div>
              {store.owner_name && (
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Owner</p>
                  <p className="text-sm font-medium text-gray-800">{store.owner_name}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No stores found matching your criteria.
        </div>
      )}

      {/* Add Store Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Store</h3>
            
            {formErrors.general && (
              <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded mb-4">
                {formErrors.general}
              </div>
            )}

            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                <input
                  type="text"
                  name="name"
                  value={newStore.name}
                  onChange={handleNewStoreChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter store name"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newStore.email}
                  onChange={handleNewStoreChange}
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter store email"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={newStore.address}
                  onChange={handleNewStoreChange}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter store address"
                />
                {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStore({ name: '', email: '', address: '' });
                    setFormErrors({});
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;