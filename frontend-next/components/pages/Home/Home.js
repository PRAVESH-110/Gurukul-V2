import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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

import CursorDotsAnimation from '@/components/UI/CursorDotsAnimation';

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
    <div className="min-h-screen bg-gray-50/50 font-sans relative">
      <CursorDotsAnimation />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-blue-50/50 opacity-70"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-primary-100 text-primary-700 text-sm font-medium mb-8 animate-fade-in">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Trusted by 10,000+ Students
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight text-gray-900 mb-8 animate-slide-up">
              Learn Without <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">Limits</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Join Gurukul, the ultimate learning platform where knowledge meets community.
              Access thousands of courses and connect with learners worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {!user ? (
                <>
                  <Link
                    href="/register"
                    className="btn-primary px-8 py-4 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/courses"
                    className="px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Browse Courses
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="btn-primary px-8 py-4 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 inline-flex items-center"
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
      <section className="py-12 border-y border-gray-100/50 backdrop-blur-sm bg-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
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
                <div key={index} className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors duration-300">
                    <Icon className="h-7 w-7 text-primary-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Courses
              </h2>
              <p className="text-xl text-gray-600">
                Discover our most popular and highly-rated courses
              </p>
            </div>
            <Link
              href="/courses"
              className="hidden md:inline-flex items-center font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((course) => (
              <div key={course} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/60 z-10 group-hover:opacity-0 transition-opacity duration-300"></div>
                  <div className="w-full h-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                    <Play className="h-16 w-16 text-white opacity-80" />
                  </div>
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-bold text-primary-700 shadow-sm">
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    Complete Web Development Bootcamp 2024
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    Learn full-stack web development from scratch with modern technologies including React, Node.js, and more.
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">4.9</span>
                      <span className="text-sm text-gray-500">(1.2k)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1.5" />
                      40h 30m
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-gray-900">$49</span>
                    <Link
                      href="/courses/1"
                      className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link
              href="/courses"
              className="btn-secondary w-full justify-center"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-600">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-primary-700 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners who are already advancing their careers with Gurukul.
            Start your journey today.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn bg-white text-primary-600 hover:bg-gray-50 border-transparent px-8 py-4 text-lg shadow-xl shadow-black/10"
              >
                Start Learning Now
              </Link>
              <Link
                href="/login"
                className="btn bg-primary-700 text-white hover:bg-primary-800 border-transparent px-8 py-4 text-lg shadow-xl shadow-black/10"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white tracking-tight">Gurukul</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering learners worldwide with quality education, interactive courses, and a supportive community.
              </p>
              <div className="flex space-x-4">
                {/* Social Icons could go here */}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Platform</h3>
              <ul className="space-y-4">
                <li><Link href="/courses" className="hover:text-primary-400 transition-colors">Browse Courses</Link></li>
                <li><Link href="/communities" className="hover:text-primary-400 transition-colors">Communities</Link></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing Plans</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">For Business</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Support</h3>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold text-lg mb-6">Stay Updated</h3>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates.</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
                <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2024 Gurukul Platform. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

