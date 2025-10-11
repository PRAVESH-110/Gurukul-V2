import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../../services/api';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  Award,
  Play,
  MessageSquare
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const StudentDashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: () => dashboardAPI.getStudentDashboard()
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

  const { dashboard } = dashboardData.data;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {dashboard.user.firstName}!
        </h1>
        <p className="text-primary-100">
          Continue your learning journey and explore new courses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.stats.totalCoursesEnrolled}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.stats.completedCourses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Communities</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.stats.totalCommunitiesJoined}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Play className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Videos Watched</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboard.stats.totalVideosWatched}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Continue Learning */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
              <Link
                to="/my-courses"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {dashboard.enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {dashboard.enrolledCourses.slice(0, 3).map((course) => (
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
                      <p className="text-sm text-gray-500">
                        by {course.creator.firstName} {course.creator.lastName}
                      </p>
                      <div className="mt-1">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.progress}% complete
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-primary text-sm"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No enrolled courses yet</p>
                <Link to="/courses" className="btn-primary">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link
                to="/my-communities"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {dashboard.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {dashboard.upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.community.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(event.startDate).toLocaleDateString()} at{' '}
                        {new Date(event.startDate).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Community Posts */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Community Posts</h2>
            <Link
              to="/my-communities"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          {dashboard.recentPosts.length > 0 ? (
            <div className="space-y-6">
              {dashboard.recentPosts.slice(0, 3).map((post) => (
                <div key={post._id} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.firstName}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {post.author.firstName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">
                        {post.author.firstName} {post.author.lastName}
                      </p>
                      <span className="text-gray-400">•</span>
                      <p className="text-sm text-gray-500">{post.community.name}</p>
                      <span className="text-gray-400">•</span>
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 mt-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {post.likeCount} likes
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.commentCount} comments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No recent posts</p>
              <Link to="/communities" className="btn-primary">
                Join Communities
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
