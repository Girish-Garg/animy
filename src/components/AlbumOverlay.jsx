import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, FolderOpen, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import './AlbumOverlay.css';

const AlbumOverlay = ({ isOpen, onClose, albumData }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('albums'); // 'albums' or 'videos'
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [hoveredAlbumId, setHoveredAlbumId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const [openVideoDropdownId, setOpenVideoDropdownId] = useState(null);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editingAlbumName, setEditingAlbumName] = useState('');
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editingVideoName, setEditingVideoName] = useState('');
  const [videoBlurEnabled, setVideoBlurEnabled] = useState(true);

  // Create placeholder albums for demo
  const placeholderAlbums = Array(6).fill().map((_, i) => ({
    id: `album-${i}`,
    albumName: `Album ${i + 1}`,
    coverImage: '',
    videos: Array(Math.floor(Math.random() * 6) + 2).fill().map((_, j) => ({
      id: `video-${i}-${j}`,
      path: '',
      title: `Video ${j + 1}`,
    })),
  }));

  // For album list view
  const allAlbums = albumData?.albums?.length ? albumData.albums : placeholderAlbums;
  
  // For videos view
  const placeholderVideos = Array(8).fill().map((_, i) => ({
    id: `placeholder-${i}`,
    path: '',
    title: `Video ${i + 1}`,
    isPlaceholder: true,
  }));

  const videos = selectedAlbum?.videos?.length ? selectedAlbum.videos : placeholderVideos;  // Reset view when overlay closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setCurrentView('albums');
        setSelectedAlbum(null);
      }, 300); // Wait for close animation to finish
    }
  }, [isOpen]);

  useEffect(() => {
    // Animation for entrance and exit
    if (isOpen && contentRef.current) {
      // Reset position for animation
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(contentRef.current, { y: 30, scale: 0.97, autoAlpha: 0 });
      
      // Get all cards to animate them in staggered sequence
      const cards = contentRef.current.querySelectorAll('.album-card');
      
      // Animate overlay in
      const tl = gsap.timeline();
      
      // Fade in the backdrop overlay
      tl.to(overlayRef.current, { 
        autoAlpha: 1, 
        duration: 0.4, 
        ease: 'power2.out' 
      })
      
      // Animate in the main container
      .to(contentRef.current, { 
        y: 0, 
        scale: 1,
        autoAlpha: 1, 
        duration: 0.5, 
        ease: 'back.out(1.2)' 
      }, '-=0.2');

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
  }, [isOpen, currentView, selectedAlbum]);
  const handleClose = () => {
    // Animate out
    const tl = gsap.timeline({
      onComplete: onClose
    });
    
    // Get all cards
    const cards = contentRef.current.querySelectorAll('.album-card');
    
    // Animate out in reverse - first cards, then main container, then overlay
    if (cards.length > 0) {
      tl.to(cards, { 
        y: -10, 
        autoAlpha: 0, 
        stagger: 0.02,
        duration: 0.3, 
        ease: 'power2.in' 
      });
    }
    
    tl.to(contentRef.current, { 
      y: 20, 
      scale: 0.97,
      autoAlpha: 0, 
      duration: 0.3, 
      ease: 'power3.in' 
    }, cards.length > 0 ? '-=0.2' : '0')
    .to(overlayRef.current, { 
      autoAlpha: 0, 
      duration: 0.3, 
      ease: 'power2.inOut' 
    }, '-=0.15');
  };
  
  const handleBackToAlbums = () => {
    // Create animation for transitioning back to albums view
    gsap.to(contentRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        setSelectedAlbum(null);
        setCurrentView('albums');
        gsap.to(contentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          delay: 0.1
        });
      }
    });
  };

  const handleRenameAlbum = (album) => {
    setEditingAlbumId(album.id);
    setEditingAlbumName(album.albumName);
    setOpenDropdownId(null);
    setBlurEnabled(false); // Disable blur temporarily
    
    // Focus the input after state update and re-enable blur after a delay
    setTimeout(() => {
      const input = document.querySelector(`input[data-album-id="${album.id}"]`);
      if (input) {
        input.focus();
        input.select();
        // Re-enable blur after input is focused and stable
        setTimeout(() => setBlurEnabled(true), 200);
      }
    }, 0);
  };

  const handleSaveAlbumName = (albumId) => {
    if (editingAlbumName.trim()) {
      console.log('Save album name:', editingAlbumName, 'for album:', albumId);
      // Here you would update the album name in your data/API
      // For now, update the local data
      const albumIndex = allAlbums.findIndex(album => album.id === albumId);
      if (albumIndex !== -1) {
        allAlbums[albumIndex].albumName = editingAlbumName.trim();
      }
    }
    setEditingAlbumId(null);
    setEditingAlbumName('');
    setBlurEnabled(true);
  };

  const handleCancelEdit = () => {
    setEditingAlbumId(null);
    setEditingAlbumName('');
    setBlurEnabled(true);
  };

  const handleRenameVideo = (video) => {
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

  const handleSaveVideoName = (videoId) => {
    if (editingVideoName.trim()) {
      console.log('Save video name:', editingVideoName, 'for video:', videoId);
      // Here you would update the video name in your data/API
      // For now, update the local data
      const videoIndex = videos.findIndex(video => video.id === videoId);
      if (videoIndex !== -1) {
        videos[videoIndex].title = editingVideoName.trim();
      }
    }
    setEditingVideoId(null);
    setEditingVideoName('');
    setVideoBlurEnabled(true);
  };

  const handleCancelVideoEdit = () => {
    setEditingVideoId(null);
    setEditingVideoName('');
    setVideoBlurEnabled(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 album-overlay-backdrop"
    >
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>
      
      {/* Content Container */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-5xl max-h-[90vh] overflow-auto rounded-2xl glassmorphism shadow-2xl"
      >        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blue-900/40 bg-gradient-to-r from-[#001138]/90 to-[#0c1d43]/90 backdrop-blur-md p-4 sm:p-5">
          <div className="flex items-center gap-2">
            {currentView === 'videos' && (
              <button
                onClick={handleBackToAlbums}
                className="rounded-full p-1.5 bg-blue-900/30 hover:bg-blue-800/50 text-gray-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:cursor-pointer"
                aria-label="Back to Albums"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-medium text-white tracking-tight truncate">
              {currentView === 'albums' ? "My Albums" : selectedAlbum?.albumName || "Album"}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              {currentView === 'albums' ? (
                <div className="py-1 px-3 bg-blue-900/30 text-xs font-medium text-blue-200 rounded-full">
                  {allAlbums.length} {allAlbums.length === 1 ? 'album' : 'albums'}
                </div>
              ) : (
                <div className="py-1 px-3 bg-blue-900/30 text-xs font-medium text-blue-200 rounded-full">
                  {videos.length} {videos.length === 1 ? 'video' : 'videos'}
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="rounded-full p-2 bg-blue-900/30 hover:bg-blue-800/50 hover:bg-opacity-70 text-gray-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div> 
        {/* Album content */}
        <div className="p-4 sm:p-6">
          {/* Albums View */}
          {currentView === 'albums' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {allAlbums.map((album, index) => (
                <div 
                  key={album.id || index}
                  className="album-card relative overflow-hidden rounded-lg border border-blue-900/30 hover:border-blue-400/50 transition-all duration-300 group"
                  style={{animationDelay: `${index * 0.05}s`}}
                  onMouseEnter={() => setHoveredAlbumId(album.id)}
                  onMouseLeave={() => setHoveredAlbumId(null)}
                >
                  {/* Album thumbnail */}
                  <div 
                    className="aspect-square cursor-pointer relative overflow-hidden"
                    onClick={() => {
                      gsap.to(contentRef.current, {
                        opacity: 0,
                        y: 20,
                        duration: 0.3,
                        onComplete: () => {
                          setSelectedAlbum(album);
                          setCurrentView('videos');
                          gsap.to(contentRef.current, {
                            opacity: 1,
                            y: 0,
                            duration: 0.4
                          });
                        }
                      });
                    }}
                  >
                    {album.videos && album.videos.length > 0 ? (
                      album.videos[0].path ? (
                        // Show actual video thumbnail
                        <video 
                          className="w-full h-full object-cover"
                          src={album.videos[0].path}
                          muted
                          preload="metadata"
                        />
                      ) : (
                        // Show placeholder for first video
                        <div className={`w-full h-full placeholder-${(index % 4) + 1}`}></div>
                      )
                    ) : (
                      // Show empty album placeholder
                      <div className={`w-full h-full placeholder-${(index % 4) + 1} flex items-center justify-center`}>
                        <div className="text-gray-400 text-sm font-medium">No Videos</div>
                      </div>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-blue-500/80 p-3 rounded-full">
                        <FolderOpen size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Album info with dropdown */}
                  <div className="p-3 bg-[#0c1d43]/80 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingAlbumId === album.id ? (
                        <input
                          type="text"
                          value={editingAlbumName}
                          onChange={(e) => setEditingAlbumName(e.target.value)}
                          onBlur={() => {
                            if (blurEnabled) {
                              handleSaveAlbumName(album.id);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveAlbumName(album.id);
                            } else if (e.key === 'Escape') {
                              handleCancelEdit();
                            }
                          }}
                          className="font-medium text-white bg-blue-900/30 border border-blue-400 rounded px-2 w-full focus:outline-none focus:border-blue-300 focus:bg-blue-900/40 relative z-[70]"
                          data-album-id={album.id}
                          autoFocus
                        />
                      ) : (
                        <input
                          type="text"
                          value={album.albumName}
                          readOnly
                          className="font-medium text-white bg-transparent border-none p-0 w-full focus:outline-none cursor-default truncate"
                        />
                      )}
                      <span className="text-xs text-gray-300">
                        {album.videos?.length || 0} videos
                      </span>
                    </div>
                    
                    {/* Three-dot menu */}
                    <DropdownMenu onOpenChange={(open) => setOpenDropdownId(open ? album.id : null)}>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className={`transition-opacity duration-200 p-1 z-50 hover:cursor-pointer ${
                            hoveredAlbumId === album.id || openDropdownId === album.id ? 'opacity-100' : 'opacity-0'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className='text-gray-400 hover:text-white transition-colors' size={16}/>
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
                            handleRenameAlbum(album);
                          }}
                        >
                          <Edit3 className="mr-2 h-4 w-4 text-gray-300 group-hover:!text-white" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className='text-red-400 hover:!text-red-400 hover:!bg-red-900/30 cursor-pointer'
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Delete album:', album.albumName);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Videos View */}
          {currentView === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((video, index) => (
                <div 
                  key={video.id || index}
                  className="album-card aspect-video relative overflow-hidden rounded-lg border border-blue-900/30 hover:border-blue-400/50 transition-all duration-300 group cursor-pointer"
                  style={{animationDelay: `${index * 0.05}s`}}
                  onMouseEnter={() => setHoveredVideoId(video.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                >
                  {video.path ? (
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
                  ) : (
                    <div className={`absolute inset-0 w-full h-full placeholder-${(index % 4) + 1} flex items-center justify-center`}>
                      <div className="text-4xl text-white/60 font-bold">
                        {index + 1}
                      </div>
                    </div>
                  )}
                  
                  {/* Glass overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity flex flex-col justify-end p-4 ${
                    hoveredVideoId === video.id || openVideoDropdownId === video.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="flex items-center justify-between">
                      {editingVideoId === video.id ? (
                        <input
                          type="text"
                          value={editingVideoName}
                          onChange={(e) => setEditingVideoName(e.target.value)}
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
                          className="text-sm font-medium text-white bg-blue-900/30 border border-blue-400 rounded px-0.5 flex-1 mr-2 focus:outline-none focus:border-blue-300 focus:bg-blue-900/40 relative z-[70]"
                          data-video-id={video.id}
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm font-medium text-white truncate flex-1 mr-2">
                          {video.title || `Video ${index + 1}`}
                        </p>
                      )}
                      <DropdownMenu onOpenChange={(open) => setOpenVideoDropdownId(open ? video.id : null)}>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className={`transition-opacity duration-200 p-1 z-50 hover:cursor-pointer bg-black/50 rounded flex-shrink-0 ${
                              hoveredVideoId === video.id || openVideoDropdownId === video.id ? 'opacity-100' : 'opacity-0'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <MoreVertical className='text-gray-300 hover:text-white transition-colors' size={12}/>
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
                              handleRenameVideo(video);
                            }}
                          >
                            <Edit3 className="mr-2 h-4 w-4 text-gray-300 group-hover:!text-white" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className='text-red-400 hover:!text-red-400 hover:!bg-red-900/30 cursor-pointer'
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Delete video:', video.title);
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

          {/* Empty state for albums */}
          {currentView === 'albums' && allAlbums.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-400 p-8 py-16 my-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-800/40 to-purple-800/40 flex items-center justify-center mb-5 shadow-inner border border-blue-700/20">
                <div className="text-5xl">📚</div>
              </div>
              <p className="text-center text-xl font-medium text-white mb-2">No albums created yet</p>
              <p className="text-center text-gray-400 mb-6 max-w-md">Create albums to organize your videos for easy access</p>
              <button 
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-full transition-colors font-medium flex items-center gap-2 shadow-xl shadow-blue-900/30 hover:shadow-blue-800/30"
              >
                <span>Create Album</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
            </div>
          )}
          
          {/* Empty state for videos */}
          {currentView === 'videos' && videos.length === 0 && (
            <div className="flex flex-col items-center justify-center text-gray-400 p-8 py-16 my-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-800/40 to-purple-800/40 flex items-center justify-center mb-5 shadow-inner border border-blue-700/20">
                <div className="text-5xl transform -rotate-6">🎬</div>
              </div>
              <p className="text-center text-xl font-medium text-white mb-2">No videos in this album yet</p>
              <p className="text-center text-gray-400 mb-6 max-w-md">Create amazing video scenes and save them to your album to view them here</p>
              <button 
                onClick={() => navigate('/create')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-full transition-colors font-medium flex items-center gap-2 shadow-xl shadow-blue-900/30 hover:shadow-blue-800/30"
              >
                <span>Create Video</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumOverlay;
