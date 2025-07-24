import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, MoreVertical, Edit3, Trash2, Download } from 'lucide-react';
import gsap from 'gsap';
import { apiUtils } from '@/lib/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import OpenPlayVideo from './OpenPlayVideo';

const OpenAlbumOverlay = ({ 
  isOpen, 
  album, 
  onClose, 
  onBackToAlbums 
}) => {
  const contentRef = useRef(null);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const [openVideoDropdownId, setOpenVideoDropdownId] = useState(null);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingVideoName, setEditingVideoName] = useState('');
  const [videoBlurEnabled, setVideoBlurEnabled] = useState(true);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [albumData, setAlbumData] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingVideoId, setDeletingVideoId] = useState(null);
  const [renamingVideoId, setRenamingVideoId] = useState(null);

  // Function to fetch album details and videos
  const fetchAlbumVideos = async () => {
    if (!album?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiUtils.get(`/album/${album.id}`);

      if (response.data.success) {
        setAlbumData(response.data.album);
        // Transform videos to match component structure
        const transformedVideos = response.data.album.videos.map(video => ({
          id: video._id || Math.random().toString(36),
          path: video.videoPath,
          title: video.name,
          thumbnailPath: video.thumbnailPath
        }));
        setVideos(transformedVideos);
      } else {
        setError('Failed to fetch album videos');
        toast.error('Failed to load album videos');
      }
    } catch (err) {
      setError('Failed to fetch album videos. Please try again.');
      toast.error('Failed to load album videos. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a video
  const handleDeleteVideo = async (video) => {
    if (!album?.id || !video?.id) return;
    
    setDeletingVideoId(video.id);
    
    try {
      const response = await apiUtils.delete(`/album/${album.id}/video/${video.id}`);

      if (response.data.success) {
        // Update the album data and videos from the response
        setAlbumData(response.data.album);
        
        // Transform the updated videos
        const transformedVideos = response.data.album.videos.map(video => ({
          id: video._id || Math.random().toString(36),
          path: video.videoPath,
          title: video.name,
          thumbnailPath: video.thumbnailPath
        }));
        setVideos(transformedVideos);
        
        // Close the video player if the deleted video was being played
        if (selectedVideo?.id === video.id) {
          setShowVideoPlayer(false);
          setSelectedVideo(null);
        }
      } else {
        toast.error('Failed to delete video. Please try again.');
      }
    } catch (err) {
      toast.error('Failed to delete video. Please try again.');
    } finally {
      setDeletingVideoId(null);
      setOpenVideoDropdownId(null);
    }
  };

  // Fetch album videos when component opens or album changes
  useEffect(() => {
    if (isOpen && album?.id) {
      fetchAlbumVideos();
    }
  }, [isOpen, album?.id]);

  // Animation for entrance
  useEffect(() => {
    if (isOpen && contentRef.current && !loading) {
      // Reset position for animation
      gsap.set(contentRef.current, { y: 30, scale: 0.97, autoAlpha: 0 });

      // Get all cards to animate them in staggered sequence
      const cards = contentRef.current.querySelectorAll('.album-card');

      // Animate overlay in
      const tl = gsap.timeline();

      // Animate in the main container
      tl.to(contentRef.current, {
        y: 0,
        scale: 1,
        autoAlpha: 1,
        duration: 0.5,
        ease: 'back.out(1.2)'
      });

      // Only animate cards if they exist
      if (cards.length > 0) {
        tl.fromTo(cards,
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.05,
            duration: 0.4,
            ease: 'power2.out'
          },
          '-=0.1'
        );
      }
    }
  }, [isOpen, loading]);

  const handleBackToAlbums = () => {
    // Create animation for transitioning back to albums view
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: onBackToAlbums
    });
  };

  const handleRenameVideo = (video) => {
    // Don't allow renaming if another video is being renamed or deleted
    if (renamingVideoId || deletingVideoId) return;
    
    setEditingVideoId(video.id);
    setEditingVideoName(video.title || `Video ${videos.findIndex(v => v.id === video.id) + 1}`);
    setOpenVideoDropdownId(null);
    setVideoBlurEnabled(false); // Disable blur temporarily

    // Focus the input after state update and re-enable blur after a delay
    setTimeout(() => {
      const input = document.querySelector(`input[data-video-id="${video.id}"]`);
      if (input) {
        input.focus();
        input.select();
        // Re-enable blur after input is focused and stable
        setTimeout(() => setVideoBlurEnabled(true), 200);
      }
    }, 0);
  };

  const handleSaveVideoName = async (videoId) => {
    if (editingVideoName.trim()) {
      // Set loading state for this specific video
      setRenamingVideoId(videoId);
      
      // Optimistic update - update UI immediately
      const originalVideos = [...videos];
      const optimisticVideos = videos.map(video => 
        video.id === videoId 
          ? { ...video, title: editingVideoName.trim() }
          : video
      );
      setVideos(optimisticVideos);
      
      // Exit editing mode immediately for better UX
      setEditingVideoId(null);
      setEditingVideoName('');
      setVideoBlurEnabled(true);
      
      try {
        const response = await apiUtils.patch(
          `/album/${album.id}/video/${videoId}/rename`,
          { newVideoName: editingVideoName.trim() }
        );

        if (response.data.success) {
          // Update the album data and videos from the response
          setAlbumData(response.data.album);
          
          // Transform the updated videos
          const transformedVideos = response.data.album.videos.map(video => ({
            id: video._id || Math.random().toString(36),
            path: video.videoPath,
            title: video.name,
            thumbnailPath: video.thumbnailPath
          }));
          setVideos(transformedVideos);
          
          // Update the selected video if it was the one being renamed
          if (selectedVideo?.id === videoId) {
            const updatedVideo = transformedVideos.find(v => v.id === videoId);
            if (updatedVideo) {
              setSelectedVideo(updatedVideo);
            }
          }
        } else {
          // Revert optimistic update on failure
          setVideos(originalVideos);
          toast.error('Failed to rename video. Please try again.');
        }
      } catch (err) {
        setVideos(originalVideos);
        toast.error('Failed to rename video. Please try again.');
      } finally {
        setRenamingVideoId(null);
      }
    } else {
      // Just exit editing mode if name is empty
      setEditingVideoId(null);
      setEditingVideoName('');
      setVideoBlurEnabled(true);
    }
  };

  const handleCancelVideoEdit = () => {
    setEditingVideoId(null);
    setEditingVideoName('');
    setVideoBlurEnabled(true);
  };

  const handleDownloadVideo = async (video) => {
    if (!video?.path) {
      toast.error('Video file not available for download');
      return;
    }

    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = video.path;
      link.download = `${video.title || 'video'}.mp4`; // Default to .mp4 extension
      link.target = '_blank';
      
      // Append to body temporarily
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
    } catch (err) {
      toast.error('Failed to download video. Please try again.');
    }
  };

  const handleVideoClick = (video, index) => {
    setSelectedVideo(video);
    setCurrentVideoIndex(index);
    setShowVideoPlayer(true);
  };

  const handleVideoChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < videos.length) {
      setCurrentVideoIndex(newIndex);
      setSelectedVideo(videos[newIndex]);
    }
  };

  if (!isOpen || !album) return null;

  return (
    <>
      <OpenPlayVideo
        isOpen={showVideoPlayer}
        video={selectedVideo}
        onClose={() => setShowVideoPlayer(false)}
        playlist={videos}
        currentIndex={currentVideoIndex}
        onVideoChange={handleVideoChange}
        autoPlay={true}
        showPlaylist={videos.length > 1}
      />
      <div ref={contentRef} className="w-full h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blue-900/40 bg-gradient-to-r from-[#001138]/90 to-[#0c1d43]/90 backdrop-blur-md p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToAlbums}
            className="rounded-full p-1.5 bg-blue-900/30 hover:bg-blue-800/50 text-gray-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:cursor-pointer"
            aria-label="Back to Albums"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-medium text-white tracking-tight truncate">
            {albumData?.name || album?.albumName || "Album"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <div className="py-2 px-3 bg-blue-900/30 text-xs font-medium text-blue-200 rounded-full">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 bg-blue-900/30 hover:bg-blue-800/50 hover:bg-opacity-70 text-gray-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Videos Content */}
      <div className="p-4 sm:p-6">
        {/* Loading State */}
        {loading && (
          <div className="flex h-full w-full items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 text-sm">Loading videos...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-900/30 flex items-center justify-center">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 font-medium">Error loading videos</p>
              <button
                onClick={fetchAlbumVideos}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {!loading && !error && (
          <div className="grid grid-rows-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video, index) => (
            <div
              key={video.id || index}
              className={`album-card aspect-video relative overflow-hidden rounded-lg border border-blue-900/30 hover:border-blue-400/50 transition-all duration-300 group cursor-pointer ${(deletingVideoId === video.id || renamingVideoId === video.id) ? 'opacity-50 pointer-events-none' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onMouseEnter={() => (deletingVideoId !== video.id && renamingVideoId !== video.id) && setHoveredVideoId(video.id)}
              onMouseLeave={() => setHoveredVideoId(null)}
              onClick={() => (deletingVideoId !== video.id && renamingVideoId !== video.id) && handleVideoClick(video, index)}
            >
              {video.thumbnailPath ? (
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src={video.thumbnailPath}
                  alt={video.title || `Video ${index + 1}`}
                  onError={(e) => {
                    // Fallback to video if thumbnail fails
                    if (video.path) {
                      const videoEl = document.createElement('video');
                      videoEl.className = "absolute inset-0 w-full h-full object-cover";
                      videoEl.src = video.path;
                      videoEl.poster = "/placeholder-image.jpg";
                      videoEl.muted = true;
                      videoEl.onmouseover = (evt) => evt.currentTarget.play();
                      videoEl.onmouseout = (evt) => {
                        evt.currentTarget.pause();
                        evt.currentTarget.currentTime = 0;
                      };
                      e.target.replaceWith(videoEl);
                    } else {
                      // Show placeholder
                      const div = document.createElement('div');
                      div.className = `absolute inset-0 w-full h-full placeholder-${(index % 4) + 1} flex items-center justify-center`;
                      div.innerHTML = `<div class="text-4xl text-white/60 font-bold">${index + 1}</div>`;
                      e.target.replaceWith(div);
                    }
                  }}
                />
              ) : video.path ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src={video.path}
                  poster="/placeholder-image.jpg"
                  muted
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : null}

              {/* Glass overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity flex flex-col justify-end p-4 ${hoveredVideoId === video.id || openVideoDropdownId === video.id ? 'opacity-100' : 'opacity-0'
                }`}>
                <div className="flex items-center justify-between">
                  {editingVideoId === video.id ? (
                    <div 
                      className="flex items-center flex-1 mr-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <input
                        type="text"
                        value={editingVideoName}
                        onChange={(e) => setEditingVideoName(e.target.value)}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onBlur={() => {
                          if (videoBlurEnabled) {
                            handleSaveVideoName(video.id);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveVideoName(video.id);
                          } else if (e.key === 'Escape') {
                            handleCancelVideoEdit();
                          }
                        }}
                        className="text-sm font-medium text-white bg-blue-900/30 border border-blue-400 rounded px-0.5 flex-1 focus:outline-none focus:border-blue-300 focus:bg-blue-900/40 relative z-[70]"
                        data-video-id={video.id}
                        autoFocus
                        maxLength={50}
                      />
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-white truncate flex-1 mr-2">
                      {video.title || `Video ${index + 1}`}
                    </p>
                  )}
                  <DropdownMenu onOpenChange={(open) => setOpenVideoDropdownId(open ? video.id : null)}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`transition-opacity duration-200 p-1 z-50 hover:cursor-pointer bg-black/50 rounded flex-shrink-0 ${hoveredVideoId === video.id || openVideoDropdownId === video.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <MoreVertical className='text-gray-300 hover:text-white transition-colors' size={12} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#1A1F37] border-blue-900/30 shadow-lg min-w-[160px] w-fit z-[60]"
                      sideOffset={5}
                    >
                        <DropdownMenuItem
                        className="group text-gray-300 hover:!text-white hover:!bg-blue-900/30 focus:!bg-blue-900/30 focus:!text-white cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadVideo(video);
                        }}
                      >
                        <Download className="mr-2 h-4 w-4 text-gray-300 group-hover:!text-white" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`group text-gray-300 hover:!text-white hover:!bg-blue-900/30 focus:!bg-blue-900/30 focus:!text-white cursor-pointer ${renamingVideoId === video.id ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (renamingVideoId !== video.id) {
                            handleRenameVideo(video);
                          }
                        }}
                      >
                        <Edit3 className="mr-2 h-4 w-4 text-gray-300 group-hover:!text-white" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`text-red-400 hover:!text-red-400 hover:!bg-red-900/30 cursor-pointer ${deletingVideoId === video.id ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVideo(video);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default OpenAlbumOverlay;
