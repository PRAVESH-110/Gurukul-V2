'use client';

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [isMobile, setIsMobile] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [sidebarWidth, setSidebarWidth] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gurukul_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 200 && parsed <= 480) {
          return parsed;
        }
      }
    }
    return 256;
  });

  const handleSetSidebarWidth = (newWidth) => {
    setSidebarWidth(newWidth);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gurukul_sidebar_width', String(newWidth));
      } catch {
        // ignore localStorage errors
      }
    }
  };

  // Automatically close sidebar when navigation / pathname changes (onsuccess)
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-yellow-50/40 to-amber-50/60 font-sans">
      <Toaster position="top-center" width={400} reverseOrder={false} />
      <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <div className="flex">
        {user && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            width={sidebarWidth}
            setWidth={handleSetSidebarWidth}
          />
        )}
        <main
          className={`flex-1 min-w-0 transition-all duration-300 ${!isHomePage ? 'pt-16' : ''}`}
          style={{
            marginLeft: user && isSidebarOpen && !isMobile ? `${sidebarWidth}px` : '0',
          }}
        >
          <div
            className={`w-full ${
              isHomePage ? 'p-0 max-w-none' : 'p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto'
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
