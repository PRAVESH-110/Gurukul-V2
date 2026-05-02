'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useCallback } from 'react';

const categories = [
    'Programming', 'Design', 'Business', 'Marketing',
    'Data Science', 'Photography', 'Music', 'Language'
];

/**
 * Client island: search + filter + sort bar for the courses catalog.
 * On change it updates URL search params so the RSC page refetches.
 */
const CourseFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? '');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') ?? 'popular');

    const push = useCallback(
        (search: string, category: string, sort: string) => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (category) params.set('category', category);
            if (sort && sort !== 'popular') params.set('sort', sort);
            router.push(`/courses?${params.toString()}`);
        },
        [router]
    );

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-10 sticky top-4 z-30 backdrop-blur-xl bg-white/90 supports-[backdrop-filter]:bg-white/60">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for courses..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            push(e.target.value, selectedCategory, sortBy);
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200"
                    />
                </div>

                {/* Category Filter */}
                <div className="relative min-w-[200px]">
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            push(searchTerm, e.target.value, sortBy);
                        }}
                        className="w-full appearance-none px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 cursor-pointer"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
                </div>

                {/* Sort */}
                <div className="relative min-w-[200px]">
                    <select
                        value={sortBy}
                        onChange={(e) => {
                            setSortBy(e.target.value);
                            push(searchTerm, selectedCategory, e.target.value);
                        }}
                        className="w-full appearance-none px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 cursor-pointer"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="newest">Newest</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseFilters;
