import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import StoreList from './StoreList';
import UserProfile from './UserProfile';
import axios from 'axios';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-container">
      <nav className="user-nav">
        <div className="nav-brand">
          <h2>Store Rating</h2>
        </div>
        <div className="nav-links">
          <Link to="/user" className="nav-link">Stores</Link>
          <Link to="/user/profile" className="nav-link">Profile</Link>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="user-main">
        <Routes>
          <Route path="/" element={<StoreList />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserDashboard;