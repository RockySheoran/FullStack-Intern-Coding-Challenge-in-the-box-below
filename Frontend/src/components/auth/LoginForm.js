import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await apiService.login(formData.email, formData.password);
      
      if (response.success) {
        login(response.data.user, response.data.token);
      } else {
        setErrors({ general: response.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-center mb-8 text-gray-800 text-2xl font-semibold">Login to Store Rating System</h2>
        
        {errors.general && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded mb-5">
            {errors.general}
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="email" className="block mb-1 font-medium text-gray-600">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter your email address"
            disabled={loading}
          />
          {errors.email && <span className="text-red-500 text-sm mt-1 block">{errors.email}</span>}
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-1 font-medium text-gray-600">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter your password"
            disabled={loading}
          />
          {errors.password && <span className="text-red-500 text-sm mt-1 block">{errors.password}</span>}
        </div>

        <button 
          type="submit" 
          className={`w-full py-3 text-white border-none rounded text-base font-medium cursor-pointer transition-colors ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <div className="text-center mt-5">
          <p className="text-gray-600 m-0">
            Don't have an account?{' '}
            <button 
              type="button" 
              className={`bg-none border-none text-blue-600 cursor-pointer underline ${
                loading ? 'text-gray-500 cursor-not-allowed' : 'hover:text-blue-700'
              }`}
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Register here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;