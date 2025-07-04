import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Send, ArrowRight, ChevronRight, Plus } from 'lucide-react';
import AlbumOverlay from '../components/AlbumOverlay';
import { generateMockAlbumData } from '../lib/albumUtils';

export default function DashboardPage() {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState({
    user: {
      totalCredit: 10000,
      usedCredit: 9000,
      creditRemaining: 1000,
      costPerCredit: 1,
    },
    chats: [],
    albums: []
  });
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [albumOverlayOpen, setAlbumOverlayOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${await user?.getToken()}`,
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [user]);

  const percentage = 90;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    console.log('Processing input:', inputValue);
    
    setInputValue('');
  };
  
  return (
    <div className="pt-4 flex flex-col h-full" style={{ height: 'calc(100vh - 80px)' }}>
      <div 
        className="w-full mb-2 relative overflow-hidden rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300" 
        style={{ 
          height: '12%',
          backgroundImage: 'url(/topCardBg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 p-4 flex items-center h-full">
          <div className="flex items-center gap-4 w-full">
            <div className="h-16 w-16 rounded-2xl bg-blue-600 overflow-hidden border-2 border-blue-400 flex-shrink-0">
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
      
      <div className="flex flex-col lg:flex-row gap-4 mb-2" style={{ height: '40%' }}>
        
        <div 
          className="w-full lg:w-[40%] p-6 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full overflow-hidden relative"
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
        
        <div className="w-full lg:w-2/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg h-full overflow-hidden backdrop-blur-3xl border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300">
          <h2 className="text-xl font-medium mb-6">Credits Overview</h2>
          <div className="flex h-[80%] flex-col md:flex-row gap-6 items-center justify-between">
            <div className="w-full h-full md:w-1/3 flex flex-col justify-between">
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Remaining Credits</div>
                <div className="text-2xl font-bold text-white">1,000</div>
              </div>
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Used Credits</div>
                <div className="text-2xl font-bold text-white">9,000</div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 flex flex-col items-center">
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
            
            <div className="w-full h-full md:w-1/3 flex flex-col justify-between">
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Cost Per Credit</div>
                <div className="text-2xl font-bold text-white">$1</div>
              </div>
              <div className="p-4 border border-blue-900/40 rounded-md bg-[#0c1d43]/60 backdrop-blur-3xl hover:border-blue-800/60 transition-all">
                <div className="text-sm text-gray-400">Total Cost</div>
                <div className="text-2xl font-bold text-white">$10,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-grow" style={{ height: '50%' }}>
        <div className="w-full lg:w-1/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full flex flex-col backdrop-blur-3xl">
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
        <div className="w-full lg:w-1/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full flex flex-col backdrop-blur-3xl">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-medium">Recent Albums</h2>            
            <button 
              onClick={() => {                
                const mockAlbums = Array(6).fill().map((_, i) => ({
                  id: `album-${i}`,
                  albumName: `Album ${i + 1}`,
                  coverImage: '',
                  videos: generateMockAlbumData(Math.floor(Math.random() * 6) + 2).videos,
                }));
                
                setSelectedAlbum({
                  albums: dashboardData.albums?.length ? dashboardData.albums : mockAlbums
                });
                setAlbumOverlayOpen(true);
              }}
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

          <div className="flex-grow flex items-center justify-center">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading albums...</p>
              </div>
            ) : (              <div className="flex flex-col items-center justify-center text-gray-400 p-4">
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

        <div className="w-full lg:w-1/3 p-6 bg-[#001138]/50 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300 h-full flex flex-col backdrop-blur-3xl">          <div className="flex justify-between items-center mb-1">
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

          <div className="flex flex-grow items-center justify-center bg-[#0c1d43]/30 rounded-lg backdrop-blur-md">
            <div className="text-center p-6">
              <p className="text-gray-300 mb-2">Hey dude! It's empty!</p>
              <p className="text-gray-400 text-sm mb-4">Fill it up with your creative ideas</p>
              <a href="/chat" className="bg-blue-600/50 hover:bg-blue-600/70 text-white px-4 py-2 rounded-md transition-colors text-sm flex items-center gap-2 mx-auto hover:cursor-pointer">
                <span>Start a chat</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div> 
      <AlbumOverlay 
        isOpen={albumOverlayOpen}
        onClose={() => setAlbumOverlayOpen(false)} 
        albumData={selectedAlbum}
      />
    </div>
  );
}
