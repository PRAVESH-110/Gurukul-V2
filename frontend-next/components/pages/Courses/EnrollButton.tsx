'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Share2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { courseAPI, userAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface EnrollButtonProps {
  courseId: string;
  isEnrolledInitial: boolean;
  variant?: 'sidebar' | 'mobile'; // sidebar = full card, mobile = compact
}

/**
 * Client island: enroll / unenroll button + wishlist/share.
 * Everything else on CourseDetail is server-rendered.
 */
const EnrollButton = ({ courseId, isEnrolledInitial, variant = 'sidebar' }: EnrollButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEnrolled, setIsEnrolled] = useState(isEnrolledInitial);
  const [isLoading, setIsLoading] = useState(false);
  const { data: currentCourse } = useQuery({
    queryKey: ['course-auth-state', courseId],
    queryFn: () => courseAPI.getCourse(courseId),
    enabled: !!user,
    staleTime: 30_000,
  });
  const resolvedIsEnrolled = currentCourse?.data?.course?.isEnrolled ?? isEnrolled;
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userAPI.getWishlist,
    enabled: !!user,
    staleTime: 30_000,
  });
  const isWishlisted = wishlistData?.data?.courses?.some(
    (course: { _id: string }) => course._id === courseId,
  );
  const wishlistMutation = useMutation({
    mutationFn: () => userAPI.toggleWishlist(courseId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
    onError: (error: Error) => toast.error(error.message || 'Unable to update wishlist'),
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseAPI.enrollInCourse(courseId),
    onSuccess: (response) => {
      toast.success(response?.data?.message || 'Successfully enrolled!');
      setIsEnrolled(true);
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-auth-state', courseId] });
      queryClient.invalidateQueries({ queryKey: ['myCourses'] });
      setIsLoading(false);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll');
      setIsLoading(false);
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: () => courseAPI.unenrollfromcourse(courseId),
    onSuccess: (response) => {
      toast.success(response?.data?.message || 'Successfully unenrolled!');
      setIsEnrolled(false);
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['course-auth-state', courseId] });
      queryClient.invalidateQueries({ queryKey: ['myCourses'] });
      setIsLoading(false);
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Failed to unenroll');
      setIsLoading(false);
    },
  });

  const handleEnroll = () => {
    setIsLoading(true);
    enrollMutation.mutate();
  };
  const handleUnenroll = () => {
    setIsLoading(true);
    unenrollMutation.mutate();
  };

  if (!user) {
    return (
      <div className="space-y-3">
        <Link href="/register" className="w-full btn-primary block text-center text-lg py-3">
          Sign up to Enroll
        </Link>
        <Link href="/login" className="w-full btn-outline block text-center">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resolvedIsEnrolled ? (
        <button className="w-full btn-danger" onClick={handleUnenroll} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Unenroll'}
        </button>
      ) : (
        <button
          className={`w-full btn-primary ${variant === 'sidebar' ? 'text-lg py-3' : ''}`}
          onClick={handleEnroll}
          disabled={isLoading}
        >
          {isLoading ? 'Enrolling...' : 'Enroll Now'}
        </button>
      )}

      {variant === 'sidebar' && (
        <div className="flex gap-2">
          <button
            className="flex-1 btn-outline flex items-center justify-center gap-1"
            onClick={() => wishlistMutation.mutate()}
            disabled={wishlistMutation.isPending}
          >
            <Heart className={`h-3 w-3 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />{' '}
            {isWishlisted ? 'Saved' : 'Wishlist'}
          </button>
          <button
            className="flex-1 btn-outline flex items-center justify-center gap-1"
            onClick={async () => {
              await navigator.clipboard?.writeText(window.location.href);
              toast.success('Course link copied');
            }}
          >
            <Share2 className="h-3 w-3" /> Share
          </button>
        </div>
      )}
    </div>
  );
};

export default EnrollButton;
