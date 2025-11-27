import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { videoAPI, courseAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, BookOpen, CheckCircle, Settings, Monitor, ChevronLeft, ChevronRight, Clock, FileText } from 'lucide-react';
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
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  if (videoError || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-md mx-4">
          <p className="text-red-400 text-lg font-medium mb-4">Failed to load video</p>
          <Link to="/dashboard" className="btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-white">
      <style>{sliderStyles}</style>

      {/* Top Navigation Bar */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to={course ? `/courses/${course._id}` : '/my-courses'}
            className="flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span className="font-medium">Back to Course</span>
          </Link>
          <div className="text-sm font-medium text-gray-400 hidden md:block">
            {course?.title}
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Container */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative group">
              <div className="aspect-video relative">
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

              {/* Custom Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 py-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* Progress Bar */}
                <div className="mb-4 group/slider relative h-4 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={seeking ? undefined : (playedSeconds / duration) * 100 || 0}
                    onChange={handleSeekChange}
                    onMouseDown={handleSeekMouseDown}
                    onMouseUp={handleSeekMouseUp}
                    className="w-full bg-white/20 rounded-lg appearance-none cursor-pointer video-slider h-1 group-hover/slider:h-2 transition-all"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(playedSeconds / duration) * 100 || 0}%, rgba(255,255,255,0.2) ${(playedSeconds / duration) * 100 || 0}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setPlaying(!playing)}
                      className="text-white hover:text-primary-400 transition-colors p-1"
                    >
                      {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
                    </button>

                    <div className="flex items-center space-x-2 group/volume">
                      <button
                        onClick={() => setMuted(!muted)}
                        className="text-white hover:text-primary-400 transition-colors p-1"
                      >
                        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={muted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setMuted(false);
                        }}
                        className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="text-sm font-medium text-gray-300">
                      {formatTime(playedSeconds)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="relative group/settings">
                      <button className="text-white hover:text-primary-400 transition-colors p-1">
                        <Settings className="h-5 w-5" />
                      </button>

                      {/* Settings Menu */}
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-xl p-2 hidden group-hover/settings:block">
                        <div className="space-y-2">
                          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Speed</div>
                          <div className="flex flex-wrap gap-1 px-2">
                            {speedOptions.map(speed => (
                              <button
                                key={speed.value}
                                onClick={() => handleSpeedChange(speed.value)}
                                className={`px-2 py-1 text-xs rounded ${playbackRate === speed.value ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                              >
                                {speed.label}
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-gray-700 my-2"></div>

                          <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quality</div>
                          <div className="flex flex-col px-2">
                            {availableQualities.map(quality => (
                              <button
                                key={quality.value}
                                onClick={() => handleQualityChange(quality.value)}
                                className={`px-2 py-1.5 text-xs rounded text-left flex items-center justify-between ${selectedQuality === quality.value ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                              >
                                <span>{quality.label}</span>
                                {selectedQuality === quality.value && <CheckCircle className="h-3 w-3" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="text-white hover:text-primary-400 transition-colors p-1">
                      <Maximize className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
                  <p className="text-gray-400 leading-relaxed">{video.description}</p>
                </div>
                {progress >= 90 && (
                  <div className="flex items-center text-green-400 bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-500/10 rounded-lg">
                    <Monitor className="h-5 w-5 text-primary-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Your Progress</div>
                    <div className="font-bold text-white">{progress}% Complete</div>
                  </div>
                </div>
                <div className="w-1/3 max-w-xs">
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {currentVideoIndex > 0 ? (
                <Link
                  to={`/watch/${videos[currentVideoIndex - 1]._id}`}
                  className="flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors border border-gray-700"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  <div>
                    <div className="text-xs text-gray-400">Previous</div>
                    <div className="font-medium">Previous Video</div>
                  </div>
                </Link>
              ) : <div></div>}

              {currentVideoIndex < videos.length - 1 && (
                <Link
                  to={`/watch/${videos[currentVideoIndex + 1]._id}`}
                  className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-lg shadow-primary-600/20"
                >
                  <div className="text-right">
                    <div className="text-xs text-primary-200">Next</div>
                    <div className="font-medium">Next Video</div>
                  </div>
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]">
              <div className="p-4 border-b border-gray-700 bg-gray-800/95 backdrop-blur z-10">
                <h3 className="font-bold text-white flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary-400" />
                  Course Content
                </h3>
                <div className="text-sm text-gray-400 mt-1">
                  {videos.length} videos • {Math.round(videos.reduce((acc, v) => acc + (v.duration || 0), 0) / 60)} mins total
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                {videos.length > 0 ? (
                  videos.map((v, index) => (
                    <Link
                      key={v._id}
                      to={`/watch/${v._id}`}
                      className={`flex items-start p-3 rounded-xl transition-all duration-200 group ${v._id === videoId
                          ? 'bg-primary-600/10 border border-primary-500/50'
                          : 'hover:bg-gray-700/50 border border-transparent'
                        }`}
                    >
                      <div className="flex-shrink-0 mt-1 mr-3">
                        {v._id === videoId ? (
                          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <Play className="h-3 w-3 text-white fill-current" />
                          </div>
                        ) : v.progress >= 90 ? (
                          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-400 group-hover:bg-gray-600 group-hover:text-white transition-colors">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-medium mb-1 leading-snug ${v._id === videoId ? 'text-primary-400' : 'text-gray-300 group-hover:text-white'
                          }`}>
                          {v.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {v.duration || '0:00'}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>No videos available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
