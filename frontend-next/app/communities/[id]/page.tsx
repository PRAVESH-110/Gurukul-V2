import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Globe, Lock, Users, MessageSquare, Calendar } from 'lucide-react';
import { serverGet } from '@/lib/serverFetch';
import CommunityActions from '@/components/pages/Communities/CommunityActions';

interface Member { user: string | { _id: string } }
interface Community {
    _id: string; name: string; description?: string; type?: 'public' | 'private';
    category?: string; memberCount?: number; createdAt?: string;
    creator?: { _id?: string; firstName?: string; lastName?: string; avatar?: string };
    members?: Member[];
}
interface CommunityResponse { data: { community: Community } }
interface PostsResponse { data: { posts: unknown[] } }

interface PageProps { params: Promise<{ id: string }> }

export default async function CommunityDetailPage(props: PageProps) {
    const params = await props.params;
    const data = await serverGet<CommunityResponse>(`/communities/${params.id}`, { revalidate: 60 });
    const community = data?.data?.community;
    if (!community) notFound();

    return (
        <div className="min-h-screen bg-gray-50/50 font-sans pb-12">
            {/* Hero — fully server-rendered */}
            <div className="bg-white border-b border-gray-200">
                <div className="h-48 md:h-64 bg-gradient-to-r from-primary-600 to-blue-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative -mt-16 md:-mt-20 mb-8 flex flex-col md:flex-row items-start md:items-end gap-6">
                        {/* Avatar */}
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-lg bg-white flex items-center justify-center flex-shrink-0">
                            {community.creator?.avatar ? (
                                <img src={community.creator.avatar} alt={community.name} className="w-full h-full rounded-xl object-cover" />
                            ) : (
                                <div className="w-full h-full bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold text-4xl">
                                    {community.name?.[0] || 'C'}
                                </div>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="flex-1 pb-4">
                            <div className="mb-4">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{community.name}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                        {community.type === 'private'
                                            ? <><Lock className="h-4 w-4 mr-1.5" />Private Group</>
                                            : <><Globe className="h-4 w-4 mr-1.5 text-green-500" />Public Group</>}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span className="flex items-center"><Users className="h-4 w-4 mr-1.5" />{community.memberCount || 0} members</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {community.category || 'General'}
                                    </span>
                                </div>
                            </div>

                            {/* Client island: join button + share + manage */}
                            <CommunityActions
                                communityId={params.id}
                                communityType={community.type ?? 'public'}
                                creatorId={community.creator?._id ?? ''}
                                isMemberInitial={false}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main: tabs + posts (client island handles this since posts need auth) */}
                    <div className="lg:col-span-2">
                        {/* CommunityActions renders tabs + posts/events inside itself */}
                    </div>

                    {/* Sidebar — server-rendered static about card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">About Community</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-6">{community.description}</p>
                            <div className="space-y-4 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Created</span>
                                    <span className="font-medium text-gray-900">
                                        {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Privacy</span>
                                    <span className="font-medium text-gray-900 capitalize">{community.type}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500">Category</span>
                                    <span className="font-medium text-gray-900">{community.category || 'General'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Creator card — server-rendered */}
                        {community.creator && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4 text-lg">Community Admin</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                                        {community.creator.avatar ? (
                                            <img src={community.creator.avatar} alt={`${community.creator.firstName} ${community.creator.lastName}`} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 font-bold">
                                                {community.creator.firstName?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{community.creator.firstName} {community.creator.lastName}</h4>
                                        <p className="text-xs text-gray-500">Creator</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}