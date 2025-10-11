import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import { useAuth } from './contexts/AuthContext';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Public Pages
import CommunityDetail from './pages/Communities/CommunityDetail';
import CommunityList from './pages/Communities/CommunityList';
import CourseCatalog from './pages/Courses/CourseCatalog';
import CourseDetail from './pages/Courses/CourseDetail';
import Home from './pages/Home/Home';

// Student Pages
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import MyCommunities from './pages/Student/MyCommunities';
import MyCourses from './pages/Student/MyCourses';
import VideoPlayer from './pages/Student/VideoPlayer';

// Creator Pages
import Analytics from './pages/Creator/Analytics';
import CreateCommunity from './pages/Creator/CreateCommunity';
import CreateCourse from './pages/Creator/CreateCourse';
import EditCommunity from './pages/Creator/EditCommunity';
import CreateEvent from './pages/Creator/CreateEvent';
import CreatePost from './pages/Creator/CreatePost';
import ManageCommunities from './pages/Creator/ManageCommunities';
import ManageCourses from './pages/Creator/ManageCourses';
import UploadVideo from './pages/Creator/UploadVideo';
import VideoUploadPage from './pages/Creator/VideoUploadPage';
import CourseVideos from './pages/Creator/CourseVideos';
import CreatorDashboard from './pages/Dashboard/CreatorDashboard';
import EditCourse from './pages/Creator/EditCourse';
// Common Pages
import NotFound from './pages/NotFound/NotFound';
import Profile from './pages/Profile/Profile';
import Search from './pages/Search/Search';
import Settings from './pages/Settings/Settings';

// Loading component
import LoadingSpinner from './components/UI/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<CourseCatalog />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="communities" element={<CommunityList />} />
          <Route path="communities/:id" element={<CommunityDetail />} />
          <Route path="search" element={<Search />} />
        </Route>

        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
        />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Dashboard Routes */}
          <Route 
            path="dashboard" 
            element={
              user?.role === 'creator' ? 
                <CreatorDashboard /> : 
                <StudentDashboard />
            } 
          />

          {/* Student Routes */}
          <Route path="my-courses" element={
            <ProtectedRoute requiredRole="student">
              <MyCourses />
            </ProtectedRoute>
          } />
          <Route path="my-communities" element={
            <ProtectedRoute requiredRole="student">
              <MyCommunities />
            </ProtectedRoute>
          } />
          <Route path="watch/:videoId" element={
            <ProtectedRoute requiredRole="student">
              <VideoPlayer />
            </ProtectedRoute>
          } />

          {/* Creator Routes */}
          <Route path="create-course" element={
            <ProtectedRoute requiredRole="creator">
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="manage-courses" element={
            <ProtectedRoute requiredRole="creator">
              <ManageCourses />
            </ProtectedRoute>
          } />
          <Route path="edit-course/:courseId" element={
            <ProtectedRoute requiredRole="creator">
              <EditCourse />
            </ProtectedRoute>
          } />
          <Route path="create-community" element={
            <ProtectedRoute requiredRole="creator">
              <CreateCommunity />
            </ProtectedRoute>
          } />
          <Route path="communities/:id/create-post" element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          } />
          <Route path="communities/:id/create-event" element={
            <ProtectedRoute requiredRole="creator">
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="manage-communities" element={
            <ProtectedRoute requiredRole="creator">
              <ManageCommunities />
            </ProtectedRoute>
          } />
          <Route path="edit-community/:communityId" element={
            <ProtectedRoute requiredRole="creator">
              <EditCommunity />
            </ProtectedRoute>
          } />
          <Route path="upload-video" element={
            <ProtectedRoute requiredRole="creator">
              <UploadVideo />
            </ProtectedRoute>
          } />
          <Route path="creator/upload-video" element={
            <ProtectedRoute requiredRole="creator">
              <UploadVideo />
            </ProtectedRoute>
          } />
          <Route path="creator/courses/:courseId/videos" element={
            <ProtectedRoute requiredRole="creator">
              <CourseVideos />
            </ProtectedRoute>
          } />
          <Route path="analytics" element={
            <ProtectedRoute requiredRole="creator">
              <Analytics />
            </ProtectedRoute>
          } />

          {/* Common Protected Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
