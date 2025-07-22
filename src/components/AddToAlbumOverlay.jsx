import React, { useEffect, useRef, useState } from 'react';
import { X, Plus, ChevronDown, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const baseURL = import.meta.env.VITE_BACKEND_URL;

const AddToAlbumOverlay = ({ 
  isOpen, 
  onClose, 
  onVideoAdded,
  videoPath,
  thumbnailPath,
  chatId
}) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [videoName, setVideoName] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  const { getToken } = useAuth();

  // Initialize token when component opens
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    };
    if (isOpen) {
      initializeToken();
    }
  }, [isOpen, getToken]);

  // Function to refresh token when needed
  const refreshToken = async () => {
    try {
      const token = await getToken();
      setAuthToken(token);
      return token;
    } catch (error) {
      console.error('Failed to refresh auth token:', error);
      return null;
    }
  };

  // Fetch albums when component opens
  useEffect(() => {
    if (isOpen) {
      fetchAlbums();
      setVideoName(''); // Reset video name
      setSelectedAlbum(null); // Reset selected album
    }
  }, [isOpen]);

  const fetchAlbums = async () => {
    setLoadingAlbums(true);
    
    try {
      const token = authToken || await refreshToken();
      if (!token) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      const response = await axios.get(`${baseURL}/album/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAlbums(response.data.albums);
      } else {
        toast.error('Failed to load albums');
      }
    } catch (err) {
      console.error('Error fetching albums:', err);
      toast.error('Failed to load albums. Please try again.');
    } finally {
      setLoadingAlbums(false);
    }
  };

  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Animation for entrance
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(contentRef.current, { y: 30, scale: 0.97, autoAlpha: 0 });
      
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, { 
        autoAlpha: 1, 
        duration: 0.4, 
        ease: 'power2.out' 
      })
      .to(contentRef.current, { 
        y: 0, 
        scale: 1, 
        autoAlpha: 1, 
        duration: 0.5, 
        ease: 'back.out(1.2)' 
      }, '-=0.2');
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isAdding) return; // Prevent closing while adding

    const tl = gsap.timeline({
      onComplete: onClose
    });

    tl.to(contentRef.current, { 
      y: 20, 
      scale: 0.97, 
      autoAlpha: 0, 
      duration: 0.3, 
      ease: 'power3.in' 
    })
    .to(overlayRef.current, { 
      autoAlpha: 0, 
      duration: 0.3, 
      ease: 'power2.inOut' 
    }, '-=0.15');
  };

  const handleAddToAlbum = async () => {
    if (!videoName.trim()) {
      toast.error('Please enter a video name');
      return;
    }

    if (!selectedAlbum) {
      toast.error('Please select an album');
      return;
    }

    if (!videoPath || !thumbnailPath || !chatId) {
      toast.error('Missing video data. Please try again.');
      return;
    }

    setIsAdding(true);

    try {
      const token = authToken || await refreshToken();
      if (!token) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      const response = await axios.post(
        `${baseURL}/album/${selectedAlbum.id}/video`,
        {
          name: videoName.trim(),
          videoPath: videoPath,
          thumbnailPath: thumbnailPath,
          chatId: chatId
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Video added to "${selectedAlbum.albumName}" successfully!`);
        
        // Call the callback if provided
        if (onVideoAdded) {
          onVideoAdded(response.data);
        }
        
        // Close the overlay after successful addition
        handleClose();
      } else {
        toast.error('Failed to add video to album');
      }
    } catch (err) {
      console.error('Error adding video to album:', err);
      toast.error('Failed to add video to album. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
      ></div>

      {/* Content Container */}
      <div
        ref={contentRef}
        className="relative w-full max-w-md bg-gradient-to-br from-[#001138] to-[#0c1d43] rounded-2xl shadow-2xl border border-blue-900/30 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-blue-900/40 bg-gradient-to-r from-[#001138]/90 to-[#0c1d43]/90">
          <h2 className="text-lg font-medium text-white">Add Video to Album</h2>
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="rounded-full p-1.5 bg-blue-900/30 hover:bg-blue-800/50 text-gray-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Video Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Video Name
            </label>
            <input
              type="text"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="Enter video name..."
              className="w-full px-3 py-2 bg-blue-900/20 border border-blue-800/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/30 transition-colors"
              disabled={isAdding}
              maxLength={100}
            />
          </div>

          {/* Album Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Select Album
            </label>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isAdding || loadingAlbums}
                  className="w-full px-3 py-2 bg-blue-900/20 border border-blue-800/40 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:bg-blue-900/30 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {loadingAlbums ? 'Loading albums...' : 
                     selectedAlbum ? selectedAlbum.albumName : 'Choose an album'}
                  </span>
                  {loadingAlbums ? (
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)] bg-[#1A1F37] border-blue-900/30 shadow-lg max-h-48 overflow-y-auto"
              >
                {albums.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400 text-center">
                    No albums found
                  </div>
                ) : (
                  albums.map((album) => (
                    <DropdownMenuItem
                      key={album.id}
                      className="text-gray-300 hover:!text-white hover:!bg-blue-900/30 focus:!bg-blue-900/30 focus:!text-white cursor-pointer"
                      onClick={() => {
                        setSelectedAlbum(album);
                        setDropdownOpen(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{album.albumName}</span>
                        <span className="text-xs text-gray-400">
                          {album.videos?.length || 0} videos
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Video Info Display */}
          {(videoPath || thumbnailPath) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Video Preview
              </label>
              <div className="flex items-center gap-3 p-3 bg-blue-900/10 border border-blue-800/20 rounded-lg">
                {thumbnailPath && (
                  <img
                    src={thumbnailPath}
                    alt="Video thumbnail"
                    className="w-12 h-8 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    Video ready to add
                  </p>
                  <p className="text-xs text-gray-400">
                    Chat ID: {chatId}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-blue-900/40 bg-gradient-to-r from-[#001138]/50 to-[#0c1d43]/50">
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToAlbum}
            disabled={isAdding || !videoName.trim() || !selectedAlbum}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
          >
            {isAdding ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add to Album
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToAlbumOverlay;
