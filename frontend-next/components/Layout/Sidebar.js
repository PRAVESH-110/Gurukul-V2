'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import logo from '@/assets/logo.png';
import {
  XClose as X,
  BarChart03 as BarChart3,
  BookOpen01 as BookOpen,
  Home01 as Home,
  PlusCircle,
  SearchMd as Search,
  Settings01 as Settings,
  User01 as User,
  Users01 as Users,
} from '@untitledui/icons';
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
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = React.useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    }
  }, []);

  const resize = React.useCallback(
    (e) => {
      if (isResizing.current && setWidth) {
        const newWidth = Math.round(e.clientX);
        if (newWidth >= 200 && newWidth <= 520) {
          setWidth(newWidth);
        }
      }
    },
    [setWidth],
  );

  useEffect(() => {
    const handleMouseMove = (e) => resize(e);
    const handleMouseUp = () => stopResizing();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-[80] top-0 pointer-events-auto transition-opacity"
          onClick={onClose}
        />
      )}
      <aside
        ref={sidebarRef}
        aria-label="Sidebar navigation"
        className={`pointer-events-auto fixed left-0 top-0 h-screen z-[90] overflow-y-auto custom-scrollbar transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isHomePage
            ? 'bg-neutral-900/95 backdrop-blur-2xl border-r border-white/10 text-white shadow-2xl'
            : 'bg-white/95 backdrop-blur-xl border-r border-slate-200/80 text-slate-900 shadow-[4px_0_24px_-4px_rgba(15,23,42,0.08)]'
        }`}
        style={{ width: isOpen ? `${width}px` : '0px' }}
      >
        <div className="relative h-full flex flex-col justify-between">
          <div>
            {/* Top Header / Branding Bar */}
            <div
              className={`px-5 py-5 flex items-center justify-between border-b ${
                isHomePage ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'
              }`}
            >
              <Link
                href="/"
                onClick={onClose}
                className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
              >
                <div className="relative p-0.5 rounded-xl bg-white shadow-sm ring-1 ring-slate-200/60 transition-transform group-hover:scale-105">
                  <Image
                    src={logo}
                    alt="Gurukul Logo"
                    width={34}
                    height={34}
                    className="w-8 h-8 rounded-[10px] object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-base font-bold tracking-tight leading-tight ${
                      isHomePage ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Gurukul
                  </span>
                  <span
                    className={`text-[10px] font-medium tracking-wide uppercase ${
                      isHomePage ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Platform
                  </span>
                </div>
              </Link>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg border transition-all ${
                  isHomePage
                    ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                    : 'border-slate-200/60 text-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-xs'
                }`}
                aria-label="Close Sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Main Navigation Section */}
            <div className="px-3 pt-5">
              <div className="px-3 pb-2 flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold tracking-wider uppercase ${
                    isHomePage ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  Menu
                </span>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      onClick={onClose}
                      key={item.path}
                      href={item.path}
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                        active
                          ? isHomePage
                            ? 'bg-white/15 text-white font-semibold shadow-xs'
                            : 'bg-primary-500/10 text-primary-700 font-semibold shadow-xs'
                          : isHomePage
                            ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      {active && (
                        <span
                          className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                            isHomePage ? 'bg-white' : 'bg-primary-600'
                          }`}
                        />
                      )}
                      <Icon
                        className={`h-4.5 w-4.5 transition-colors ${
                          active
                            ? isHomePage
                              ? 'text-white'
                              : 'text-primary-600'
                            : isHomePage
                              ? 'text-slate-400 group-hover:text-white'
                              : 'text-slate-400 group-hover:text-slate-700'
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Clean Section Divider */}
            <div className="px-4 py-4">
              <div className={`h-px w-full ${isHomePage ? 'bg-white/10' : 'bg-slate-100'}`} />
            </div>

            {/* Quick Actions */}
            <div className="px-3">
              <div className="px-3 pb-2 flex items-center justify-between">
                <span
                  className={`text-[11px] font-semibold tracking-wider uppercase ${
                    isHomePage ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  Quick Actions
                </span>
              </div>
              <div className="space-y-1">
                <Link
                  onClick={onClose}
                  href="/search"
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive('/search')
                      ? isHomePage
                        ? 'bg-white/15 text-white font-semibold'
                        : 'bg-primary-500/10 text-primary-700 font-semibold'
                      : isHomePage
                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {isActive('/search') && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                        isHomePage ? 'bg-white' : 'bg-primary-600'
                      }`}
                    />
                  )}
                  <Search
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive('/search')
                        ? isHomePage
                          ? 'text-white'
                          : 'text-primary-600'
                        : isHomePage
                          ? 'text-slate-400 group-hover:text-white'
                          : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>Search</span>
                </Link>
                <Link
                  onClick={onClose}
                  href="/profile"
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive('/profile')
                      ? isHomePage
                        ? 'bg-white/15 text-white font-semibold'
                        : 'bg-primary-500/10 text-primary-700 font-semibold'
                      : isHomePage
                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {isActive('/profile') && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                        isHomePage ? 'bg-white' : 'bg-primary-600'
                      }`}
                    />
                  )}
                  <User
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive('/profile')
                        ? isHomePage
                          ? 'text-white'
                          : 'text-primary-600'
                        : isHomePage
                          ? 'text-slate-400 group-hover:text-white'
                          : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>Profile</span>
                </Link>
                <Link
                  onClick={onClose}
                  href="/settings"
                  className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive('/settings')
                      ? isHomePage
                        ? 'bg-white/15 text-white font-semibold'
                        : 'bg-primary-500/10 text-primary-700 font-semibold'
                      : isHomePage
                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  {isActive('/settings') && (
                    <span
                      className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${
                        isHomePage ? 'bg-white' : 'bg-primary-600'
                      }`}
                    />
                  )}
                  <Settings
                    className={`h-4.5 w-4.5 transition-colors ${
                      isActive('/settings')
                        ? isHomePage
                          ? 'text-white'
                          : 'text-primary-600'
                        : isHomePage
                          ? 'text-slate-400 group-hover:text-white'
                          : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* User Info Footer Card */}
          <div className="p-3 border-t border-slate-100 dark:border-white/10 mt-auto bg-slate-50/40 dark:bg-transparent">
            <Link
              href="/profile"
              onClick={onClose}
              className={`p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                isHomePage
                  ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200/70 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {user?.avatar ? (
                <div className="relative h-9 w-9 shrink-0">
                  <Image
                    src={user.avatar}
                    alt={user.firstName || 'User'}
                    fill
                    className="rounded-lg object-cover shadow-2xs"
                  />
                </div>
              ) : (
                <div className="h-9 w-9 shrink-0 bg-primary-600 rounded-lg flex items-center justify-center shadow-xs text-white text-sm font-semibold">
                  {user?.firstName?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <p
                  className={`text-xs font-semibold truncate leading-tight ${
                    isHomePage ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {user?.firstName} {user?.lastName}
                </p>
                <p
                  className={`text-[11px] capitalize truncate mt-0.5 ${
                    isHomePage ? 'text-white/90 font-medium' : 'text-slate-500 font-medium'
                  }`}
                >
                  {user?.role}
                </p>
              </div>
            </Link>
          </div>

          {/* Resize Handle with Sleek Hover Indicator */}
          <div
            className="absolute top-0 right-0 w-2 h-full cursor-col-resize hover:bg-primary-500/30 active:bg-primary-500 transition-colors z-50 flex items-center justify-center group"
            onMouseDown={startResizing}
            title="Drag to resize sidebar width"
          >
            <div className="w-0.5 h-6 bg-slate-300/60 dark:bg-slate-600/60 rounded-full group-hover:bg-primary-500 group-hover:h-10 transition-all duration-200" />
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
