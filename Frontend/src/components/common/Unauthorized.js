import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
  const { hasRole } = useAuth();

  const getHomeLink = () => {
    if (hasRole('admin')) return '/admin/dashboard';
    if (hasRole('user')) return '/stores';
    if (hasRole('store_owner')) return '/owner/dashboard';
    return '/auth';
  };

  return (
    <div className="text-center py-12 max-w-2xl mx-auto px-5">
      <h1 className="text-red-600 mb-5 text-3xl font-semibold">
        Access Denied
      </h1>
      <p className="text-lg mb-8 text-gray-600">
        You don't have permission to access this page.
      </p>
      <Link 
        to={getHomeLink()} 
        className="inline-block px-6 py-3 bg-blue-600 text-white no-underline rounded text-base hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;