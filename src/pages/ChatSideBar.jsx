import React, { useState, useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isThrottleAtom, throttleStatusSelector, isGeneratingAtom } from '../recoil/throttle';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { apiUtils } from '@/lib/apiClient';
import { useAuth } from '@clerk/clerk-react';
import authManager from '@/lib/authManager';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import AlbumOverlay from '../components/AlbumOverlay';
import AddToAlbumOverlay from '../components/AddToAlbumOverlay';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  HelpCircleIcon,
  BellIcon,
  PanelLeft,
  Folder,
  MessageSquarePlus,
  SendIcon,
  Trash2Icon,
  EllipsisIcon,
  Edit3,
  Download,
  X,
  CircleStop,
  FolderPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

function CustomTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <button 
      onClick={toggleSidebar} 
      className="group hover:cursor-pointer p-2 hover:bg-[#1A1F37]/40 rounded-lg transition-all duration-100"
    >
      <PanelLeft className="size-[18px] text-[#a0aec0] group-hover:text-white transition-colors" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

export default function Layout() {

  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [albumOverlayOpen, setAlbumOverlayOpen] = useState(false);  
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [addToAlbumOverlayOpen, setAddToAlbumOverlayOpen] = useState(false);
  const [selectedVideoData, setSelectedVideoData] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState('');
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [throttleState, setThrottleState] = useRecoilState(isThrottleAtom);
  const { isThrottled, throttleTimeRemaining } = useRecoilValue(throttleStatusSelector);

  const [isGenerating, setIsGenerating] = useRecoilState(isGeneratingAtom);
  const [localThrottleTimeRemaining, setLocalThrottleTimeRemaining] = useState(throttleTimeRemaining);
  useEffect(() => {
    if (!isThrottled) {
      setLocalThrottleTimeRemaining(0);
      return;
    }
    setLocalThrottleTimeRemaining(throttleTimeRemaining);
    const interval = setInterval(() => {
      setLocalThrottleTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isThrottled, throttleTimeRemaining]);

  useEffect(() => {
    if(!isSignedIn && isLoaded) {
      navigate('/signin');
    }
  }, [isSignedIn, isLoaded]);


  // Set throttle after sending a prompt (always 10 minutes = 600 seconds)
  const applyThrottle = (createdAt) => {
  setThrottleState({
      lastCreatedAt: createdAt,
      throttleDuration: 600,
    });
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    if (isThrottled) return;

    try {
      // If we're in an active chat, send message to existing chat
      if (activeChat) {
        // Show immediate feedback by adding user message optimistically
        const userPrompt = {
          _id: `temp-${Date.now()}`,
          prompt: inputValue.trim(),
          video: null,
          createdAt: new Date().toISOString()
        };
        setCurrentChatData(prevData => ({
          ...prevData,
          prompts: [...(prevData?.prompts || []), userPrompt]
        }));
        const promptToSend = inputValue.trim();
        setInputValue('');
        setGeneratingPromptId(userPrompt._id);
        setGeneratingMessage('Sending message...');
        setIsGenerating({
          isGenerating: true,
        });
        try {
          const response = await apiUtils.post(`/chat/${activeChat}/generate`, {
            prompt: promptToSend
          });
          const data = response.data;
          if (data.success) {
            if (data.createdAt) {
              applyThrottle(new Date(data.createdAt).getTime());
            }
            setCurrentChatData(prevData => ({
              ...prevData,
              prompts: prevData.prompts.map(p =>
                p._id === userPrompt._id
                  ? { ...p, _id: data.promptId }
                  : p
              )
            }));
            if (data.promptId) {
              startPolling(activeChat, data.promptId);
            }
            setTimeout(() => fetchChatData(activeChat, false), 1000);
          } else {
            setGeneratingMessage('Failed to send message');
            setGeneratingPromptId(null);
            setIsGenerating({
              isGenerating: false,
            });
            setCurrentChatData(prevData => ({
              ...prevData,
              prompts: prevData.prompts.filter(p => p._id !== userPrompt._id)
            }));
          }
        } catch (error) {
          setGeneratingMessage('Failed to send message');
          setGeneratingPromptId(null);
          setIsGenerating({
            isGenerating: false,
          });
          setCurrentChatData(prevData => ({
            ...prevData,
            prompts: prevData.prompts.filter(p => p._id !== userPrompt._id)
          }));
        }
        return;
      }

      // If no active chat, create new chat with the prompt
      setIsCreatingNewChat(true);
      const response = await apiUtils.post('/chat', {
        prompt: inputValue.trim(),
        title: inputValue.trim().slice(0, 50)
      });
      const data = response.data;
      // ...existing code...
      if (data.type === "chat_replaced" || data.type === "success") {
        // Set throttle using backend createdAt (always 10 min)
        if (data.createdAt) {
          applyThrottle(new Date(data.createdAt).getTime());
        }
        setInputValue('');
        setActiveChat(data.chat._id);
        setActivePage('chat');
        localStorage.setItem('animy_last_chat', data.chat._id);
        setTimeout(() => {
          navigate(`/chat/chat?id=${data.chat._id}`);
        }, 100);
        setTimeout(() => {
          fetchChatData(data.chat._id);
        }, 200);
        setTimeout(() => {
          fetchChats();
        }, 300);
        if (data.promptId) {
          setTimeout(() => {
            startPolling(data.chat._id, data.promptId);
          }, 400);
        }
      } else {
        setIsCreatingNewChat(false);
      }
      setIsCreatingNewChat(false);
    } catch (error) {
      setIsCreatingNewChat(false);
    }
  };
  const [chatItems, setChatItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChatData, setCurrentChatData] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [generatingPromptId, setGeneratingPromptId] = useState(null);
  const [generatingMessage, setGeneratingMessage] = useState('');
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Function to fetch chats from API
  const fetchChats = async () => {
    try {
      setIsLoading(true);
      const response = await apiUtils.get('/chat');
      const data = response.data;
      if (data.success) {
        const transformedChats = data.chats.map(chat => ({
          id: chat._id,
          title: chat.title,
          createdAt: chat.createdAt
        }));
        setChatItems(transformedChats);
      }
    } catch (error) {
      // Don't log 401 errors as they're handled by the interceptor
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch specific chat data
  const fetchChatData = async (chatId, showLoading = true) => {
    try {
      if (!isLoaded || !isSignedIn || !isAuthInitialized) {
        return;
      }
      if (showLoading) {
        setIsChatLoading(true);
      }
      const response = await apiUtils.get(`/chat/${chatId}`);
      const data = response.data;
      if (data.success) {
        setCurrentChatData(data.chat);
        if (data.chat && data.chat.prompts) {
          const processingPrompt = data.chat.prompts.find(prompt => 
            !prompt.video && prompt.status === "processing"
          );
          if (processingPrompt) {
            startPolling(chatId, processingPrompt._id);
          }
        }
      }
    } catch (error) {
    } finally {
      if (showLoading) {
        setIsChatLoading(false);
      }
    }
  };

  // Function to poll prompt status
  const pollPromptStatus = async (chatId, promptId) => {
    try {
      const response = await apiUtils.get(`/chat/${chatId}/status/${promptId}`);
      const data = response.data;

      if (data.success) {
        const status = data.status;
        if (status === 'completed' || status === 'cancelled') {
          setGeneratingMessage('');
          setGeneratingPromptId(null);
          setIsGenerating({
            isGenerating: false,
          });
          clearPolling();
          fetchChatData(chatId, false);
        } else if (status === 'failed') {
          setGeneratingMessage('');
          setGeneratingPromptId(null);
          setIsGenerating({
            isGenerating: false,
          });
          clearPolling();
          setCurrentChatData(prevData => {
            if (!prevData) return prevData;
            return {
              ...prevData,
              prompts: prevData.prompts.map(p => 
                p._id === promptId 
                  ? { ...p, status: 'failed', video: null }
                  : p
              )
            };
          });
          setTimeout(() => fetchChatData(chatId, false), 1000);
        } else if (status === 'processing') {
          const message = data.message || 'Generating video...';
          setGeneratingMessage(message);
          setGeneratingPromptId(promptId);
          setIsGenerating({
            isGenerating: true,
          });
        }
      }
    } catch (error) {
      console.warn('Error polling prompt status:', error);
    }
  };

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Start polling for prompt status
  const startPolling = (chatId, promptId) => {
    clearPolling();

    setGeneratingPromptId(promptId);
    setGeneratingMessage('Starting video generation...');

    const intervalId = setInterval(() => {
      pollPromptStatus(chatId, promptId);
    }, 20000);
    pollingIntervalRef.current = intervalId;
    pollPromptStatus(chatId, promptId);
  };

  // Stop video generation process
  const stopVideoGeneration = async () => {
    if (!generatingPromptId || !activeChat) {
      clearPolling();
      setGeneratingPromptId(null);
      setGeneratingMessage('');
      setIsGenerating({
        isGenerating: false,
      });
      return;
    }
    try {
      await apiUtils.post(`/chat/${activeChat}/kill/${generatingPromptId}`);
    } catch (error) {
      // Suppress kill errors in production
    } finally {
      clearPolling();
      setGeneratingPromptId(null);
      setGeneratingMessage('');
      setIsGenerating({
        isGenerating: false,
      });
    }
  };

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    setActivePage(path);
    
    // If user is on the "New Chat" page (/chat), clear the active chat
    if (location.pathname === '/chat') {
      setActiveChat(null);
      setCurrentChatData(null);
    }
  }, [location]);

  useEffect(() => {
    // Initialize auth manager when component mounts
    if (isLoaded && isSignedIn && getToken) {
      authManager.initialize(getToken);
      // Set auth as initialized after a short delay
      setTimeout(() => {
        setIsAuthInitialized(true);
      }, 100);
    } else {
      setIsAuthInitialized(false);
    }
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    // Only fetch chats when Clerk is loaded and user is signed in
    if (isLoaded && isSignedIn) {
      // Add a small delay to ensure auth manager is initialized
      setTimeout(() => {
        fetchChats();
      }, 300);
    } else if (isLoaded && !isSignedIn) {
      navigate('/signin');
    }
  }, [isLoaded, isSignedIn]);

  // Handle URL parameters to load specific chat
  useEffect(() => {
    const chatId = searchParams.get('id');
    const promptId = searchParams.get('promptId');
    
    if (chatId && location.pathname.includes('/chat/chat') && isLoaded && isSignedIn && isAuthInitialized) {
      setActiveChat(chatId);
      setActivePage('chat');
      localStorage.setItem('animy_last_chat', chatId);
      
      // Add a delay to ensure auth manager is initialized
      setTimeout(() => {
        fetchChatData(chatId);
        
        // If we have a specific promptId (likely from Dashboard), start polling for it
        if (promptId) {
          setTimeout(() => {
            startPolling(chatId, promptId);
            // Clean up the URL by removing the promptId parameter
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('promptId');
            window.history.replaceState({}, '', newUrl);
          }, 500); // Additional delay to ensure chat data is loaded
        }
      }, 300);
    }
  }, [searchParams, location.pathname, isLoaded, isSignedIn, isAuthInitialized]);

  useEffect(() => {
    const lastChatId = localStorage.getItem('animy_last_chat');
    // Only restore from localStorage if:
    // 1. There's a lastChatId
    // 2. No chat ID in URL params
    // 3. Auth is ready
    // 4. User is NOT intentionally on the "New Chat" page (/chat)
    // 5. Chat exists in the list
    const isOnNewChatPage = location.pathname === '/chat';
    
    if (lastChatId && 
        !searchParams.get('id') && 
        isLoaded && 
        isSignedIn && 
        isAuthInitialized &&
        !isOnNewChatPage) {
      const chatExists = chatItems.some(chat => chat.id === lastChatId);
      if (chatExists) {
        setActiveChat(lastChatId);
        setActivePage('chat');
        // Navigate to the specific chat
        navigate(`/chat/chat?id=${lastChatId}`);
        // Fetch the chat data when restoring from localStorage with delay
        setTimeout(() => {
          fetchChatData(lastChatId);
        }, 400);
      }
    }
  }, [chatItems, isLoaded, isSignedIn, isAuthInitialized, location.pathname, navigate, searchParams]);
  
  const navItems = [
    { key: 'New Chat', label: 'New Chat', icon: MessageSquarePlus },
    { key: 'album', label: 'Albums', icon: Folder },
  ];
const renderMenuItem = (item) => {
    const { key, label, icon: Icon } = item;
    const isActive = activePage === key || (key === 'New Chat' && activePage === 'chat' && !activeChat);
    
    return (
      <SidebarMenuItem className="my-1" key={key}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={label}
          className={`
            w-64 h-14 flex items-center rounded-[15px] transition-all duration-100 hover:cursor-pointer
            ${isActive 
              ? "!bg-[#1A1F37] shadow-md" 
              : "hover:bg-[#1A1F37]/40 hover:shadow-md hover:translate-x-1"
            }
          `}          
          onClick={() => {
            if (key === 'album') {
              setAlbumOverlayOpen(true);
              setActivePage(key);
            } else if (key === 'New Chat') {
              // Navigate to new chat route
              setActiveChat(null);
              setCurrentChatData(null);
              setActivePage('chat');
              // Clear localStorage to prevent auto-restoration
              localStorage.removeItem('animy_last_chat');
              navigate('/chat');
            } else {
              navigate(`/${key}`);
              setActiveChat(null);
              setActivePage(key);
            }
          }}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] transition-all duration-100
            ${isActive 
              ? 'bg-gradient-to-br from-[#0075FF] to-blue-500 shadow-md shadow-blue-500/20'
              : 'bg-[#1A1F37]'
            }
          `}>
            <Icon className={`              
            h-4 w-4 transition-all duration-100
              ${isActive 
                ? 'text-white' 
                : 'text-[#0075FF]'
              }
            `}/>
          </div>
          <span className={`
          ml-3 font-medium transition-all duration-100
            ${isActive 
              ? 'text-white' 
              : 'text-gray-300'
            }
          `}>
            {label}
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };
  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    localStorage.setItem('animy_last_chat', chatId);
    setActivePage('chat');
    navigate(`/chat/chat?id=${chatId}`);
    
    // Fetch the specific chat data with a small delay to ensure auth is ready
    setTimeout(() => {
      fetchChatData(chatId);
    }, 200);
  };
  const handleChatRename = (chat) => {
    setEditingChatId(chat.id);
    setEditingChatName(chat.title);
    setOpenDropdownId(null);
    setBlurEnabled(false); // Disable blur temporarily
    
    // Focus the input after state update and re-enable blur after a delay
    setTimeout(() => {
      const input = document.querySelector(`input[data-chat-id="${chat.id}"]`);
      if (input) {
        input.focus();
        input.select();
        // Re-enable blur after input is focused and stable
        setTimeout(() => setBlurEnabled(true), 200);
      }
    }, 0);
  };

  const handleSaveChatName = async (chatId) => {
    if (editingChatName.trim()) {
      try {
        const response = await apiUtils.patch(`/chat/${chatId}/rename`, {
          title: editingChatName.trim()
        });
        
        const data = response.data;
        
        if (data.success) {
          // Update the chat name in the local state
          setChatItems(prevChatItems => 
            prevChatItems.map(chat => 
              chat.id === chatId 
                ? { ...chat, title: editingChatName.trim() }
                : chat
            )
          );
        } else {
          console.error('Failed to update chat name:', data.message);
        }
      } catch (error) {
        console.error('Error updating chat name:', error);
      }
    }
    setEditingChatId(null);
    setEditingChatName('');
    setBlurEnabled(true);
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingChatName('');
    setBlurEnabled(true);
  };

  const handleChatDelete = async (chat) => {
    try {
      const response = await apiUtils.delete(`/chat/${chat.id}`);
      
      const data = response.data;
      
      if (data.success) {

        setChatItems(prevChatItems => prevChatItems.filter(item => item.id !== chat.id));
        
        // If we're deleting the active chat, clear the active chat
        if (activeChat === chat.id) {
          setActiveChat(null);
          setActivePage('dashboard');
          localStorage.removeItem('animy_last_chat');
        }
      } else {
        console.error('Failed to delete chat:', data.message);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
    setOpenDropdownId(null);
  };

  // Function to handle video download
  const handleDownloadVideo = (videoPath, prompt) => {
    try {
      const link = document.createElement('a');
      link.href = videoPath;
      link.download = `animy-video-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.mp4`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      // Suppress download errors in production
    }
  };

  // Function to handle add to album
  const handleAddToAlbum = (videoData) => {
    setSelectedVideoData(videoData);
    setAddToAlbumOverlayOpen(true);
  };

  // Function to handle when video is successfully added to album
  const handleVideoAddedToAlbum = () => {
    // Close the overlay and reset selected video data
    setAddToAlbumOverlayOpen(false);
    setSelectedVideoData(null);
    // You could add a success notification here if needed
  };
  
  const renderChatItem = (chat) => {
    const isActive = activeChat === chat.id;
    const isHovered = hoveredChatId === chat.id;
    const isDropdownOpen = openDropdownId === chat.id;
    
    return (
      <SidebarMenuItem key={chat.id} className="my-0.5">
        <SidebarMenuButton
          isActive={isActive}
          className={`
            w-full py-3 px-3 flex items-center justify-between rounded-lg transition-all duration-100 hover:cursor-pointer
            ${isActive 
              ? "!bg-[#1A1F37] shadow-md hover:!bg-[#1A1F37]/80"
              : "hover:bg-[#1A1F37]/40"
            }
          `}
          onClick={() => handleChatClick(chat.id)}
          onMouseEnter={() => setHoveredChatId(chat.id)}
          onMouseLeave={() => setHoveredChatId(null)}
        >
          <div className="flex-1 min-w-0 pr-2">
            {editingChatId === chat.id ? (
              <input
                type="text"
                value={editingChatName}
                onChange={(e) => setEditingChatName(e.target.value)}
                onBlur={() => {
                  if (blurEnabled) {
                    handleSaveChatName(chat.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveChatName(chat.id);
                  } else if (e.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                className={`font-medium transition-all duration-100 bg-blue-900/30 border border-blue-400 rounded px-2 w-full focus:outline-none focus:border-blue-300 focus:bg-blue-900/40 relative z-[70] ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-300'
                }`}
                data-chat-id={chat.id}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={`
                font-medium transition-all duration-100 truncate block max-w-[95%]
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-300'
                }
              `}>
                {chat.title}
              </span>
            )}
          </div>
          <DropdownMenu onOpenChange={(open) => setOpenDropdownId(open ? chat.id : null)}>
            <DropdownMenuTrigger asChild>
              <div 
                className={`group transition-opacity duration-200 hover:cursor-pointer ${
                  isHovered || isDropdownOpen ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisIcon className='text-gray-300 group-hover:text-white transition-colors' size={16}/>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="bg-[#1A1F37] border-blue-900/30 shadow-lg min-w-[200px] w-fit"
            >
              <DropdownMenuItem 
                className='group text-gray-300 hover:!text-white hover:!bg-blue-900/30 cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  handleChatRename(chat);
                }}
              >
                <Edit3 className="mr-2 h-4 w-4 text-gray-300 group-hover:!text-white" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem className='text-red-400 hover:!text-red-400 hover:!bg-red-900/30 cursor-pointer'
                onClick={(e) => {
                  e.stopPropagation();
                  handleChatDelete(chat);
                }}
              >
                <Trash2Icon className="mr-2 h-4 w-4 text-red-400"/>Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };
  
  
  // Auto-scroll to bottom when chat data changes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentChatData?.prompts?.length]);

  // On initial page load, check for processing prompt and start polling
  useEffect(() => {
    // Only run on mount
    if (location.pathname.includes('/chat/chat') &&
      currentChatData && currentChatData.prompts &&
      !pollingIntervalRef.current
    ) {
      const processingPrompt = currentChatData.prompts.find(
        prompt => !prompt.video && prompt.status === 'processing'
      );
      // ...existing code...
      if (processingPrompt && activeChat) {
        setGeneratingPromptId(processingPrompt._id);
        setGeneratingMessage('Starting video generation...');
        startPolling(activeChat, processingPrompt._id);
      }
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, activeChat, currentChatData]);

  return (
    <div className="flex h-screen w-full relative">
      <img src="/WholeBg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div className="absolute inset-0 bg-black/60 z-10" />
        <SidebarProvider defaultOpen={true}>
            <Sidebar variant="sidebar" className="w-72 flex-shrink-0 backdrop-blur-[3.125vw] shadow-xl !border-0"
            style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%);'}}>          
                <SidebarHeader className="flex-row items-center justify-between w-full h-16 px-3 border-b border-blue-900/20 ">
                  <img src="/final.png" alt="Logo" className="w-16" />
                </SidebarHeader>                
                <SidebarContent className="px-3 overflow-hidden">
                    <SidebarMenu className="space-y-1 mt-4">
                        {navItems.map(renderMenuItem)}
                    </SidebarMenu>
                    
                    <SidebarGroupLabel className="px-2 text-gray-400 text-sm font-medium">Recent Chats</SidebarGroupLabel>
                    <SidebarMenu className="space-y-1 mt-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                        {isLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-6 w-full rounded-md bg-[#222846]" />
                            <Skeleton className="h-6 w-full rounded-md bg-[#222846]" />
                            <Skeleton className="h-6 w-full rounded-md bg-[#222846]" />
                            <Skeleton className="h-6 w-full rounded-md bg-[#222846]" />
                            <Skeleton className="h-6 w-full rounded-md bg-[#222846]" />
                          </div>
                        ) : chatItems.length > 0 ? (
                          chatItems.map(renderChatItem)
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-400 text-sm">No chats yet</p>
                            <p className="text-gray-500 text-xs mt-1">Start a new conversation</p>
                          </div>
                        )}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="mt-auto px-4">                    
                    <div 
                        className="m-2 overflow-hidden rounded-2xl min-h-[170px] flex flex-col justify-between p-5 shadow-xl relative border border-blue-900/40 bg-gradient-to-br from-[#060b28]/85 to-[#0a0e23]/85 backdrop-blur-md"
                    >
                        <img 
                            src="/SideBarFooter.png" 
                            alt="footer bg" 
                            className="absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none select-none" 
                            draggable="false"
                        />
                        <div className="flex items-center mb-3 relative z-10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                                <HelpCircleIcon className="h-6 w-6 text-white drop-shadow bg-gradient-to-br from-blue-600 to-blue-400 rounded-full" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-base font-bold text-white drop-shadow">Need help?</h3>
                            <p className="mt-1 text-xs text-blue-200/90">Please check our docs</p>
                        </div>                        
                        <button 
                            className="mt-4 w-full rounded-xl py-2 px-4 text-sm font-semibold text-white outline-none transition-transform duration-150 hover:scale-[1.03] hover:shadow-xl hover:cursor-pointer focus:ring-2 focus:ring-blue-500/70 focus:ring-offset-2 active:scale-95 border border-blue-700/40 backdrop-blur-md"
                            style={{
                              background:
                                'linear-gradient(127deg, rgba(6, 11, 40, 0.92) 28.26%, rgba(10, 14, 35, 0.91) 91.2%)',
                            }}
                            onClick={() => window.location.href = 'mailto:garggirish2020@gmail.com'}
                        >
                            CONTACT US
                        </button>
                    </div>
                </SidebarFooter>
            </Sidebar>        
            <SidebarInset className="flex-1 pt-6 bg-transparent text-white overflow-y-auto overflow-x-hidden min-w-0 relative z-10">              
              <div className='flex items-center px-6 justify-between'>             
                <div className="flex items-center gap-2">
                  <CustomTrigger />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink className="text-[#a0aec0] text-xl font-normal hover:text-[#a0aec0]">AnimY</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator/>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard" className="text-[#a0aec0] text-xl font-normal hover:text-white">Dashboard</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator/>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-white text-xl font-medium">
                          {activeChat ? chatItems.find(chat => chat.id === activeChat)?.title || 'Chat' : 'New Chat'}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <BellIcon className='size-5 text-[#a0aec0] hover:text-white transition-colors hover:cursor-pointer'/>
              </div>
              <div className="mt-6 flex flex-col h-[calc(100vh-100px)] overflow-hidden">
                {activeChat ? (                  
                  <div className="flex flex-col h-full">
                    <div
                      className="flex-1 overflow-y-auto px-8 backdrop-blur-sm rounded-2xl py-4 custom-scrollbar"
                      ref={chatContainerRef}
                    >
                      {isChatLoading ? (
                        <div className="space-y-4 px-2 py-2">
                          <div className="flex justify-end">
                            <Skeleton className="w-[50%] h-12 rounded-full bg-[#222846]" />
                          </div>
                          <div className="flex justify-center">
                            <Skeleton className="w-[80%] aspect-video rounded-xl bg-[#222846]" />
                          </div>
                        </div>
                      ) : currentChatData && currentChatData.prompts?.length > 0 ? (
                        <div className="space-y-4 pb-4">
                          {currentChatData.prompts.map((prompt, index) => (
                            <div key={prompt._id} className="flex flex-col space-y-3">
                              {/* User Message */}
                              <div className="flex justify-end">
                                <div className="max-w-[70%] bg-[#0F1535] text-gray-500 border border-zinc-600/80 rounded-full px-4 py-3 shadow-sm">
                                  <p className="text-sm leading-relaxed">{prompt.prompt}</p>
                                </div>
                              </div>
                              
                              {/* Video Response */}
                              {prompt.video ? (
                                <div className="flex justify-center">
                                  <div className="w-[80%] rounded-2xl rounded-tr-md p-3">
                                    <div className="relative group">
                                      <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                        <video 
                                          controls
                                          poster={prompt.video.thumbnailPath}
                                          className="w-full h-full object-cover custom-video-controls"
                                          preload="metadata"
                                          controlsList="nodownload noremoteplayback"
                                          disablePictureInPicture
                                        >
                                          <source src={prompt.video.videoPath} type="video/mp4" />
                                          Your browser does not support the video tag.
                                        </video>
                                      </div>
                                      
                                      {/* Hover buttons below the video */}
                                      <div className="flex items-start justify-start my-1 mx-2 gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                          onClick={() => handleDownloadVideo(prompt.video.videoPath, prompt.prompt)}
                                          className="flex items-center justify-center text-gray-300 hover:text-white rounded-full transition-colors duration-200 hover:scale-110"
                                          title="Download Video"
                                        >
                                          <Download size={18} />
                                        </button>
                                        
                                        <button
                                          onClick={() => handleAddToAlbum({
                                            videoPath: prompt.video.videoPath,
                                            thumbnailPath: prompt.video.thumbnailPath,
                                            chatId: activeChat,
                                            promptText: prompt.prompt
                                          })}
                                          className="flex items-center justify-center text-gray-300 hover:text-white rounded-full transition-colors duration-200 hover:scale-110"
                                          title="Add to Album"
                                        >
                                          <FolderPlus size={18} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : prompt.status === 'failed' ? (
                                <div className="flex justify-center">
                                  <div className="w-[80%] h-fit rounded-2xl rounded-tr-md p-3">
                                    <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-red-900/20 via-red-600/30 to-red-900/20 border border-red-500/30">
                                      <div className="flex items-center justify-center h-full">
                                        <div className="text-center py-2">
                                          <p className="text-red-400 text-lg font-medium">Video Generation Failed</p>
                                          <p className="text-red-300 text-sm mt-2">Something went wrong while creating your video</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : generatingPromptId === prompt._id ? (
                                <div className="flex justify-center">
                                  <div className="w-[80%] rounded-2xl rounded-tr-md p-3">
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-r from-blue-900/20 via-blue-600/30 to-blue-900/20 animate-pulse">
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                                      <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                                          <p className="text-white text-lg font-medium">{generatingMessage || 'Generating your video...'}</p>
                                          <p className="text-blue-200 text-sm mt-2">This may take a few moments</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <p className="text-gray-600">No messages in this chat yet</p>
                          <p className="text-gray-400 text-sm mt-1">Start the conversation below</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 px-6 py-6">
                      <form onSubmit={handleSubmit} className="relative">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-full bg-[#131631] text-white border border-blue-900/30 rounded-full py-3 px-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder={isThrottled ? `Wait ${formatTimeRemaining(localThrottleTimeRemaining)}` : "Describe your animation scene..."}
                          aria-label="Scene description"
                          disabled={isGenerating.isGenerating || isThrottled}
                        />
                        {isGenerating.isGenerating ? (
                          <button 
                            type="button"
                            onClick={stopVideoGeneration}
                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-600 hover:cursor-pointer transition-colors"
                            aria-label="Stop generation"
                          >
                            <CircleStop size={18} />
                          </button>
                        ) : (
                          <button 
                            type="submit" 
                            className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 hover:cursor-pointer transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                            disabled={!inputValue.trim() || isThrottled || isGenerating.isGenerating}
                            aria-label="Submit"
                          >
                            <SendIcon size={18} />
                          </button>
                        )}
                      </form>
                    </div>
                  </div>
                ) : (                  
                <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] px-6">
                    <div className="max-w-2xl w-full flex flex-col items-center">
                      {isCreatingNewChat ? (
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-white text-lg font-medium">Creating your chat...</p>
                          <p className="text-blue-200 text-sm mt-2">Setting up your conversation</p>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-3xl font-bold text-white mb-4">What are you waiting for</h2>
                          <p className="text-2xl text-white mb-12">start creating</p>
                          {isThrottled && (
                            <div className="mb-6 p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg text-center max-w-md mx-auto">
                              <p className="text-orange-400 text-base font-medium">Limit active</p>
                              <p className="text-orange-300 text-sm mt-2">
                                Next prompt available in: {formatTimeRemaining(localThrottleTimeRemaining)}
                              </p>
                            </div>
                          )}
                          <form onSubmit={handleSubmit} className="relative flex-grow flex flex-col justify-center w-full">
                            <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              className="w-full bg-[#131631] text-white border border-blue-900/30 rounded-full py-3 px-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                              placeholder = {isThrottled ? `Wait ${formatTimeRemaining(localThrottleTimeRemaining)}` : "Describe your animation scene the way you want."}
                              aria-label="Scene description"
                              disabled={isGenerating.isGenerating || isCreatingNewChat || isThrottled}
                            />
                            {isGenerating.isGenerating ? (
                              <button 
                                type="button"
                                onClick={stopVideoGeneration}
                                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-600 hover:cursor-pointer transition-colors"
                                aria-label="Stop generation"
                              >
                                <CircleStop size={18} />
                              </button>
                            ) : (
                              <button 
                                type="submit" 
                                className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 hover:cursor-pointer transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                                disabled={!inputValue.trim() || isCreatingNewChat || isThrottled || isGenerating.isGenerating}
                                aria-label="Submit"
                              >
                                <SendIcon size={18} />
                              </button>
                            )}
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <AlbumOverlay 
                isOpen={albumOverlayOpen}
                onClose={() => {
                  setAlbumOverlayOpen(false);
                  setActivePage(null);
                }} 
                albumData={selectedAlbum}
              />
              
              <AddToAlbumOverlay
                isOpen={addToAlbumOverlayOpen}
                onClose={() => {
                  setAddToAlbumOverlayOpen(false);
                  setSelectedVideoData(null);
                }}
                onVideoAdded={handleVideoAddedToAlbum}
                videoPath={selectedVideoData?.videoPath}
                thumbnailPath={selectedVideoData?.thumbnailPath}
                chatId={selectedVideoData?.chatId}
              />            
              </SidebarInset>
        </SidebarProvider>
    </div>
  );
}