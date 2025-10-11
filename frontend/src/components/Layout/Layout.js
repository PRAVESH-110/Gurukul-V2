import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {user && <Sidebar />}
        <main className={`flex-1 ${user ? 'ml-64' : ''} transition-all duration-300`}>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
