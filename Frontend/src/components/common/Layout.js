import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from './Navigation';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated() && <Navigation />}
      <main className="flex-1 p-5 bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;