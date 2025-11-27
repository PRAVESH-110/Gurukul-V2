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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-lg shadow-primary/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">
            Welcome back, {dashboard.user.firstName}!
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            Continue your learning journey and explore new courses. You're doing great!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Courses</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboard.stats.totalCoursesEnrolled}
            </p>
            <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Completed</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboard.stats.completedCourses}
            </p>
            <p className="text-sm font-medium text-gray-500">Courses Completed</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Social</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboard.stats.totalCommunitiesJoined}
            </p>
            <p className="text-sm font-medium text-gray-500">Communities Joined</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Play className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Learning</span>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {dashboard.stats.totalVideosWatched}
            </p>
            <p className="text-sm font-medium text-gray-500">Videos Watched</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Continue Learning */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-primary-600" />
              Continue Learning
            </h2>
            <Link
              to="/my-courses"
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {dashboard.enrolledCourses.length > 0 ? (
              <div className="space-y-6">
                {dashboard.enrolledCourses.slice(0, 3).map((course) => (
                  <div key={course._id} className="group flex items-center space-x-4 p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 relative">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="h-16 w-16 rounded-xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-primary-50 rounded-xl flex items-center justify-center border border-primary-100">
                          <BookOpen className="h-8 w-8 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        by {course.creator.firstName} {course.creator.lastName}
                      </p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium text-gray-700">{course.progress}% Complete</span>
                        </div>
                        <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/courses/${course._id}`}
                      className="btn-secondary text-xs px-3 py-2 whitespace-nowrap"
                    >
                      Continue
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">No enrolled courses</p>
                <p className="text-gray-500 text-sm mb-4">Start your learning journey today</p>
                <Link to="/courses" className="btn-primary text-sm">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary-600" />
              Upcoming Events
            </h2>
            <Link
              to="/my-communities"
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {dashboard.upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {dashboard.upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="flex items-start space-x-4 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-xl flex flex-col items-center justify-center text-primary-700">
                        <span className="text-xs font-bold uppercase">{new Date(event.startDate).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-bold leading-none">{new Date(event.startDate).getDate()}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {event.title}
                      </h3>
                      <p className="text-xs text-primary-600 font-medium mt-0.5">
                        {event.community.name}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">No upcoming events</p>
                <p className="text-gray-500 text-sm">Join communities to see events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Community Posts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
            Recent Community Posts
          </h2>
          <Link
            to="/my-communities"
            className="text-primary-600 hover:text-primary-700 text-sm font-semibold hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="p-6">
          {dashboard.recentPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dashboard.recentPosts.slice(0, 3).map((post) => (
                <div key={post._id} className="flex flex-col h-full p-5 rounded-xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all bg-gray-50/30 hover:bg-white">
                  <div className="flex items-center space-x-3 mb-3">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.firstName}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                      />
                    ) : (
                      <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {post.author.firstName[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {post.author.firstName} {post.author.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        in {post.community.name}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center hover:text-primary-600 transition-colors">
                        {post.likeCount} Likes
                      </span>
                      <span className="flex items-center hover:text-primary-600 transition-colors">
                        {post.commentCount} Comments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No recent posts</p>
              <Link to="/communities" className="btn-primary text-sm mt-2">
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
