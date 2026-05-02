'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  BookOpen,
  Star,
  ArrowRight,
  Play,
  Globe,
  Clock,
} from 'lucide-react';
import './flow.css';
import Image from 'next/image';

import CursorDotsAnimation from '@/components/UI/CursorDotsAnimation';
import AnimatedFeatures from './AnimatedFeatures';
import ChatAssistant from './ChatAssistant';
import HomeFAQSection from './HomeFAQSection';

const featuredCourses = [
  {
    name: " Web Development course",
    description: "Learn full-stack web development from scratch with modern technologies including React, Node.js, and more.",
    rating: 4.9,
    audience: "1.2k",
    time: "40hrs",
    cost: "$30"
  },
  {
    name: " AI course",
    description: "Learn full-stack web development from scratch with modern technologies including React, Node.js, and more.",
    rating: 4.9,
    audience: "1.2k",
    time: "25hrs",
    cost: "$12"
  },
  {
    name: " Data Science course",
    description: "Learn full-stack web development from scratch with modern technologies including React, Node.js, and more.",
    rating: 4.9,
    audience: "1.2k",
    time: "40hrs",
    cost: "$300"
  }
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-60/50 font-sans relative mt-12">
      <CursorDotsAnimation />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30" style={{ backgroundImage: "url('/assets/moneywallpaper.jpg')" }}></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-15 lg:pt-30 lg:pb-28">
          <div className="text-center max-w-4xl mx-auto ">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-50 backdrop-blur-sm border-black border-2 text-black text-sm font-medium mb-8 animate-fade-in">
              <Star className="w-4 h-4 mr-2 fill-current text-yellow-500 " />
              Your trusted creator community partner
            </div>

            <h1 className="text-transparent bg-clip-text text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-primary-500">Create &nbsp;

              <span className="text-5xl md:text-6xl font-heading font-bold tracking-tight text-gray-900 mb-10 animate-slide-up">
                what you love and start earning
              </span>

            </h1>
            <p className="text-xl md:text-xl text-gray-600 mt-5 mb-10 max-w-5xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Learn from a wide range of courses or start creating your own courses and get paid, no matter how small your audience
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {!user ? (
                <>
                  <Link
                    href="/register"
                    className="btn-primary px-5 py-2 text-md "
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/courses"
                    className="btn-primary px-5 py-2 text-md text-gray-700 bg-white/80 border border-gray-300 hover:bg-white hover:border-gray-400  shadow-sm hover:shadow-md"
                  >
                    Browse Courses
                  </Link>
                </>
              ) : (
                <Link
                  href="/dashboard"
                  className="btn-primary px-5 py-2 text-lg hover:-translate-y-1 inline-flex items-center"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* flow diagram */}
      <div className="border-black border-2 p-6 bg-white rounded-xl w-[90%] lg:w-[80%] mx-auto flex flex-col items-center gap-6 mt-10">
        <div className="flow-wrapper w-full flex justify-center items-center gap-8 min-h-[50vh]">
          {/* Social Icons */}
          <div className="social-icons">
            <i className="fa-brands fa-youtube"></i>
            <i className="fa-brands fa-instagram"></i>
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-tiktok"></i>
            <i className="fa-solid fa-envelope"></i>
          </div>

          <div className="flex flex-col items-center gap-2">
            <h3 className="text-center text-sm font-medium">Gather audience</h3>
            <i className="fa-solid fa-arrow-right arrow hidden md:block"></i>
          </div>

          {/* Uploadable Main Image */}
          <div className="main-image flex flex-col items-center">
            <h3 className="w-full pb-2 text-center text-md font-medium">Create what you love</h3>
            <Image
              src="/monetizehobby.png"
              alt="Main"
              width={300}
              height={400}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h3 className="text-center text-sm font-medium">Start selling</h3>
            <i className="fa-solid fa-arrow-right arrow hidden md:block"></i>
          </div>

          {/* Profiles */}
          <div className="flex flex-col items-center">
            <div className="profiles flex flex-row gap-2">
              <Image src="/stud2.jpg" alt="" width={50} height={50} />
              <Image src="/stud3.jpg" alt="" width={50} height={50} />
              <Image src="/stud4.webp" alt="" width={50} height={50} />
              <Image src="/stud1.webp" alt="" width={50} height={50} />
            </div>
          </div>
        </div>

        {/* Down Arrow pointing to income */}
        <i className="fa-solid fa-arrow-down text-5xl h-20 text-[#4f4b4b]"></i>

        {/* Income */}
        <div className="income-box w-fit min-w-[max-content] px-8 border border-gray-100  bg-yellow-300">
          <h3 className="font-bold">Get paid</h3>
        </div>
      </div>

      {/* Features Section — client island */}
      <AnimatedFeatures />

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
            {featuredCourses.map((featuredCourse, index) => (
              <div key={index} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1">
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
                    {featuredCourse.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {featuredCourse.description}
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">4.9</span>
                      <span className="text-sm text-gray-500">(1.2k)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1.5" />
                      {featuredCourse.time}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-bold text-gray-900">{featuredCourse.cost}</span>
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

      {/* FAQ + AI Chat — client islands */}
      <div id="faq-ai" className="faqsai flex justify-center gap-10 scroll-mt-24">
        <HomeFAQSection />
        <ChatAssistant />
      </div>

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
            </div>

            <div className="md:col-span-3 flex flex-col md:flex-row gap-8 w-full">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-6">Platforms</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="https://www.linkedin.com/in/pravesh-dhakal/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-400 transition-colors cursor-pointer">
                      <i className="fa-brands fa-linkedin text-xl"></i> <span>LinkedIn</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/PRAVESH-110/Gurukul-V2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-400 transition-colors cursor-pointer">
                      <i className="fa-brands fa-github text-xl"></i> <span>GitHub</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://www.gmail.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary-400 transition-colors cursor-pointer">
                      <i className="fa-solid fa-envelope text-xl"></i> <span>Gmail</span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-6">Support</h3>
                <ul className="space-y-4">
                  <li><a href="#faq-ai" className="hover:text-primary-400 transition-colors cursor-pointer">Help Center</a></li>
                  <li><a href="https://www.gmail.com/" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>

              <div className="flex-1">
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
          </div>

          <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>&copy; 2024 Gurukul Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
