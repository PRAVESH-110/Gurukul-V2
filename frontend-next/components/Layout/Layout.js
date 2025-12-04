'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';

import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [sidebarWidth, setSidebarWidth] = React.useState(256);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <Toaster position="top-center" width={400} reverseOrder={false} />
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex">
        {user && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            width={sidebarWidth}
            setWidth={setSidebarWidth}
          />
        )}
        <main
          className={`flex-1 min-w-0 transition-all duration-300`}
          style={{
            marginLeft: user && isSidebarOpen && !isMobile ? `${sidebarWidth}px` : '0'
          }}
        >
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

