'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  BookOpen,
  Calendar,
  Home,
  PlusCircle,
  Search,
  Settings,
  User,
  Users
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
    [setWidth]
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

  const navItems = user?.role === 'creator' ? creatorNavItems : studentNavItems;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] top-16  pointer-events-auto"
          onClick={onClose}
        />
      )}
      <div
        ref={sidebarRef}
        className={`${isHomePage ? 'absolute' : 'sticky'} pointer-events-auto fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-100 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out z-[70] ${isOpen ? 'translate-x-0' : '-translate-x-full'} `}
        style={{ width: isOpen ? `${width}px ` : '0px' }}
      >
        <div className="px-4 py-6 relative h-full">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setTimeout(() => {
                        onClose();
                      }, 1000)
                    }
                  }}
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                    ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`h-5 w-5 transition-colors ${active ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Quick Actions
            </h3>
            <div className="space-y-1">
              <Link
                href="/search"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
              >
                <Search className="h-4.5 w-4.5 text-gray-400 group-hover:text-gray-600" />
                <span>Search</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
              >
                <User className="h-4.5 w-4.5 text-gray-400 group-hover:text-gray-600" />
                <span>Profile</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
              >
                <Settings className="h-4.5 w-4.5 text-gray-400 group-hover:text-gray-600" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* User Info Card */}
          <div className="mt-auto pt-8">
            <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-100">
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
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">{user?.role}</p>
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

