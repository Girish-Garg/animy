import React, { useEffect, useRef, useState } from 'react';
import { X, Plus } from 'lucide-react';
import gsap from 'gsap';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'sonner';

const baseURL = import.meta.env.VITE_BACKEND_URL;

const CreateAlbumOverlay = ({ isOpen, onClose, onAlbumCreated }) => {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [albumName, setAlbumName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
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

  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Reset form
      setAlbumName('');
      
      // Animation for entrance
      gsap.set(overlayRef.current, { autoAlpha: 0 });
      gsap.set(contentRef.current, { y: 30, scale: 0.97, autoAlpha: 0 });
      
      const tl = gsap.timeline();
      
      tl.to(overlayRef.current, { 
        autoAlpha: 1, 
        duration: 0.3, 
        ease: 'power2.out' 
      })
      .to(contentRef.current, { 
        y: 0, 
        scale: 1,
        autoAlpha: 1, 
        duration: 0.4, 
        ease: 'back.out(1.2)' 
      }, '-=0.1');

      // Focus input after animation
      setTimeout(() => {
        const input = contentRef.current?.querySelector('input');
        if (input) input.focus();
      }, 400);
    }
  }, [isOpen]);

  const handleClose = () => {
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
      duration: 0.2, 
      ease: 'power2.inOut' 
    }, '-=0.1');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!albumName.trim()) {
      toast.error('Please enter an album name');
      return;
    }

    setIsCreating(true);

    try {
      const token = authToken || await refreshToken();
      if (!token) {
        toast.error('Authentication failed. Please try again.');
        return;
      }

      const response = await axios.post(`${baseURL}/album`, {
        albumName: albumName.trim()
      }, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Album created successfully!');
        
        // Call the callback to refresh albums list
        if (onAlbumCreated) {
          onAlbumCreated();
        }
        
        // Close the overlay
        handleClose();
      } else {
        toast.error('Failed to create album. Please try again.');
      }
    } catch (error) {
      console.error('Error creating album:', error);
      toast.error('Failed to create album. Please check your connection and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
      />
      
      {/* Content Container */}
      <div 
        ref={contentRef}
        className="relative w-full max-w-md bg-gradient-to-br from-[#001138] to-[#0c1d43] rounded-2xl border border-blue-900/30 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-900/30">
          <h2 className="text-xl font-semibold text-white">Create New Album</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 bg-blue-900/30 hover:bg-blue-800/50 text-gray-200 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="albumName" className="block text-sm font-medium text-gray-200 mb-2">
              Album Name
            </label>
            <input
              type="text"
              id="albumName"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              placeholder="Enter album name..."
              className="w-full px-4 py-3 bg-blue-900/20 border border-blue-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isCreating}
              maxLength={50}
            />
            <div className="mt-1 text-xs text-gray-400">
              {albumName.length}/50 characters
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!albumName.trim() || isCreating}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Create Album
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlbumOverlay;
