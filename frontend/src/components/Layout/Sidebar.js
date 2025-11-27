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
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
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
    { path: '/communities/:id/create-post', icon: PlusCircle, label: 'Create Post' },
    { path: '/communities/:id/create-event', icon: Calendar, label: 'Create Event' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const navItems = user?.role === 'creator' ? creatorNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-4 py-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
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
                to="/search"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
              >
                <Search className="h-4.5 w-4.5 text-gray-400 group-hover:text-gray-600" />
                <span>Search</span>
              </Link>
              <Link
                to="/profile"
                className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group"
              >
                <User className="h-4.5 w-4.5 text-gray-400 group-hover:text-gray-600" />
                <span>Profile</span>
              </Link>
              <Link
                to="/settings"
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
                  <img
                    src={user.avatar}
                    alt={user.firstName}
                    className="h-10 w-10 rounded-lg object-cover shadow-sm"
                  />
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
        </div>
      </div>
    </>
  );
};

export default Sidebar;
