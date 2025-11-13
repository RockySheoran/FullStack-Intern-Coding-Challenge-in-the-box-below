import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 20) {
      newErrors.name = 'Name must be at least 20 characters long';
    } else if (formData.name.length > 60) {
      newErrors.name = 'Name must not exceed 60 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      newErrors.password = 'Password must be between 8 and 16 characters';
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters';
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
      const { confirmPassword, ...registrationData } = formData;
      const response = await apiService.register(registrationData);
      
      if (response.success) {
        login(response.data.user, response.data.token);
      } else {
        setErrors({ general: response.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-center mb-8 text-gray-800 text-2xl font-semibold">Register for Store Rating System</h2>
        
        {errors.general && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-3 py-2 rounded mb-5">
            {errors.general}
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="name" className="block mb-1 font-medium text-gray-600">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter your full name (20-60 characters)"
            disabled={loading}
          />
          {errors.name && <span className="text-red-500 text-sm mt-1 block">{errors.name}</span>}
          <small className="text-xs text-gray-500 mt-1 block">
            {formData.name.length}/60 characters (minimum 20 required)
          </small>
        </div>

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
          <small className="text-xs text-gray-500 mt-1 block">
            8-16 characters, must include uppercase letter and special character
          </small>
        </div>

        <div className="mb-5">
          <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-600">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Confirm your password"
            disabled={loading}
          />
          {errors.confirmPassword && <span className="text-red-500 text-sm mt-1 block">{errors.confirmPassword}</span>}
        </div>

        <div className="mb-5">
          <label htmlFor="address" className="block mb-1 font-medium text-gray-600">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder="Enter your address"
            rows="3"
            disabled={loading}
          />
          {errors.address && <span className="text-red-500 text-sm mt-1 block">{errors.address}</span>}
          <small className="text-xs text-gray-500 mt-1 block">
            {formData.address.length}/400 characters
          </small>
        </div>

        <button 
          type="submit" 
          className={`w-full py-3 text-white border-none rounded text-base font-medium cursor-pointer transition-colors ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>

        <div className="text-center mt-5">
          <p className="text-gray-600 m-0">
            Already have an account?{' '}
            <button 
              type="button" 
              className={`bg-none border-none text-blue-600 cursor-pointer underline ${
                loading ? 'text-gray-500 cursor-not-allowed' : 'hover:text-blue-700'
              }`}
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Login here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;