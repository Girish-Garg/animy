import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Send, ArrowRight, ChevronRight, Plus } from 'lucide-react';
import AlbumOverlay from '../components/AlbumOverlay';
import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL;

export default function DashboardPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    chats: [],
    albums: []
  });
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [albumOverlayOpen, setAlbumOverlayOpen] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  // Initialize token on component mount
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const token = await getToken();
        setAuthToken(token);
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    };
    if (user) {
      initializeToken();
    }
  }, [getToken, user]);

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
    const fetchDashboardData = async () => {
      try {
        const token = authToken || await refreshToken();
        if (!token) {
          console.error('No auth token available');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${baseURL}/dashboard`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setDashboardData({
            chats: response.data.chats || [],
            albums: response.data.albums || []
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // If unauthorized, try refreshing token
        if (error.response?.status === 401) {
          await refreshToken();
        }
        // Keep empty state on error
      } finally {
        setLoading(false);
      }
    };

    // Only start loading when user and token are available
    if (user && authToken) {
      setLoading(true);
      fetchDashboardData();
    }
    // If no user or token, keep loading state until both are available
  }, [user, authToken]);

  // Handle authentication timeout
  useEffect(() => {
    const authTimeout = setTimeout(() => {
      if (!user && loading) {
        setLoading(false);
      }
    }, 5000); // Wait 5 seconds for authentication

    return () => clearTimeout(authTimeout);
  }, [user, loading]);

  const percentage = 90;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    console.log('Processing input:', inputValue);
    
    setInputValue('');
  };

  const handleAlbumClick = (albumId) => {
    // Find the album to check if it has videos
    const album = dashboardData.albums.find(a => a._id === albumId);
    if (!album || !album.videos || album.videos.length === 0) {
      return; // Don't open if album has no videos
    }
    
    setSelectedAlbumId(albumId);
    setAlbumOverlayOpen(true);
  };

  const handleChatClick = (chatId) => {
    // Navigate to specific chat
    window.location.href = `/chat?id=${chatId}`;
  };
  
  // Get latest 3 albums and 3 chats
  const recentAlbums = dashboardData.albums?.slice(0, 3) || [];
  const recentChats = dashboardData.chats?.slice(0, 3) || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <div className="pt-4 flex flex-col h-full lg:overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
      <div 
        className="w-full hidden lg:block lg:h-[12%] mb-2 relative overflow-hidden rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300" 
        style={{
          backgroundImage: 'url(/topCardBg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 p-4 flex items-center h-full">
          <div className="flex items-center gap-4 w-full">
            <div className="h-14 w-14 rounded-2xl bg-blue-600 overflow-hidden border-2 border-blue-400 flex-shrink-0">
              <img 
                src={user?.imageUrl} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start gap-0.5 flex-grow">
              <div className="bg-green-600 text-white text-xs px-2 rounded font-medium">
                FREE
              </div>
              <span className="text-gray-200 font-bold text-sm">{user?.fullName || 'User'}</span>
              <span className="text-gray-400 text-sm">{user?.emailAddresses?.[0]?.emailAddress || 'Email'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-2 lg:h-[40%]">
        <div 
          className="w-full min-h-[250px] lg:min-h-0 lg:w-[40%] p-6 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full overflow-hidden relative"
          style={{
            backgroundImage: 'url(/jellyfish.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="flex flex-col items-start justify-between h-full relative z-10">
            <div className="flex flex-col items-start gap-1">
              <div className="text-gray-300">Welcome back,</div>
              <h2 className="text-3xl font-bold text-white">{user?.firstName || 'First Name'} {user?.lastName || 'Last Name'}</h2>
              <p className="mt-2 text-gray-300">Glad to see you again!<br/>What's next?</p>
            </div>
            <a 
              href="/create" 
              className="mt-auto text-sm flex items-center gap-1 text-blue-300 hover:text-blue-400 transition-colors group"
            >
              <span>Create a video scene</span>
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        <div className="w-full min-h-[300px] lg:min-h-0 lg:w-2/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg h-full overflow-hidden backdrop-blur-3xl border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300">
          
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="z-30 text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent pb-2">
                Coming Soon
              </div>
              <p className="text-gray-500 text-sm md:text-base">
                Track your usage and manage credits efficiently
              </p>
            </div>
          </div>

          {/* Future Credits Implementation */}
          {/* 
          <h2 className="text-xl font-medium mb-6">Credits Overview</h2>
          <div className="flex h-[80%] flex-row gap-6 items-center justify-between">
            <div className="w-full h-full flex flex-col justify-between">
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Remaining Credits</div>
                <div className="text-xl font-bold text-white">1,000</div>
              </div>
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Used Credits</div>
                <div className="text-xl font-bold text-white">9,000</div>
              </div>
            </div>
            
            <div className="w-full hidden md:flex flex-col items-center">
              <div className="w-40 h-40 relative">
                <CircularProgressbar 
                  value={percentage} 
                  text={``}
                  styles={buildStyles({
                    rotation: 0.75,
                    strokeLinecap: 'round',
                    pathColor: `#10B981`,
                    trailColor: 'rgba(0, 17, 56, 0.3)',
                  })}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-white">90%</div>
                  <div className="text-xs text-gray-400 mt-1">of total credits</div>
                </div>
              </div>
            </div>
            
            <div className="w-full h-full flex flex-col justify-between">
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Cost Per Credit</div>
                <div className="text-xl font-bold text-white">$1</div>
              </div>
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Total Cost</div>
                <div className="text-xl font-bold text-white">$10,000</div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow lg:h-1/2">
        <div className="w-full min-h-[200px] lg:min-h-0 lg:w-1/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full flex flex-col backdrop-blur-3xl">
          <h2 className="text-xl font-medium mb-1">Quick Launch</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Quickly describe your video scene for generation</span>
          </div>
          <form onSubmit={handleSubmit} className="relative flex-grow flex flex-col justify-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-[#131631] text-white border border-blue-900/30 rounded-full py-3 px-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
              placeholder="Describe your animation scene..."
              aria-label="Scene description"
            />
            <button 
              type="submit" 
              className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 hover:cursor-pointer transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={!inputValue.trim()}
              aria-label="Submit"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
        <div className="w-full min-h-[300px] lg:min-h-0 lg:w-1/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full flex flex-col backdrop-blur-3xl">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-medium">Recent Albums</h2>            
            <button 
              onClick={() => setAlbumOverlayOpen(true)}
              className="text-sm text-blue-400 hover:text-blue-500 hover:cursor-pointer flex items-center gap-1 group transition-colors"
            >
              <span>View All</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>All your recent video saves</span>
          </div>

          <div className={`flex-grow flex ${recentAlbums.length > 0 ? 'items-start' : 'items-center justify-center'}`}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading albums...</p>
              </div>
            ) : recentAlbums.length > 0 ? (
              <div className="w-full space-y-3">
                {recentAlbums.map((album) => {
                  const hasVideos = album.videos && album.videos.length > 0;
                  return (
                    <div 
                      key={album._id}
                      onClick={() => hasVideos && handleAlbumClick(album._id)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors border ${
                        hasVideos 
                          ? 'bg-blue-900/10 hover:bg-blue-900/20 border-blue-900/20 hover:border-blue-800/40 cursor-pointer' 
                          : 'bg-gray-900/10 border-gray-800/20 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <div className={`w-12 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                        hasVideos 
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                          : 'bg-gradient-to-br from-gray-600 to-gray-700'
                      }`}>
                        <Plus size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          hasVideos ? 'text-white' : 'text-gray-400'
                        }`}>
                          {album.albumName}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {album.videos?.length || 0} videos
                        </p>
                      </div>
                      <ChevronRight 
                        size={14} 
                        className={hasVideos ? 'text-gray-400' : 'text-gray-600'} 
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                  <Plus size={24} className="text-blue-400" />
                </div>
                <p className="text-center">No albums found</p>
                <p className="text-center text-xs text-gray-500 mt-1">
                  View all albums to create and manage
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full mb-4 lg:mb-0 min-h-[300px] lg:min-h-0 lg:w-1/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full flex flex-col backdrop-blur-3xl">          
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-medium">Recent Chats</h2>
            <a href="/chat" className="text-sm text-blue-400 hover:text-blue-500 hover:cursor-pointer flex items-center gap-1 group transition-colors">
              <span>View All</span>
              <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>View history of recent chats</span>
          </div>

          <div className={`flex-grow flex ${recentChats.length > 0 ? 'items-start' : 'items-center justify-center'}`}>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading chats...</p>
              </div>
            ) : recentChats.length > 0 ? (
              <div className="w-full space-y-2 max-h-full overflow-y-auto">
                {recentChats.map((chat) => (
                  <div 
                    key={chat._id}
                    onClick={() => handleChatClick(chat._id)}
                    className="flex items-center gap-3 p-3 bg-blue-900/10 hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors border border-blue-900/20 hover:border-blue-800/40"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                      C
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {chat.title}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 p-4">
                <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center mb-2">
                  <Plus size={24} className="text-blue-400" />
                </div>
                <p className="text-center">Hey dude! It's empty!</p>
                <p className="text-center text-xs text-gray-500 mt-1 mb-4">Fill it up with your creative ideas</p>
                <a href="/chat" className="bg-blue-600/50 hover:bg-blue-600/70 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center gap-2 mx-auto hover:cursor-pointer w-fit">
                  <span>Start a chat</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div> 
      <AlbumOverlay 
        isOpen={albumOverlayOpen}
        onClose={() => {
          setAlbumOverlayOpen(false);
          setSelectedAlbumId(null);
        }}
        initialAlbumId={selectedAlbumId}
      />
    </div>
  );
}
