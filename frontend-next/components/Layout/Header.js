'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  BookOpen,
  Users,
  Menu,
  X,
  Home
} from 'lucide-react';
import logo from '@/assets/logo.png';
import Image from 'next/image';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

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
    <header className={`${isHomePage ? 'absolute' : 'sticky bg-white/80 backdrop-blur-md border-b border-gray-100'} top-0 z-50 w-full transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            {user && (
              <button
                onClick={toggleSidebar}
                className="mr-4 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
            <Link href="/" className="flex items-center space-x-3 group">
              {/* <img src={logo} alt="Gurukul Logo" className="w-10 h-10 rounded-full shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200" /> */}
              <Image src={logo} alt="Gurukul Logo" width={36} height={36} className="w-10 h-10 rounded-full shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">Gurukul</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything..."
                className="block w-full pl-10 pr-4 py-2.5 border border-gray-400 rounded-lg leading-5 bg-gray-50/50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 ease-in-out"
              />
            </form>
          </div>

          {/* Navigation and User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!user ? (
              // Guest Navigation
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link
                  href="/courses"
                  className="hidden sm:block text-gray-600 hover:text-black px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-400 rounded-3xl"
                >
                  Courses
                </Link>
                <Link
                  href="/communities"
                  className="hidden sm:block text-gray-600 hover:text-black px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-400 rounded-3xl"
                >
                  Communities
                </Link>
                <div className="h-6 w-px bg-gray-200 hidden sm:block mx-2"></div>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              // Authenticated User Navigation
              <>
                {/* Notifications */}
                <button className="p-2.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200 relative group">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white group-hover:scale-110 transition-transform"></span>
                </button>

                {/* User Menu */}
                <div className="relative ml-2" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all duration-200"
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
                    <span className="hidden md:block text-sm font-medium text-gray-700">
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

