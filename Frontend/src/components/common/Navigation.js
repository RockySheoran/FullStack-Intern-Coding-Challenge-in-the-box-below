import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-5 h-16">
        <div className="nav-brand">
          <Link to="/" className="text-white no-underline text-xl font-bold hover:text-blue-400 transition-colors">
            Store Rating System
          </Link>
        </div>

        <div className="flex gap-5 items-center">
          {hasRole('admin') && (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
                  isActive('/admin/dashboard') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/users" 
                className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
                  isActive('/admin/users') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
                }`}
              >
                Users
              </Link>
              <Link 
                to="/admin/stores" 
                className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
                  isActive('/admin/stores') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
                }`}
              >
                Stores
              </Link>
            </>
          )}

          {hasRole('user') && (
            <>
              <Link 
                to="/stores" 
                className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
                  isActive('/stores') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
                }`}
              >
                Stores
              </Link>
              <Link 
                to="/my-ratings" 
                className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
                  isActive('/my-ratings') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
                }`}
              >
                My Ratings
              </Link>
            </>
          )}

          {hasRole('store_owner') && (
            <>
              <Link 
                to="/owner/dashboard" 
                className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
                  isActive('/owner/dashboard') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/owner/ratings" 
                className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
                  isActive('/owner/ratings') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
                }`}
              >
                Store Ratings
              </Link>
            </>
          )}

          <Link 
            to="/profile" 
            className={`text-gray-300 no-underline px-3 py-2 rounded transition-colors ${
              isActive('/profile') ? 'text-white bg-gray-600' : 'hover:text-white hover:bg-gray-600'
            }`}
          >
            Profile
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm">
            {user?.name} ({user?.role})
          </span>
          <button 
            onClick={handleLogout} 
            className="bg-red-600 text-white border-none px-4 py-2 rounded text-sm cursor-pointer hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;