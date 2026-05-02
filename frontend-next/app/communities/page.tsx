
import Link from 'next/link';
import { Users, Lock, Globe, ArrowRight, MessageSquare } from 'lucide-react';
import { serverGet } from '@/lib/serverFetch';

interface Community {
    _id: string; name: string; description?: string; type?: string;
    category?: string; memberCount?: number;
    creator?: { firstName?: string; lastName?: string; avatar?: string };
}
interface CommunitiesResponse { data: { communities: Community[] } }

export default async function CommunitiesPage() {
    const data = await serverGet<CommunitiesResponse>('/communities', { revalidate: 60 });
    const communities = data?.data?.communities ?? [];

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            Join the{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                                Community
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Connect with like-minded learners, share knowledge, and grow together.
                            Find your tribe in our diverse collection of communities.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Communities Grid — fully server-rendered */}
                {communities.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {communities.map((community) => (
                            <Link
                                key={community._id}
                                href={`/communities/${community._id}`}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
                            >
                                <div className="h-32 bg-gradient-to-r from-primary-500 to-blue-600 relative">
                                    <div className="absolute inset-0 bg-black/10" />
                                    <div className="absolute top-4 right-4">
                                        {community.type === 'private' ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-black/20 backdrop-blur text-xs font-medium text-white border border-white/20">
                                                <Lock className="h-3 w-3 mr-1" /> Private
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-medium text-white border border-white/20">
                                                <Globe className="h-3 w-3 mr-1" /> Public
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 pt-0 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="-mt-10">
                                            {community.creator?.avatar ? (
                                                <img src={community.creator.avatar} alt={community.creator.firstName} className="w-20 h-20 rounded-2xl border-4 border-white shadow-md object-cover bg-white" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-white flex items-center justify-center">
                                                    <div className="w-full h-full bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-2xl">
                                                        {community.name?.[0] || 'C'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {community.category || 'General'}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                        {community.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow">{community.description}</p>

                                    <div className="pt-4 border-t border-gray-100 mt-auto">
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center"><Users className="h-4 w-4 mr-1.5" />{community.memberCount || 0} members</div>
                                            <div className="flex items-center"><MessageSquare className="h-4 w-4 mr-1.5" />Active</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <span className="text-xs text-gray-500 mr-2">Created by</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {community.creator?.firstName} {community.creator?.lastName}
                                                </span>
                                            </div>
                                            <span className="text-primary-600 group-hover:translate-x-1 transition-transform">
                                                <ArrowRight className="h-5 w-5" />
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
                            <Users className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No communities yet</h3>
                        <p className="text-gray-600 max-w-md mx-auto">Be the first to create one!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
