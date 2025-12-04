'use client';
import { useAuth } from '@/context/AuthContext';
import StudentDashboard from '@/components/pages/Dashboard/StudentDashboard';
import CreatorDashboard from '@/components/pages/Dashboard/CreatorDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) return null;

    return user.role === 'creator' ? <CreatorDashboard /> : <StudentDashboard />;
}
