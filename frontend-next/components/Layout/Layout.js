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
      <Toaster
        position="bottom-right"
        gutter={12}
        reverseOrder={false}
        toastOptions={{
          style: {
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            minHeight: '76px',
            padding: '18px 22px',
            borderRadius: '14px',
            fontSize: '15px',
            lineHeight: 1.5,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.16)',
          },
          success: {
            iconTheme: { primary: '#2563eb', secondary: '#eff6ff' },
            style: {
              border: '1px solid #bfdbfe',
              borderLeft: '5px solid #2563eb',
            },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
            style: {
              border: '1px solid #fecaca',
              borderLeft: '5px solid #dc2626',
            },
          },
        }}
      />
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
