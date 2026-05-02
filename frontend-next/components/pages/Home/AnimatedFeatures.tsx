'use client';
import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Users, Video, Award } from 'lucide-react';

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

const AnimatedFeatures = () => {
    const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
    const featuresRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsFeaturesVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.4 }
        );

        const currentRef = featuresRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <section
            className="py-24 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden"
            ref={featuresRef}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose Gurukul?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We provide everything you need for an exceptional learning experience
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className={`group relative p-[1px] rounded-2xl transition-all duration-300 hover:-translate-y-2 ${isFeaturesVisible ? 'animate-slide-up' : 'opacity-0'}`}
                                style={{
                                    animationDelay: `${index * 150}ms`,
                                    animationFillMode: 'both'
                                }}
                            >
                                {/* Card Border Gradient - Blue/Black Theme */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 group-hover:from-primary-600 group-hover:via-blue-600 group-hover:to-black transition-all duration-500 shadow-sm group-hover:shadow-xl"></div>

                                {/* Card Content */}
                                <div className="relative h-full bg-[#0A0F1C] rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden group-hover:bg-[#05080F] transition-colors duration-300">
                                    {/* Blue Glow Effect */}
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div>
                                        <div className="w-12 h-12 rounded-xl border border-gray-800 bg-gray-900/50 flex items-center justify-center mb-6 group-hover:border-primary-500/50 group-hover:bg-primary-900/20 group-hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all duration-300">
                                            <Icon className="h-6 w-6 text-gray-300 group-hover:text-blue-400 transition-colors duration-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-50 transition-colors">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default AnimatedFeatures;
