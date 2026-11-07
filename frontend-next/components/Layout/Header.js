'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Search, Bell, User, LogOut, Settings, BookOpen, Menu } from 'lucide-react';
import logo from '@/assets/logo.png';
import Image from 'next/image';
import { io } from 'socket.io-client';
import api from '@/services/api';
import toast from 'react-hot-toast';
import NotificationModal from '../Notifications/Notificationdropdown';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Scroll listener: hides on scroll downward, reappears on scroll up / top
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 15) {
        setIsAtTop(true);
        setIsVisible(true);
      } else {
        setIsAtTop(false);
        if (currentScrollY < lastScrollY.current) {
          // Scrolling upwards
          setIsVisible(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 70) {
          // Scrolling downwards past header height
          setIsVisible(false);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user) return;

    let unreadCountRequestId = 0;
    const refreshUnreadCount = async () => {
      const requestId = ++unreadCountRequestId;
      try {
        const res = await api.get('/notifications/unread-count');
        if (requestId === unreadCountRequestId && res.data?.success) {
          setUnreadCount(res.data.count);
        }
      } catch (err) {
        console.error('Failed to fetch unread notifications', err);
      }
    };
    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
    const socket = io(socketUrl, {
      withCredentials: true,
      auth: token ? { token } : {},
    });

    socket.on('connect', refreshUnreadCount);
    socket.on('new_notification', (notification) => {
      console.log('🔴 Real-time Notification received:', notification);
      refreshUnreadCount();

      // Trigger a beautiful visual popup toast
      toast(notification.content, {
        icon: '🔔',
        duration: 4000,
      });
    });

    // Cleanup: Disconnect when the user logs out or leaves the site
    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  //outside click for user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  //outside click for notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 transform ${
        isVisible || isSidebarOpen
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isHomePage
          ? isSidebarOpen
            ? 'bg-black/60 backdrop-blur-md border-b border-white/10 shadow-sm'
            : isAtTop
              ? 'bg-transparent border-transparent'
              : 'bg-black/40 backdrop-blur-md border-b border-white/10 shadow-sm'
          : isSidebarOpen
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
            : isAtTop
              ? 'bg-transparent border-transparent'
              : 'bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            {user && (
              <button
                onClick={toggleSidebar}
                className={`mr-4 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isHomePage ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link href="/" className="flex items-center space-x-3 group">
              {/* <img src={logo} alt="Gurukul Logo" className="w-10 h-10 rounded-full shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200" /> */}
              <Image
                src={logo}
                alt="Gurukul Logo"
                width={36}
                height={36}
                className="w-10 h-10 rounded-full shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200"
              />
              <span
                className={`text-2xl font-bold tracking-tight ${isHomePage ? 'text-white drop-shadow-md' : 'bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700'}`}
              >
                Gurukul
              </span>
            </Link>
          </div>

          {/* Navigation and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!user ? (
              // Guest Navigation
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/courses"
                  className={`hidden sm:block px-3 py-2 text-sm font-medium transition-colors rounded-3xl ${
                    isHomePage
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  Courses
                </Link>
                <Link
                  href="/communities"
                  className={`hidden sm:block px-3 py-2 text-sm font-medium transition-colors rounded-3xl ${
                    isHomePage
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  Communities
                </Link>
                <div
                  className={`h-5 w-px hidden sm:block mx-1 ${
                    isHomePage ? 'bg-white/25' : 'bg-gray-200'
                  }`}
                ></div>
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isHomePage
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 inline-flex items-center justify-center"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              // Authenticated User Navigation
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false); // Close user menu if open
                    }}
                    className={`p-2.5 rounded-xl transition-all duration-200 relative group ${isHomePage ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'}`}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white text-[10px] font-bold text-white group-hover:scale-110 transition-transform shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationModal
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    unreadCount={unreadCount}
                    setUnreadCount={setUnreadCount}
                  />
                </div>

                {/* User Menu */}
                <div className="relative ml-2" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false); // Close notifications if open
                    }}
                    className={`flex items-center space-x-3 p-1.5 pr-3 rounded-xl transition-all duration-200 ${isHomePage ? 'text-white hover:bg-white/10' : 'hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.firstName}
                        width={36}
                        height={36}
                        className="rounded-lg object-cover shadow-sm ring-2 ring-white"
                      />
                    ) : (
                      <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm ring-2 ring-white text-white font-medium">
                        {user.firstName[0]}
                      </div>
                    )}
                    <span
                      className={`hidden md:block text-sm font-medium ${isHomePage ? 'text-white drop-shadow' : 'text-gray-700'}`}
                    >
                      {user.firstName}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in origin-top-right">
                      <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50 rounded-t-2xl">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 capitalize border border-primary-100">
                          {user.role}
                        </div>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BookOpen className="h-4 w-4 mr-3 text-gray-400" />
                          Dashboard
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 mr-3 text-gray-400" />
                          Profile
                        </Link>

                        <Link
                          href="/settings"
                          className="flex items-center px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 rounded-xl transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4 mr-3 text-gray-400" />
                          Settings
                        </Link>
                      </div>

                      <div className="p-2 border-t border-gray-50">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
      </div>

      {/* Click outside to close menus */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => {
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
