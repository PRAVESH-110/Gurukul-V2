'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import {
  X,
  BarChart3,
  BookOpen,
  Calendar,
  Home,
  PlusCircle,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Sidebar = ({ isOpen, onClose, width = 256, setWidth }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const isResizing = useRef(false);
  const sidebarRef = useRef(null);
  const isHomePage = pathname === '/';

  const startResizing = React.useCallback((e) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = React.useCallback(() => {
    isResizing.current = false;
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = React.useCallback(
    (e) => {
      if (isResizing.current && setWidth) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 480) {
          setWidth(newWidth);
        }
      }
    },
    [setWidth],
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const studentNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/my-courses', icon: BookOpen, label: 'My Courses' },
    { path: '/my-communities', icon: Users, label: 'My Communities' },
    { path: '/courses', icon: Search, label: 'Browse Courses' },
    { path: '/communities', icon: Users, label: 'Browse Communities' },
  ];

  const creatorNavItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/manage-courses', icon: BookOpen, label: 'My Courses' },
    { path: '/manage-communities', icon: Users, label: 'My Communities' },
    { path: '/create-course', icon: PlusCircle, label: 'Create Course' },
    { path: '/create-community', icon: PlusCircle, label: 'Create Community' },
    // Removed dynamic paths that require community ID context
    // { path: '/communities/:id/create-post', icon: PlusCircle, label: 'Create Post' },
    // { path: '/communities/:id/create-event', icon: Calendar, label: 'Create Event' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const navItems =
    user?.role === 'creator' || user?.role === 'admin' ? creatorNavItems : studentNavItems;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] top-0 pointer-events-auto"
          onClick={onClose}
        />
      )}
      <div
        ref={sidebarRef}
        className={`pointer-events-auto fixed left-0 top-0 h-screen z-[90] overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out  ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isHomePage
            ? 'bg-neutral-900/85 backdrop-blur-xl border-r border-white/10 text-white shadow-2xl'
            : 'bg-white/95 backdrop-blur-md border-r border-gray-100 text-gray-900 shadow-xl'
        }`}
        style={{ width: isOpen ? `${width}px` : '0px' }}
      >
        <div className="px-4 py-5 relative h-full flex flex-col justify-between">
          <div>
            {/* Sidebar Top Header with Brand & Close Button */}
            <div
              className={`flex items-center justify-between pb-5 mb-5 border-b ${
                isHomePage ? 'border-white/10' : 'border-gray-100'
              }`}
            >
              <Link href="/" onClick={onClose} className="flex items-center space-x-3 group">
                <Image
                  src={logo}
                  alt="Gurukul Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full shadow-md"
                />
                <span
                  className={`text-xl font-bold tracking-tight ${
                    isHomePage ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Gurukul
                </span>
              </Link>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${
                  isHomePage
                    ? 'text-gray-400 hover:text-white hover:bg-white/10'
                    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                }`}
                aria-label="Close Sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    onClick={() => {
                      // if (window.innerWidth < 768) {
                      setTimeout(() => {
                        onClose();
                      }, 0);
                      // }
                    }}
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      active
                        ? isHomePage
                          ? 'bg-white text-gray-950 font-semibold shadow-md'
                          : 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                        : isHomePage
                          ? 'text-white hover:bg-white hover:text-black font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        active
                          ? isHomePage
                            ? 'text-gray-950'
                            : 'text-primary-600'
                          : isHomePage
                            ? 'text-white group-hover:text-black'
                            : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3
                className={`px-4 text-xs font-semibold ${isHomePage ? 'text-gray-200' : 'text-gray-400'} uppercase tracking-wider mb-2`}
              >
                Quick Actions
              </h3>
              <div className="space-y-1">
                <Link
                  href="/search"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isHomePage
                      ? 'text-white hover:bg-white hover:text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Search
                    className={`h-4.5 w-4.5 transition-colors ${
                      isHomePage
                        ? 'text-white group-hover:text-black'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span>Search</span>
                </Link>
                <Link
                  href="/profile"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isHomePage
                      ? 'text-white hover:bg-white hover:text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <User
                    className={`h-4.5 w-4.5 transition-colors ${
                      isHomePage
                        ? 'text-white group-hover:text-black'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span>Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isHomePage
                      ? 'text-white hover:bg-white hover:text-black'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Settings
                    className={`h-4.5 w-4.5 transition-colors ${
                      isHomePage
                        ? 'text-white group-hover:text-black'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="mt-auto pt-8">
            <div
              className={`p-3 rounded-2xl border ${
                isHomePage
                  ? 'bg-white/10 border-white/15 backdrop-blur-md'
                  : 'bg-gray-50/80 border-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {user?.avatar ? (
                  <div className="relative h-10 w-10">
                    <Image
                      src={user.avatar}
                      alt={user.firstName}
                      fill
                      className="rounded-lg object-cover shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm text-white font-medium">
                    {user?.firstName?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${isHomePage ? 'text-white' : 'text-gray-900'}`}
                  >
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p
                    className={`text-xs capitalize truncate ${isHomePage ? 'text-gray-300' : 'text-gray-500'}`}
                  >
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary-500 transition-colors z-50"
            onMouseDown={startResizing}
          />
        </div>
      </div>
    </>
  );
};

export default Sidebar;
