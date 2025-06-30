import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, FolderOpen } from 'lucide-react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import './AlbumOverlay.css';

const AlbumOverlay = ({ isOpen, onClose, albumData }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('albums'); // 'albums' or 'videos'
  const [selectedAlbum, setSelectedAlbum] = useState(null);

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

  if (!isOpen) return null;

  return (    <div 
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
        </div>        {/* Album content */}
        <div className="p-4 sm:p-6">
          {/* Albums View */}
          {currentView === 'albums' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {allAlbums.map((album, index) => (
                <div 
                  key={album.id || index}
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
                  className="album-card relative overflow-hidden rounded-lg border border-blue-900/30 hover:border-blue-400/50 transition-all duration-300 group cursor-pointer"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  {/* Album thumbnail grid */}
                  <div className="aspect-square grid grid-cols-2 grid-rows-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className={`relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2 sm:col-span-1 sm:row-span-1' : ''}`}
                      >
                        <div className={`w-full h-full placeholder-${(i + index) % 4 + 1}`}></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Album info */}
                  <div className="p-3 bg-[#0c1d43]/80">
                    <p className="font-medium text-white truncate">
                      {album.albumName}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-300">
                        {album.videos?.length || 0} videos
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-blue-500/80 p-3 rounded-full">
                      <FolderOpen size={24} className="text-white" />
                    </div>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-sm font-medium text-white truncate mb-1">
                      {video.title || `Video ${index + 1}`}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-300 opacity-75">00:30</span>
                      <span className="text-xs bg-blue-500/80 text-white px-2 py-0.5 rounded-full">HD</span>
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
