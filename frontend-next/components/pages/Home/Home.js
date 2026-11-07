'use client';
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Star, ArrowRight, Play, Globe, Clock } from 'lucide-react';
import './flow.css';
import Image from 'next/image';

import ChatAssistant from './ChatAssistant';
import HomeFAQSection from './HomeFAQSection';

const featuredCourses = [
  {
    name: ' Fundamentals of Crypto',
    description:
      'Crypto is a digital currency that’s secured by cryptography, making it nearly impossible to counterfeit or double-spend. Learn how it works.',
    rating: 4.9,
    audience: '1.2k',
    time: '2hrs',
    cost: '$30',
    image: '/assets/dex.jpeg',
  },
  {
    name: ' AI course',
    description:
      'Learn full-stack web development from scratch with modern technologies including React, Node.js, and more.',
    rating: 4.9,
    audience: '1.2k',
    time: '25hrs',
    cost: '$12',
    image: '/assets/ai_banner.png',
  },
  {
    name: ' Linkedin mastery',
    description:
      'Learn how to use LinkedIn effectively to network, find jobs, and build your professional brand.',
    rating: 4.9,
    audience: '1.2k',
    time: '40hrs',
    cost: '$300',
    image: '/assets/PRAVESH DHAKAL.png',
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-yellow-50/40 to-amber-50/60 font-sans relative">
      {/* Hero Section */}
      <section className="relative w-full min-h-[460px] max-h-[100vh] py-16 md:py-24 flex items-center justify-center overflow-hidden">
        {/* Next.js optimized high-quality background Image */}
        <Image
          src="/hero-woman.jpg"
          alt="Gurukul learning and earning"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover object-center pointer-events-none select-none"
        />
        {/* Subtle dark gradient overlay to ensure text contrast while keeping background clean */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 py-12 md:py-20 flex flex-col items-start text-left">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-white/40 text-gray-900 text-sm font-semibold mb-6 shadow-lg animate-fade-in">
            <span>5.0</span>
            <Star className="w-4 h-4 ml-1.5 mr-2 fill-current text-yellow-500" />
            <div className="flex border rounded-full overflow-hidden px-1 mr-2">
              <Image
                src="/stud2.jpg"
                alt="Student"
                width={20}
                height={20}
                className="rounded-full"
              />
              <Image
                src="/stud3.jpg"
                alt="Student"
                width={20}
                height={20}
                className="rounded-full"
              />
              <Image
                src="/stud4.webp"
                alt="Student"
                width={20}
                height={20}
                className="rounded-full"
              />
              <Image
                src="/stud1.webp"
                alt="Student"
                width={20}
                height={20}
                className="rounded-full"
              />
            </div>
            <span>50+ reviews</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-white mb-3 drop-shadow-xl leading-none max-w-none animate-slide-up">
            <span className="whitespace-nowrap">Create what you love and</span>
            <span className="block -mt-1 sm:-mt-2 md:-mt-3 font-medium text-amber-400 font-damion tracking-normal">
              start earning
            </span>
          </h1>

          <p
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed drop-shadow-md mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            Learn from a wide range of courses or start creating your own courses and get paid, no
            matter how small your audience.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-start w-full max-w-md animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            {!user ? (
              <>
                <Link
                  href="/register"
                  className="px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 text-center inline-flex items-center justify-center"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/courses"
                  className="px-8 py-3.5 text-base font-semibold text-blue-600 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 text-center inline-flex items-center justify-center"
                >
                  Browse Courses
                </Link>
              </>
            ) : (
              <Link
                href="/dashboard"
                className="px-8 py-3.5 text-base md:text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* flow diagram */}
      <div className="p-6 md:p-10 bg-transparent w-[96%] max-w-[1600px] mx-auto flex flex-col items-center gap-6 mt-10">
        <div className="flow-wrapper w-full flex justify-evenly items-center gap-6 md:gap-10 min-h-[50vh]">
          {/* Social Icons */}
          <div className="social-icons">
            <i className="fa-brands fa-youtube"></i>
            <i className="fa-brands fa-instagram"></i>
            <i className="fa-brands fa-facebook"></i>
            <i className="fa-brands fa-tiktok"></i>
            <i className="fa-solid fa-envelope"></i>
          </div>

          <div className="flex flex-col items-center gap-3">
            <h3 className="text-center text-base md:text-lg font-semibold text-gray-800">
              Gather audience
            </h3>
            <i className="fa-solid fa-arrow-right arrow hidden md:block"></i>
          </div>

          {/* Uploadable Main Image */}
          <div className="main-image flex-1 max-w-[620px] flex flex-col items-center">
            <h3 className="w-full py-2 mb-2 text-center text-lg md:text-xl font-bold text-gray-900">
              Create what you love
            </h3>
            <div className="w-full flex justify-center rounded-2xl ">
              <Image
                src="/monetizehobby.png"
                alt="Main course showcase"
                width={610}
                height={290}
                className="object-contain w-full h-auto max-h-[340px] rounded-2xl"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <h3 className="text-center text-base md:text-lg font-semibold text-gray-800">
              Start selling
            </h3>
            <i className="fa-solid fa-arrow-right arrow hidden md:block"></i>
          </div>

          {/* Profiles */}
          <div className="flex flex-col items-center">
            <div className="profiles flex flex-col gap-3">
              <Image
                src="/stud2.jpg"
                alt="Student"
                width={68}
                height={68}
                className="rounded-full shadow-sm"
              />
              <Image
                src="/stud3.jpg"
                alt="Student"
                width={68}
                height={68}
                className="rounded-full shadow-sm"
              />
              <Image
                src="/stud4.webp"
                alt="Student"
                width={68}
                height={68}
                className="rounded-full shadow-sm"
              />
              <Image
                src="/stud1.webp"
                alt="Student"
                width={68}
                height={68}
                className="rounded-full shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Down Arrow pointing to income */}
        <i className="fa-solid fa-arrow-down text-5xl h-16 text-[#4f4b4b]"></i>

        {/* Income */}
        <div className="income-box w-fit min-w-[max-content] px-10 py-3 border-2 border-black bg-yellow-300 rounded-full shadow-none">
          <h3 className="font-bold text-lg md:text-xl text-gray-950">Get paid</h3>
        </div>
      </div>

      {/* Featured Courses Section */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
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
              className="hidden md:inline-flex items-center font-semibold text-black hover:text-primary-700 transition-colors"
            >
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((featuredCourse, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-video overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-900/60 z-10 group-hover:opacity-0 transition-opacity duration-300"></div>
                  {featuredCourse.image ? (
                    <Image
                      src={featuredCourse.image}
                      alt={featuredCourse.name}
                      fill
                      className="object-cover image-fit group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-yellow-600 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Play className="h-16 w-16 text-white opacity-80" />
                    </div>
                  )}
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
                      href="/courses"
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
            <Link href="/courses" className="btn-secondary w-full justify-center">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ + AI Chat — client islands */}
      <section className="pt-6 pb-16 md:pt-8 md:pb-20">
        <div id="faq-ai" className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 scroll-mt-24">
          <div className="flex flex-col lg:flex-row items-stretch gap-8 h-[600px] md:h-[650px] w-full">
            <HomeFAQSection />
            <ChatAssistant />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-800 py-16 border-t border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-black tracking-tight">Gurukul</span>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Empowering learners worldwide with quality education, interactive courses, and a
                supportive community.
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col md:flex-row gap-8 w-full">
              <div className="flex-1">
                <h3 className="text-black font-semibold text-lg mb-6">Platforms</h3>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="https://www.linkedin.com/in/pravesh-dhakal/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-black hover:text-primary-600 transition-colors cursor-pointer group"
                    >
                      <i className="fa-brands fa-linkedin text-xl text-black"></i>{' '}
                      <span className="text-black group-hover:text-primary-600 transition-colors">
                        LinkedIn
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/PRAVESH-110/Gurukul-V2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-black hover:text-primary-600 transition-colors cursor-pointer group"
                    >
                      <i className="fa-brands fa-github text-xl text-black"></i>{' '}
                      <span className="text-black group-hover:text-primary-600 transition-colors">
                        GitHub
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.gmail.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-black hover:text-primary-600 transition-colors cursor-pointer group"
                    >
                      <i className="fa-solid fa-envelope text-xl text-black"></i>{' '}
                      <span className="text-black group-hover:text-primary-600 transition-colors">
                        Gmail
                      </span>
                    </a>
                  </li>
                </ul>
              </div>

              <div className="flex-1">
                <h3 className="text-black font-semibold text-lg mb-6">Support</h3>
                <ul className="space-y-4">
                  <li>
                    <a
                      href="#faq-ai"
                      className="text-black hover:text-primary-600 transition-colors cursor-pointer"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.gmail.com/"
                      className="text-black hover:text-primary-600 transition-colors"
                    >
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              <div className="flex-1">
                <h3 className="text-black font-semibold text-lg mb-6">Stay Updated</h3>
                <p className="text-gray-700 mb-4">
                  Subscribe to our newsletter for the latest updates.
                </p>
                <form className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-gray-50 border border-gray-300 text-black placeholder-gray-500 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  />
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>&copy; 2024 Gurukul Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
