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
      <div className="flex fit-content ">
        {user && <Sidebar />}
        <main className={`flex-1 ${user ? 'ml-64' : ''} transition-all duration-300 overflow-x-hidden`}>
          <div className="p-4 sm:p-6 w-full max-w-full box-border">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
