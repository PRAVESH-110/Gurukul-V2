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

const Sidebar = () => {
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

  const navItems = (user?.role === 'creator' || user?.role === 'admin') ? creatorNavItems : studentNavItems;

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="mt-2 space-y-1">
            <Link
              to="/search"
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-8 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
