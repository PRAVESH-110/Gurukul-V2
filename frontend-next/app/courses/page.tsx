import { Suspense } from 'react';
import Link from 'next/link';
import { BookOpen, Star, Users, Clock, ArrowRight } from 'lucide-react';
import { serverGet } from '@/lib/serverFetch';
import { getImageUrl } from '@/utils/imageUtils';
import CourseFilters from '@/components/pages/Courses/CourseFilters';

interface PageProps {
    searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    category?: string;
    thumbnail?: string;
    price?: number;
    rating?: { average?: number };
    enrollmentCount?: number;
    duration?: string;
}

export default async function CoursesPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const data = await serverGet<{ courses: Course[] }>('/courses', {
        params: {
            search: searchParams.search,
            category: searchParams.category,
            sort: searchParams.sort,
        },
        revalidate: 60, // ISR: revalidate every 60 seconds
    });

    const courses = data?.courses ?? [];

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            Explore Our{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                                Courses
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Discover a world of knowledge with our expertly crafted courses.
                            From coding to design, find the perfect path for your learning journey.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Client island: filter/search bar */}
                <Suspense fallback={<div className="h-16 bg-white rounded-2xl animate-pulse mb-10" />}>
                    <CourseFilters />
                </Suspense>

                {/* Course Grid — server-rendered HTML */}
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {courses.map((course) => (
                            <Link
                                key={course._id}
                                href={`/courses/${course._id}`}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                            >
                                <div className="relative aspect-video overflow-hidden bg-gray-100">
                                    {course.thumbnail ? (
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <BookOpen className="h-12 w-12 text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                                            {course.category || 'General'}
                                        </span>
                                        <div className="flex items-center text-yellow-400">
                                            <Star className="h-3.5 w-3.5 fill-current" />
                                            <span className="ml-1 text-sm font-medium text-gray-700">
                                                {course.rating?.average?.toFixed(1) || '4.5'}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-lg">
                                        {course.title}
                                    </h3>

                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                                        {course.description}
                                    </p>

                                    <div className="pt-4 border-t border-gray-100 mt-auto">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Users className="h-3.5 w-3.5 mr-1" />
                                                {course.enrollmentCount || 0} students
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="h-3.5 w-3.5 mr-1" />
                                                {course.duration || 'N/A'}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            {course.price && course.price > 0 ? (
                                                <span className="text-xl font-bold text-gray-900">${course.price}</span>
                                            ) : (
                                                <span className="text-xl font-bold text-green-600">Free</span>
                                            )}
                                            <span className="text-sm font-medium text-primary-600 group-hover:translate-x-1 transition-transform flex items-center">
                                                View Course <ArrowRight className="ml-1 h-4 w-4" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            We couldn&apos;t find any courses matching your criteria. Try adjusting your search or filters.
                        </p>
                        <Link href="/courses" className="mt-6 btn-secondary inline-block">
                            Clear Filters
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
