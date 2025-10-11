import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Users, 
  Video, 
  Star, 
  ArrowRight,
  Play,
  Award,
  Globe,
  Clock
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Courses',
      description: 'Learn from comprehensive video courses created by expert instructors'
    },
    {
      icon: Users,
      title: 'Learning Communities',
      description: 'Join communities to connect with peers and share knowledge'
    },
    {
      icon: Video,
      title: 'HD Video Content',
      description: 'High-quality video lectures optimized for the best learning experience'
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn certificates upon course completion to showcase your skills'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Students' },
    { number: '500+', label: 'Courses' },
    { number: '100+', label: 'Instructors' },
    { number: '50+', label: 'Communities' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Join Gurukul, the ultimate learning platform where knowledge meets community. 
              Access thousands of courses and connect with learners worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/courses"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Browse Courses
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold text-primary-600">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Gurukul?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need for an exceptional learning experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Courses
              </h2>
              <p className="text-gray-600">
                Discover our most popular and highly-rated courses
              </p>
            </div>
            <Link
              to="/courses"
              className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
            >
              View All Courses
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sample Course Cards */}
            {[1, 2, 3].map((course) => (
              <div key={course} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-lg flex items-center justify-center">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded text-sm font-medium text-primary-600">
                    Featured
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Complete Web Development Course
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Learn full-stack web development from scratch with modern technologies
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">4.9 (1,234)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      40 hours
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-600">$49</span>
                    <Link
                      to="/courses/1"
                      className="btn-primary"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already advancing their careers with Gurukul
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Learning Today
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Gurukul</span>
              </div>
              <p className="text-gray-400">
                Empowering learners worldwide with quality education and community support.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
                <li><Link to="/communities" className="hover:text-white">Communities</Link></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Gurukul. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
