import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Play, Users, Clock, Star, Calendar, CheckCircle } from 'lucide-react';
import { serverGet } from '@/lib/serverFetch';
import { getImageUrl } from '@/utils/imageUtils';
import EnrollButton from '@/components/pages/Courses/EnrollButton';

interface Video { _id: string; title: string; duration?: string; videoUrl?: string; }
interface Course {
    _id: string; title: string; description: string; thumbnail?: string;
    price?: number; duration?: string; totalVideos?: number;
    enrollmentCount?: number; rating?: { average?: number; count?: number };
    creator?: { firstName?: string; lastName?: string; avatar?: string };
    updatedAt?: string; createdAt?: string;
}
interface CourseResponse { data: { course: Course } }
interface VideosResponse { data: { data: Video[]; count: number } }

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CourseDetailPage(props: PageProps) {
    const params = await props.params;
    const [courseRes, videosRes] = await Promise.all([
        serverGet<CourseResponse>(`/courses/${params.id}`, { revalidate: 60 }),
        serverGet<VideosResponse>(`/videos/course/${params.id}`, { revalidate: 60 }),
    ]);

    const course = courseRes?.data?.course;
    if (!course) notFound();

    const videos = videosRes?.data?.data ?? [];
    const videoCount = videosRes?.data?.count ?? videos.length;

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans pb-12">
            {/* Hero */}
            <div className="bg-gray-900 text-white py-12 lg:py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-gray-900/50" />
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-2 text-primary-200 mb-6 text-sm font-medium">
                                <Link href="/courses" className="hover:text-white transition-colors">Courses</Link>
                                <span>/</span>
                                <span className="text-white truncate">{course.title}</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">{course.title}</h1>
                            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-3xl">{course.description}</p>
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                <div className="flex items-center text-yellow-400">
                                    <span className="font-bold text-lg mr-1">{course.rating?.average?.toFixed(1) || '0.0'}</span>
                                    <div className="flex mr-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < Math.floor(course.rating?.average || 0) ? 'fill-current' : 'text-gray-600'}`} />
                                        ))}
                                    </div>
                                    <span className="text-gray-400">({course.rating?.count || 0} ratings)</span>
                                </div>
                                <div className="flex items-center text-gray-300"><Users className="h-4 w-4 mr-2" />{course.enrollmentCount || 0} students</div>
                                <div className="flex items-center text-gray-300"><Clock className="h-4 w-4 mr-2" />{course.duration || 'N/A'}</div>
                                <div className="flex items-center text-gray-300">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Last updated {new Date(course.updatedAt || course.createdAt || '').toLocaleDateString()}
                                </div>
                            </div>
                            {course.creator && (
                                <div className="mt-8 flex items-center">
                                    {course.creator.avatar ? (
                                        <img src={course.creator.avatar} alt={`${course.creator.firstName} ${course.creator.lastName}`} className="w-10 h-10 rounded-full object-cover border-2 border-gray-700" />
                                    ) : (
                                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center border-2 border-gray-700">
                                            <span className="text-sm font-bold text-white">{course.creator.firstName?.[0]}{course.creator.lastName?.[0]}</span>
                                        </div>
                                    )}
                                    <div className="ml-3">
                                        <p className="text-sm text-gray-400">Created by</p>
                                        <p className="text-sm font-medium text-white">{course.creator.firstName} {course.creator.lastName}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 lg:-mt-32 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Mobile enroll card */}
                        <div className="lg:hidden bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="aspect-video bg-gray-900 relative">
                                {course.thumbnail ? (
                                    <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover opacity-90" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-16 w-16 text-gray-600" /></div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <Play className="h-8 w-8 text-white fill-current ml-1" />
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="mb-6 text-3xl font-bold">
                                    {course.price && course.price > 0 ? <span className="text-gray-900">${course.price}</span> : <span className="text-green-600">Free</span>}
                                </div>
                                {/* Client island */}
                                <EnrollButton courseId={course._id} isEnrolledInitial={false} variant="mobile" />
                            </div>
                        </div>

                        {/* What you'll learn */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">What you&apos;ll learn</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {['Master the core concepts and advanced techniques', 'Build real-world projects to showcase your skills', 'Learn best practices and industry standards', 'Get hands-on experience with practical exercises'].map((item, i) => (
                                    <div key={i} className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-gray-600">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Course Content */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
                                <span className="text-sm text-gray-500">{videoCount} lectures • {course.duration || 'N/A'}</span>
                            </div>
                            {videos.length > 0 ? (
                                <div className="border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
                                    {videos.map((video, index) => (
                                        <div key={video._id} className="flex items-center p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex-shrink-0 mr-4">
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                                                    <div className="h-2 w-2 bg-gray-300 rounded-full" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">{video.title}</h3>
                                                <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                                                    <span>Video</span><span>•</span><span>{video.duration || '10:00'}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400">Locked</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-gray-600">No videos available yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
                        </div>
                    </div>

                    {/* Sidebar — sticky enroll card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                                <div className="aspect-video bg-gray-900 relative">
                                    {course.thumbnail ? (
                                        <img src={getImageUrl(course.thumbnail)} alt={course.title} className="w-full h-full object-cover opacity-90" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-16 w-16 text-gray-600" /></div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                            <Play className="h-8 w-8 text-white fill-current ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-0 right-0 text-center">
                                        <span className="text-white font-medium text-sm drop-shadow-md">Preview this course</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-4xl w-full font-bold text-center mb-6">
                                        {course.price && course.price > 0 ? <span className="text-gray-900">${course.price}</span> : <span className="text-green-600">Free</span>}
                                    </div>
                                    {/* Client island */}
                                    <EnrollButton courseId={course._id} isEnrolledInitial={false} variant="sidebar" />
                                    <div className="mt-8 space-y-4">
                                        <h3 className="font-semibold text-gray-900">This course includes:</h3>
                                        <ul className="space-y-3 text-sm text-gray-600">
                                            <li className="flex items-center"><Play className="h-4 w-4 mr-3 text-primary-600" />{videoCount} video lessons</li>
                                            <li className="flex items-center"><BookOpen className="h-4 w-4 mr-3 text-primary-600" />Downloadable resources</li>
                                            <li className="flex items-center"><Users className="h-4 w-4 mr-3 text-primary-600" />Community access</li>
                                            <li className="flex items-center"><Clock className="h-4 w-4 mr-3 text-primary-600" />Lifetime access</li>
                                            <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-3 text-primary-600" />Certificate of completion</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
