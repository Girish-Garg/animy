import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, Maximize, Minimize, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import gsap from 'gsap';

const OpenPlayVideo = ({ 
  isOpen, 
  video, 
  onClose,
  playlist = [], // Array of videos for playlist functionality
  currentIndex = 0,
  onVideoChange = null, // Callback when video changes in playlist
  autoPlay = true,
  showPlaylist = false
}) => {
  const overlayRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Hide controls after 3 seconds of inactivity
  const controlsTimeoutRef = useRef(null);

  // Animation for entrance
  useEffect(() => {
    if (isOpen && overlayRef.current) {
      // Reset position for animation
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      
      // Animate overlay in
      gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  }, [isOpen]);

  // Auto-hide controls
  useEffect(() => {
    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (isOpen) {
      resetControlsTimeout();
      return () => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [isOpen, isPlaying]);

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
      
      // Auto-play if enabled
      if (autoPlay) {
        videoElement.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          setIsPlaying(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next video if in playlist
      if (playlist.length > 1 && currentIndex < playlist.length - 1 && onVideoChange) {
        onVideoChange(currentIndex + 1);
      }
    };

    const handleError = () => {
      setError('Failed to load video');
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setError(null);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [video, playlist.length, currentIndex, onVideoChange]);

  // Handle play/pause
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || isLoading) return;

    if (isPlaying && videoElement.paused) {
      videoElement.play().catch(() => {
        setIsPlaying(false);
      });
    } else if (!isPlaying && !videoElement.paused) {
      videoElement.pause();
    }
  }, [isPlaying, isLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'Escape':
          e.preventDefault();
          if (isFullscreen) {
            exitFullscreen();
          } else {
            handleClose();
          }
          break;
        case 'ArrowLeft':
          seekBackward();
          break;
        case 'ArrowRight':
          seekForward();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, isFullscreen]);

  const handleClose = () => {
    // Stop the video first
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    
    // Animate out and close
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          onClose();
        }
      });
    } else {
      // Fallback if GSAP fails
      onClose();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const seekToTime = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const seekForward = () => {
    seekToTime(Math.min(duration, currentTime + 10));
  };

  const seekBackward = () => {
    seekToTime(Math.max(0, currentTime - 10));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      overlayRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekToTime(newTime);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  if (!isOpen || !video) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        // Close if clicking on the background (not on video or controls)
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      {/* Video Element */}
      <div className="relative w-full max-w-6xl h-full">
        <video
          ref={videoRef}
          src={video.path || video.videoPath}
          poster={video.thumbnailPath}
          className="w-full h-full object-cover"
          muted={isMuted}
          onClick={togglePlayPause}
          autoPlay={autoPlay}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 font-medium mb-2">Failed to load video</p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-lg font-medium truncate">{video.title || video.name || 'Video'}</h3>
                {playlist.length > 1 && (
                  <p className="text-sm text-gray-300">
                    {currentIndex + 1} of {playlist.length}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="rounded-full p-2 bg-transparent hover:bg-zinc-500/50 text-gray-200 hover:text-white hover:cursor-pointer transition-colors z-50 relative"
                aria-label="Close"
                type="button"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Center Play Button (when paused) */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlayPause}
                className="w-20 h-20 rounded-full bg-black/70 hover:bg-black/80 flex items-center justify-center transition-colors"
              >
                <Play size={32} className="text-white ml-1" />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6">
            {/* Progress Bar */}
            <div 
              className="w-full h-2 bg-gray-600 rounded-full mb-6 cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-blue-500 rounded-full transition-all group-hover:bg-blue-400"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-blue-400 transition-colors hover:cursor-pointer"
                >
                  {isPlaying ? <Pause size={28} /> : <Play size={28} />}
                </button>

                {/* Previous/Next (if playlist) */}
                {playlist.length > 1 && (
                  <>
                    <button
                      onClick={() => onVideoChange && onVideoChange(Math.max(0, currentIndex - 1))}
                      disabled={currentIndex === 0}
                      className="text-white hover:cursor-pointer hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipBack size={24} />
                    </button>
                    <button
                      onClick={() => onVideoChange && onVideoChange(Math.min(playlist.length - 1, currentIndex + 1))}
                      disabled={currentIndex === playlist.length - 1}
                      className="text-white hover:cursor-pointer hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <SkipForward size={24} />
                    </button>
                  </>
                )}

                {/* Time */}
                <span className="text-white text-base font-mono">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-5">
                {/* Restart */}
                <button
                  onClick={() => seekToTime(0)}
                  className="text-white hover:text-blue-400 transition-colors hover:cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw size={24} />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors hover:cursor-pointer"
                >
                  {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpenPlayVideo;
