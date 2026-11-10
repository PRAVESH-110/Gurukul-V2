import CommunityDetail from '@/components/pages/Communities/CommunityDetail';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function CommunityDetailPage() {
  return (
    <ProtectedRoute>
      <CommunityDetail />
    </ProtectedRoute>
  );
}
