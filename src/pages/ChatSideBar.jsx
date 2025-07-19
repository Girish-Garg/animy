import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroupLabel,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import AlbumOverlay from '../components/AlbumOverlay';
import { generateMockAlbumData } from '../lib/albumUtils';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { 
  HomeIcon, 
  Disc,
  CreditCardIcon, 
  SettingsIcon, 
  UserIcon,
  HelpCircleIcon,
  SlashIcon,
  NotebookIcon,
  BellIcon,
  PanelLeft,
  Folder,
  MessageSquarePlus,
  MessageCircle,
  SendIcon,
  EllipsisVerticalIcon,
  Trash2Icon,
  EllipsisIcon,
  Edit3,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');
  const [albumOverlayOpen, setAlbumOverlayOpen] = useState(false);  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState('');
  const [blurEnabled, setBlurEnabled] = useState(true);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    console.log('Submitted:', inputValue);
    setInputValue('');
  };
  const [chatItems, setChatItems] = useState([
    { id: 'chat-1', title: 'Understanding AI Basics' },
    { id: 'chat-2', title: 'Creative Video Ideas' },
    { id: 'chat-3', title: 'Animation Techniques' },
    { id: 'chat-4', title: 'Modern UI Design' },
    { id: 'chat-5', title: 'Visual Effects Tutorial' }
  ]);
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    setActivePage(path);
  }, [location]);
  useEffect(() => {
    const lastChatId = localStorage.getItem('animy_last_chat');
    if (lastChatId) {
      const chatExists = chatItems.some(chat => chat.id === lastChatId);
      if (chatExists) {
        setActiveChat(lastChatId);
        setActivePage('chat');
      }
    }
  }, [chatItems]);
  
  const navItems = [
    { key: 'New Chat', label: 'New Chat', icon: MessageSquarePlus },
    { key: 'album', label: 'Albums', icon: Folder },
  ];
const renderMenuItem = (item) => {
    const { key, label, icon: Icon } = item;
    const isActive = activePage === key;
    
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
              const mockAlbums = Array(6).fill().map((_, i) => ({
                id: `album-${i}`,
                albumName: `Album ${i + 1}`,
                coverImage: '',
                videos: generateMockAlbumData(Math.floor(Math.random() * 6) + 2).videos,
              }));
              
              setSelectedAlbum({
                albums: mockAlbums
              });
              setAlbumOverlayOpen(true);
              setActivePage(key);
            } else if (key === 'New Chat') {
              handleNewChat();
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
    
    console.log(`Opening chat ${chatId}`);
  };
  const handleNewChat = () => {
    const newChat = {
      id: `chat-${chatItems.length + 1}`,
      title: `New Chat ${chatItems.length + 1}`
    };    setChatItems([newChat, ...chatItems]);
    setActiveChat(newChat.id);
    setActivePage('chat');
    localStorage.setItem('animy_last_chat', newChat.id);  };

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

  const handleSaveChatName = (chatId) => {
    if (editingChatName.trim()) {
      console.log('Save chat name:', editingChatName, 'for chat:', chatId);
      // Update the chat name in the chatItems array
      setChatItems(prevChatItems => 
        prevChatItems.map(chat => 
          chat.id === chatId 
            ? { ...chat, title: editingChatName.trim() }
            : chat
        )
      );
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

  const handleChatDelete = (chat) => {
    console.log('Delete chat:', chat.title);
    setChatItems(prevChatItems => prevChatItems.filter(item => item.id !== chat.id));
    
    // If we're deleting the active chat, clear the active chat
    if (activeChat === chat.id) {
      setActiveChat(null);
      setActivePage('dashboard');
      localStorage.removeItem('animy_last_chat');
    }
    setOpenDropdownId(null);
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
          <div className="flex-1 min-w-0">
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
                font-medium transition-all duration-100 truncate
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
              <button 
                className={`group transition-opacity duration-200 hover:cursor-pointer ${
                  isHovered || isDropdownOpen ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisIcon className='text-gray-300 group-hover:text-white transition-colors' size={16}/>
              </button>
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
                        {chatItems.length > 0 ? (
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
            <SidebarInset className="flex-1 p-6 bg-transparent text-white overflow-y-auto overflow-x-hidden min-w-0 relative z-10">              <div className='flex items-center justify-between'>                
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
              <div className="mt-6">
                {activeChat ? (                  
                  <div className="flex flex-col h-[calc(100vh-140px)] px-6">
                    <div className="flex-1 overflow-y-auto mb-4">
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-gray-300">Your conversation will appear here</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <form onSubmit={handleSubmit} className="relative">
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
                          <SendIcon size={18} />
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (                  
                <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] px-6">
                    <div className="max-w-2xl w-full flex flex-col items-center">
                      <h2 className="text-3xl font-bold text-white mb-4">What are you waiting for</h2>
                      <p className="text-2xl text-white mb-12">start creating</p>
                      <form onSubmit={handleSubmit} className="relative flex-grow flex flex-col justify-center w-full">
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="w-full bg-[#131631] text-white border border-blue-900/30 rounded-full py-3 px-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                          placeholder="Describe your animation scene the way you want."
                          aria-label="Scene description"
                        />
                        <button 
                          type="submit" 
                          className="absolute right-5 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 hover:cursor-pointer transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                          disabled={!inputValue.trim()}
                          aria-label="Submit"
                        >
                          <SendIcon size={18} />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
              <AlbumOverlay 
                isOpen={albumOverlayOpen}
                onClose={() => {
                  setAlbumOverlayOpen(false);
                }} 
                albumData={selectedAlbum}
              />            
              </SidebarInset>
        </SidebarProvider>
    </div>
  );
}