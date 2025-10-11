import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { videoAPI, courseAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, BookOpen, CheckCircle, Settings, Monitor } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

// Custom CSS for video controls
const sliderStyles = `
  .video-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    outline: none;
    transition: background 0.3s;
  }
  
  .video-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .video-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
`;

const VideoPlayer = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [playerRef, setPlayerRef] = useState(null);

  // Available quality options
  const qualityOptions = [
    { value: 'auto', label: 'Auto' },
    { value: '1080p', label: '1080p HD' },
    { value: '720p', label: '720p HD' },
    { value: '480p', label: '480p' },
    { value: '360p', label: '360p' }
  ];

  // Available speed options
  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
  ];

  const { data: videoData, isLoading: videoLoading, error: videoError } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoAPI.getVideo(videoId),
    enabled: !!videoId
  });

  const { data: courseData } = useQuery({
    queryKey: ['course', videoData?.data?.video?.course],
    queryFn: () => courseAPI.getCourse(videoData.data.video.course),
    enabled: !!videoData?.data?.video?.course
  });

  const { data: courseVideos } = useQuery({
    queryKey: ['courseVideos', videoData?.data?.video?.course],
    queryFn: () => courseAPI.getCourseVideos(videoData.data.video.course),
    enabled: !!videoData?.data?.video?.course
  });

  const video = videoData?.data?.video;
  const course = courseData?.data?.course;
  const videos = courseVideos?.data?.videos || [];
  const currentVideoIndex = videos.findIndex(v => v._id === videoId);

  // Helper function to get video URL based on quality
  const getVideoUrl = (quality = 'auto') => {
    if (!video) return null;
    
    // If video has multiple quality URLs, select based on quality
    if (video.qualities && video.qualities[quality]) {
      return video.qualities[quality];
    }
    
    // Fallback to default video URL or streaming URL
    return video.videoUrl || video.url || videoAPI.getVideoStream(videoId);
  };

  // Filter available qualities based on what's actually available for this video
  const getAvailableQualities = () => {
    if (!video || !video.qualities) {
      return qualityOptions.filter(q => q.value === 'auto');
    }
    
    return qualityOptions.filter(q => 
      video.qualities[q.value] && video.qualities[q.value] !== null
    );
  };

  const availableQualities = getAvailableQualities();

  // Handle quality change
  const handleQualityChange = (newQuality) => {
    setSelectedQuality(newQuality);
    // Video will automatically reload with new URL due to ReactPlayer prop change
  };

  // Handle playback rate change
  const handleSpeedChange = (newSpeed) => {
    setPlaybackRate(newSpeed);
  };

  // Handle seeking in the video
  const handleSeekChange = (e) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (playerRef) {
      setSeeking(true);
      playerRef.seekTo(seekTime, 'seconds');
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
  };

  // Update watch progress
  const updateProgress = async (progressPercent) => {
    if (progressPercent > progress) {
      try {
        await videoAPI.updateWatchProgress(videoId, progressPercent);
        setProgress(progressPercent);
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }
  };

  const handleProgress = (state) => {
    const progressPercent = Math.round(state.played * 100);
    setPlayedSeconds(state.playedSeconds);
    
    // Update progress every 10% or when video completes
    if (progressPercent > progress && (progressPercent % 10 === 0 || progressPercent >= 90)) {
      updateProgress(progressPercent);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (videoLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (videoError || !video) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load video</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <style>{sliderStyles}</style>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-3">
          {/* Back Navigation */}
          <div className="mb-4">
            <Link
              to={course ? `/courses/${course._id}` : '/my-courses'}
              className="inline-flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {course ? course.title : 'My Courses'}
            </Link>
          </div>

          {/* Video Container */}
          <div className="bg-black rounded-lg overflow-hidden mb-6">
            <div className="aspect-video">
              <ReactPlayer
                ref={setPlayerRef}
                url={getVideoUrl(selectedQuality)}
                width="100%"
                height="100%"
                playing={playing}
                volume={volume}
                muted={muted}
                playbackRate={playbackRate}
                onProgress={handleProgress}
                onDuration={setDuration}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                controls={false}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload'
                    }
                  }
                }}
              />
            </div>
            
            {/* Custom Video Controls */}
            <div className="bg-gray-900 bg-opacity-90 text-white px-4 py-2 space-y-2">
              {/* Progress Bar */}
              <div className="px-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={seeking ? undefined : (playedSeconds / duration) * 100 || 0}
                  onChange={handleSeekChange}
                  onMouseDown={handleSeekMouseDown}
                  onMouseUp={handleSeekMouseUp}
                  className="w-full bg-gray-600 rounded-lg appearance-none cursor-pointer video-slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(playedSeconds / duration) * 100 || 0}%, #4b5563 ${(playedSeconds / duration) * 100 || 0}%, #4b5563 100%)`
                  }}
                />
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between px-2">
              {/* Play/Pause and Basic Controls */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPlaying(!playing)}
                  className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
                >
                  {playing ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                  )}
                </button>
                
                <button
                  onClick={() => setMuted(!muted)}
                  className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
                >
                  {muted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{formatTime(playedSeconds)}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-sm">{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Quality and Speed Controls */}
              <div className="flex items-center space-x-4">
                {/* Playback Speed Selector */}
                <div className="relative">
                  <select
                    value={playbackRate}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm px-3 py-2 rounded border-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 appearance-none cursor-pointer"
                  >
                    {speedOptions.map(speed => (
                      <option key={speed.value} value={speed.value} className="text-gray-900">
                        {speed.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Quality Selector */}
                <div className="relative">
                  <select
                    value={selectedQuality}
                    onChange={(e) => handleQualityChange(e.target.value)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-sm px-3 py-2 rounded border-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 appearance-none cursor-pointer"
                  >
                    {availableQualities.map(quality => (
                      <option key={quality.value} value={quality.value} className="text-gray-900">
                        {quality.label}
                      </option>
                    ))}
                  </select>
                  <Monitor className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
                
                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-colors"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* Video Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {video.title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {video.description}
                </p>
              </div>
              
              {progress >= 90 && (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Your Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Video Details */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Duration: {formatTime(duration)}</span>
              <span>Watched: {formatTime(playedSeconds)}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {currentVideoIndex > 0 && (
              <Link
                to={`/watch/${videos[currentVideoIndex - 1]._id}`}
                className="btn-outline"
              >
                Previous Video
              </Link>
            )}
            
            {currentVideoIndex < videos.length - 1 && (
              <Link
                to={`/watch/${videos[currentVideoIndex + 1]._id}`}
                className="btn-primary ml-auto"
              >
                Next Video
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
            <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
            
            {videos.length > 0 ? (
              <div className="space-y-2">
                {videos.map((v, index) => (
                  <Link
                    key={v._id}
                    to={`/watch/${v._id}`}
                    className={`block p-3 rounded-lg border transition-colors ${
                      v._id === videoId
                        ? 'bg-primary-50 border-primary-200'
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        v._id === videoId
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          v._id === videoId ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {v.title}
                        </p>
                        <div className="flex items-center mt-1">
                          <Play className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {v.duration || '0:00'}
                          </span>
                          {v.progress >= 90 && (
                            <CheckCircle className="h-3 w-3 text-green-500 ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No videos available</p>
            )}

            {course && (
              <div className="mt-6 pt-6 border-t">
                <Link
                  to={`/courses/${course._id}`}
                  className="flex items-center text-primary-600 hover:text-primary-700 text-sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Course Details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
