import React, { useEffect, useRef, useState } from 'react';
import { X, FolderOpen, MoreVertical, Edit3, Trash2, Play } from 'lucide-react';
import gsap from 'gsap';
import { apiUtils } from '@/lib/apiClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import './AlbumOverlay.css';
import { toast, Toaster } from 'sonner';
import CreateAlbumOverlay from './CreateAlbumOverlay';
import OpenAlbumOverlay from './OpenAlbumOverlay';

const AlbumOverlay = ({ isOpen, onClose, initialAlbumId }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [currentView, setCurrentView] = useState('albums');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [hoveredAlbumId, setHoveredAlbumId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editingAlbumId, setEditingAlbumId] = useState(null);
  const [editingAlbumName, setEditingAlbumName] = useState('');
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [renamingAlbumId, setRenamingAlbumId] = useState(null);
  const [deletingAlbumId, setDeletingAlbumId] = useState(null);
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);

  // Function to fetch albums from API
  const fetchAlbums = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiUtils.get('/album/');

      if (response.data.success) {
        // Transform API data to match component structure
        const transformedAlbums = response.data.albums.map(album => ({
          id: album._id,
          albumName: album.albumName,
          coverImage: album.videos.length > 0 ? album.videos[0].thumbnailPath : '',
          videos: album.videos.map(video => ({
            id: video._id || Math.random().toString(36),
            path: video.videoPath,
            title: video.name,
            thumbnailPath: video.thumbnailPath
          })),
          createdAt: album.createdAt,
          updatedAt: album.updatedAt
        }));
        setAlbums(transformedAlbums);
      } else {
        setError('Failed to fetch albums');
      }
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError('Failed to fetch albums. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch albums when component opens
  useEffect(() => {
    if (isOpen) {
      fetchAlbums();
    }
  }, [isOpen]);

  // Handle opening specific album when initialAlbumId is provided
  useEffect(() => {
    if (isOpen && initialAlbumId && albums.length > 0) {
      const album = albums.find(a => a.id === initialAlbumId);
      if (album) {
        setSelectedAlbum(album);
        setCurrentView('videos');
      }
    }
  }, [isOpen, initialAlbumId, albums]);

  // For album list view - use real data if available, otherwise show empty
  const allAlbums = loading ? [] : albums;  // Reset view when overlay closes
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
    if (isOpen && contentRef.current && currentView === 'albums') {
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
  }, [isOpen, currentView]);
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
    setSelectedAlbum(null);
    setCurrentView('albums');
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

  const handleSaveAlbumName = async (albumId) => {
    if (editingAlbumName.trim()) {
      // Set loading state for this specific album
      setRenamingAlbumId(albumId);
      
      // Optimistic update - update UI immediately
      const originalAlbums = [...albums];
      const optimisticAlbums = albums.map(album => 
        album.id === albumId 
          ? { ...album, albumName: editingAlbumName.trim() }
          : album
      );
      setAlbums(optimisticAlbums);
      
      // Exit editing mode immediately for better UX
      setEditingAlbumId(null);
      setEditingAlbumName('');
      setBlurEnabled(true);
      
      try {
        const response = await apiUtils.patch(`/album/${albumId}/rename`, {
          newAlbumName: editingAlbumName.trim()
        });

        if (response.data.success) {
          // Transform API data to match component structure
          const transformedAlbums = response.data.albums.map(album => ({
            id: album._id,
            albumName: album.albumName,
            coverImage: album.videos.length > 0 ? album.videos[0].thumbnailPath : '',
            videos: album.videos.map(video => ({
              id: video._id || Math.random().toString(36),
              path: video.videoPath,
              title: video.name,
              thumbnailPath: video.thumbnailPath
            })),
            createdAt: album.createdAt,
            updatedAt: album.updatedAt
          }));

          // Update with real data from server
          setAlbums(transformedAlbums);

          console.log('Album renamed successfully');
        } else {
          // Revert optimistic update on failure
          setAlbums(originalAlbums);
          toast.error('Failed to rename album. Please try again.');
        }
      } catch (error) {
        // Revert optimistic update on error
        setAlbums(originalAlbums);
        console.error('Error renaming album:', error);
        toast.error('Failed to rename album. Please check your connection and try again.');
      } finally {
        setRenamingAlbumId(null);
      }
    } else {
      // Just exit editing mode if name is empty
      setEditingAlbumId(null);
      setEditingAlbumName('');
      setBlurEnabled(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingAlbumId(null);
    setEditingAlbumName('');
    setBlurEnabled(true);
  };

  const handleDeleteAlbum = async (albumId, albumName) => {
    // Set loading state for this specific album
    setDeletingAlbumId(albumId);
    
    // Optimistic update - remove album from UI immediately
    const originalAlbums = [...albums];
    const optimisticAlbums = albums.filter(album => album.id !== albumId);
    setAlbums(optimisticAlbums);
    
    try {
      const response = await apiUtils.delete(`/album/${albumId}`);

      if (response.data.success) {
        // Transform API data to match component structure
        const transformedAlbums = response.data.albums.map(album => ({
          id: album._id,
          albumName: album.albumName,
          coverImage: album.videos.length > 0 ? album.videos[0].thumbnailPath : '',
          videos: album.videos.map(video => ({
            id: video._id || Math.random().toString(36),
            path: video.videoPath,
            title: video.name,
            thumbnailPath: video.thumbnailPath
          })),
          createdAt: album.createdAt,
          updatedAt: album.updatedAt
        }));

        // Update with real data from server
        setAlbums(transformedAlbums);

        console.log('Album deleted successfully');
      } else {
        // Revert optimistic update on failure
        setAlbums(originalAlbums);
        toast.error('Failed to delete album. Please try again.');
      }
    } catch (error) {
      // Revert optimistic update on error
      setAlbums(originalAlbums);
      console.error('Error deleting album:', error);
      toast.error('Failed to delete album. Please check your connection and try again.');
    } finally {
      setDeletingAlbumId(null);
    }
  };

  const handleAlbumCreated = () => {
    fetchAlbums();
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster position='top-center' richColors />
      <CreateAlbumOverlay 
        isOpen={showCreateAlbum}
        onClose={() => setShowCreateAlbum(false)}
        onAlbumCreated={handleAlbumCreated}
      />
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
          className={`relative w-full rounded-2xl glassmorphism shadow-2xl ${
            currentView === 'videos' 
              ? 'max-w-5xl overflow-auto' 
              : 'max-w-5xl max-h-[90vh] overflow-auto'
          }`}
        >
          {currentView === 'albums' ? (
            <>
              {/* Albums Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-blue-900/40 bg-gradient-to-r from-[#001138]/90 to-[#0c1d43]/90 backdrop-blur-md p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium text-white tracking-tight truncate">
                    My Albums
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCreateAlbum(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-3 py-1.5 rounded-full transition-colors font-medium text-sm flex items-center gap-1.5 shadow-lg shadow-blue-900/30 hover:shadow-blue-800/30 hover:cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5"/>
                    <span className="hidden sm:inline">Create Album</span>
                    <span className="sm:hidden">Create</span>
                  </button>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="py-2 px-3 bg-blue-900/30 text-xs font-medium text-blue-200 rounded-full">
                      {allAlbums.length} {allAlbums.length === 1 ? 'album' : 'albums'}
                    </div>
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

              {/* Albums Content */}
              <div className="p-4 sm:p-6">
                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 text-sm">Loading albums...</p>
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
                      <p className="text-red-400 font-medium">Error loading albums</p>
                      <button
                        onClick={fetchAlbums}
                        className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Albums Grid */}
                {!loading && !error && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {allAlbums.map((album, index) => (
                      <div
                        key={album.id || index}
                        className={`album-card relative overflow-hidden rounded-lg border border-blue-900/30 hover:border-blue-400/50 transition-all duration-300 group ${
                          deletingAlbumId === album.id ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onMouseEnter={() => setHoveredAlbumId(album.id)}
                        onMouseLeave={() => setHoveredAlbumId(null)}
                      >
                        {/* Album thumbnail */}
                        <div
                          className={`aspect-square relative overflow-hidden ${album.videos && album.videos.length > 0 ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                            }`}
                          onClick={() => {
                            // Only open album if it has videos
                            if (album.videos && album.videos.length > 0) {
                              setSelectedAlbum(album);
                              setCurrentView('videos');
                            }
                          }}
                        >
                          {album.videos && album.videos.length > 0 ? (
                            album.videos[0].thumbnailPath ? (
                              // Show actual video thumbnail
                              <img
                                className="w-full h-full object-cover"
                                src={album.videos[0].thumbnailPath}
                                alt={album.albumName}
                                onError={(e) => {
                                  // Fallback to video if thumbnail fails
                                  if (album.videos[0].path) {
                                    const video = document.createElement('video');
                                    video.className = "w-full h-full object-cover";
                                    video.src = album.videos[0].path;
                                    video.muted = true;
                                    video.preload = "metadata";
                                    e.target.replaceWith(video);
                                  } else {
                                    // Show placeholder
                                    const div = document.createElement('div');
                                    div.className = `w-full h-full placeholder-${(index % 4) + 1}`;
                                    e.target.replaceWith(div);
                                  }
                                }}
                              />
                            ) : album.videos[0].path ? (
                              // Show video as fallback
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
                          {album.videos && album.videos.length > 0 && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="bg-blue-500/80 p-3 rounded-full">
                                <FolderOpen size={24} className="text-white" />
                              </div>
                            </div>
                          )}
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
                                maxLength={50}
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={album.albumName}
                                  readOnly
                                  className="font-medium text-white bg-transparent border-none p-0 w-full focus:outline-none cursor-default truncate"
                                />
                              </div>
                            )}
                            <span className="text-xs text-gray-300">
                              {album.videos?.length || 0} videos
                            </span>
                          </div>

                          {/* Three-dot menu */}
                          <DropdownMenu onOpenChange={(open) => setOpenDropdownId(open ? album.id : null)}>
                            <DropdownMenuTrigger asChild>
                              <button
                                className={`transition-opacity duration-200 p-1 z-50 hover:cursor-pointer ${hoveredAlbumId === album.id || openDropdownId === album.id ? 'opacity-100' : 'opacity-0'
                                  }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <MoreVertical className='text-gray-400 hover:text-white transition-colors' size={16} />
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
                                  handleDeleteAlbum(album.id, album.albumName);
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

                {!loading && !error && allAlbums.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-8 py-16 my-4">
                    <p className="text-center text-xl font-medium text-white mb-2">No albums created yet</p>
                    <p className="text-center text-gray-400 mb-6 max-w-md">Create albums to organize your videos for easy access</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <OpenAlbumOverlay
              isOpen={currentView === 'videos'}
              album={selectedAlbum}
              onClose={handleClose}
              onBackToAlbums={handleBackToAlbums}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AlbumOverlay;
