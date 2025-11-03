import { useQuery } from '@tanstack/react-query';
import {
    BookOpen,
    DollarSign,
    Plus,
    Star,
    TrendingUp,
    Users,
    Video
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { dashboardAPI } from '../../services/api';

const CreatorDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['creatorDashboard'],
    queryFn: () => dashboardAPI.getCreatorDashboard()
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const { dashboard } = dashboardData?.data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {dashboard?.user?.firstName}!
        </h1>
        <p className="text-primary-100">
          Manage your courses and communities, track your success
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/create-course" className="btn-primary text-center">
          <Plus className="h-5 w-5 mx-auto align-items-center justify-items-center mb-2" />
          Create Course
        </Link>
        <Link to="/create-community" className="btn-primary text-center">
          <Plus className="h-5 w-5 mx-auto mb-2" />
          Create Community
        </Link>
        <Link to="/upload-video" className="btn-primary text-center bg-green-600 hover:bg-green-700">
          <Video className="h-5 w-5 mx-auto mb-2" />
          Upload Video
        </Link>
        <Link to="/manage-courses" className="btn-outline text-center">
          <BookOpen className="h-5 w-5 mx-auto mb-2" />
          Manage Courses
        </Link>
        <Link to="/analytics" className="btn-outline text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-2" />
          View Analytics
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.stats?.totalCourses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.stats?.totalEnrollments || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${dashboard?.stats?.totalRevenue || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {(typeof dashboard?.stats?.averageRating === 'number' ? dashboard.stats.averageRating.toFixed(1) : '0.0')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Courses</h2>
              <Link
                to="/manage-courses"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {dashboard?.createdCourses?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.createdCourses.slice(0, 3).map((course) => (
                  <div key={course._id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-primary-600" />
                        </div> 
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {course.title}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {course.enrollmentCount || 0}
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {course?.rating?.average ? course.rating.average.toFixed(1) : '0.0'}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      ${course.price || 0}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No courses created yet</p>
                <Link to="/create-course" className="btn-primary">
                  Create Your First Course
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Communities */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Communities</h2>
              <Link
                to="/manage-communities"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {dashboard?.createdCommunities?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.createdCommunities.slice(0, 3).map((community) => (
                  <div key={community._id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {community.name}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {community.description}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {community.memberCount || 0} members
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No communities created yet</p>
                <Link to="/create-community" className="btn-primary">
                  Create Your First Community
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Analytics */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
            <Link
              to="/analytics"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View Detailed Analytics
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {dashboard?.analytics?.totalViews || 0}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {dashboard?.analytics?.completionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {dashboard?.analytics?.monthlyRevenue || 0}
              </div>
              <div className="text-sm text-gray-600">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* All Created Communities */}
      {dashboard?.createdCommunities?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Your Communities</h2>
              <Link
                to="/manage-communities"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Manage All
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboard.createdCommunities.map((community) => (
                <Link
                  key={community._id}
                  to={`/communities/${community._id}`}
                  className="flex flex-col space-y-3 hover:bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {community.name}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        {community.memberCount || 0} members
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {community.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;
