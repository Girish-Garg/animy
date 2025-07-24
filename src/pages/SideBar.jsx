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
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import AlbumOverlay from '../components/AlbumOverlay';
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
  CreditCardIcon, 
  UserIcon,
  HelpCircleIcon,
  BellIcon,
  PanelLeft,
  Folder,
} from "lucide-react";
import { useUser } from '@clerk/clerk-react';

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
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');
  const [albumOverlayOpen, setAlbumOverlayOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    setActivePage(path);
  }, [location]);
  
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { key: 'album', label: 'Albums', icon: Folder },
    { key: 'billing', label: 'Billing', icon: CreditCardIcon },
    { key: 'profile', label: 'Profile', icon: UserIcon }
  ];

  const renderMenuItem = (item) => {
    const { key, label, icon: Icon } = item;
    const isActive = activePage === key;
    return (
      <SidebarMenuItem className="my-1" key={key}>
        <SidebarMenuButton
          isActive={isActive}
          tooltip={label}
          className={`w-64 h-14 flex items-center rounded-[15px] transition-all duration-100 hover:cursor-pointer ${isActive ? "!bg-[#1A1F37] shadow-md" : "hover:bg-[#1A1F37]/40 hover:shadow-md hover:translate-x-1"}`}
          onClick={() => {
            if (key === 'album') {
              setAlbumOverlayOpen(true);
            } else {
              navigate(`/${key}`);
            }
            setActivePage(key);
          }}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-[12px] transition-all duration-100 ${isActive ? 'bg-gradient-to-br from-[#0075FF] to-blue-500 shadow-md shadow-blue-500/20' : 'bg-[#1A1F37]'}`}>
            <Icon className={`h-4 w-4 transition-all duration-100 ${isActive ? 'text-white' : 'text-[#0075FF]'}`}/>
          </div>
          <span className={`ml-3 font-medium transition-all duration-100 ${isActive ? 'text-white' : 'text-gray-300'}`}>{label}</span>
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
            style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)'}}>          
                <SidebarHeader className="flex-row items-center justify-between w-full h-16 px-3 border-b border-blue-900/20 ">
                  <img src="/final.png" alt="Logo" className="w-16" />
                </SidebarHeader>
                <SidebarContent className="px-3 overflow-hidden">                    
                    <SidebarMenu className="space-y-1">
                        {navItems.map(renderMenuItem)}
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
            <SidebarInset className="flex-1 p-6 bg-transparent text-white overflow-y-auto overflow-x-hidden min-w-0 relative z-10">
              <div className='flex items-center justify-between'>                
                <div className="flex items-center gap-2">
                  <CustomTrigger />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink className="text-[#a0aec0] text-xl font-normal hover:text-[#a0aec0]">AnimY</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator/>
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-white text-xl font-medium">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <BellIcon className='size-5 text-[#a0aec0] hover:text-white transition-colors hover:cursor-pointer'/>
              </div>            
              <Outlet />
              {/* Album Overlay */}
            <AlbumOverlay 
              isOpen={albumOverlayOpen}
              onClose={() => {
                setAlbumOverlayOpen(false);
                setActivePage('dashboard');
                navigate('/dashboard');
              }} 
              albumData={selectedAlbum}
            />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}