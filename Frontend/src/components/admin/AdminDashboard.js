import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboard();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-5">
        <div className="text-center py-10 text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-5">
        <div className="text-center py-10 text-red-600 bg-red-100 border border-red-300 rounded-lg">
          {error}
          <button 
            onClick={fetchDashboardData} 
            className="block mx-auto mt-4 px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-5">
      <div className="mb-8">
        <h1 className="text-gray-800 text-3xl font-semibold m-0 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 text-base m-0">System overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-5 hover:shadow-lg transition-shadow">
          <div className="text-4xl w-15 h-15 flex items-center justify-center rounded-full bg-blue-100">👥</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-gray-600 text-base font-medium">Total Users</h3>
            <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData?.users?.total || 0}</div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-600">Admins: {dashboardData?.users?.byRole?.admin || 0}</span>
              <span className="text-xs text-gray-600">Users: {dashboardData?.users?.byRole?.user || 0}</span>
              <span className="text-xs text-gray-600">Store Owners: {dashboardData?.users?.byRole?.store_owner || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-5 hover:shadow-lg transition-shadow">
          <div className="text-4xl w-15 h-15 flex items-center justify-center rounded-full bg-purple-100">🏪</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-gray-600 text-base font-medium">Total Stores</h3>
            <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData?.stores?.total || 0}</div>
            <div className="text-sm text-gray-600">
              Registered stores on the platform
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-5 hover:shadow-lg transition-shadow">
          <div className="text-4xl w-15 h-15 flex items-center justify-center rounded-full bg-orange-100">⭐</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-gray-600 text-base font-medium">Total Ratings</h3>
            <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData?.ratings?.total || 0}</div>
            <div className="text-sm text-gray-600">
              Recent (30 days): {dashboardData?.ratings?.recent || 0}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-5 hover:shadow-lg transition-shadow">
          <div className="text-4xl w-15 h-15 flex items-center justify-center rounded-full bg-green-100">📈</div>
          <div className="flex-1">
            <h3 className="m-0 mb-2 text-gray-600 text-base font-medium">Recent Signups</h3>
            <div className="text-3xl font-bold text-gray-800 mb-1">{dashboardData?.users?.recentSignups || 0}</div>
            <div className="text-sm text-gray-600">
              New users in the last 30 days
            </div>
          </div>
        </div>
      </div>

      {dashboardData?.topStores && dashboardData.topStores.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h2 className="m-0 mb-5 text-gray-800 text-xl font-semibold">Top Rated Stores</h2>
          <div className="space-y-4">
            {dashboardData.topStores.map((store, index) => (
              <div key={store.id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <div className="text-lg font-bold text-blue-600 min-w-8">#{index + 1}</div>
                <div className="flex-1">
                  <h4 className="m-0 mb-1 text-gray-800 text-base font-medium">{store.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-orange-500">
                      {parseFloat(store.average_rating).toFixed(1)} ⭐
                    </span>
                    <span className="text-sm text-gray-600">
                      ({store.total_ratings} ratings)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <button 
          onClick={fetchDashboardData} 
          className={`px-6 py-3 text-white border-none rounded text-base cursor-pointer transition-colors ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;