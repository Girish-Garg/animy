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
import { HomeIcon, CreditCardIcon, UserIcon, BellIcon, Folder } from "lucide-react";
import CustomTrigger from '@/components/layout/CustomTrigger';
import SidebarHelpCard from '@/components/layout/SidebarHelpCard';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');
  const [albumOverlayOpen, setAlbumOverlayOpen] = useState(false);

  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    setActivePage(path);
  }, [location]);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { key: 'album', label: 'Albums', icon: Folder },
    { key: 'billing', label: 'Billing', icon: CreditCardIcon },
    { key: 'profile', label: 'Profile', icon: UserIcon },
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
            <Icon className={`h-4 w-4 transition-all duration-100 ${isActive ? 'text-white' : 'text-[#0075FF]'}`} />
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
        <Sidebar
          variant="sidebar"
          className="w-72 flex-shrink-0 backdrop-blur-[3.125vw] shadow-xl !border-0"
          style={{ background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%)' }}
        >
          <SidebarHeader className="flex-row items-center justify-between w-full h-16 px-3 border-b border-blue-900/20 ">
            <img src="/final.png" alt="Logo" className="w-16" />
          </SidebarHeader>
          <SidebarContent className="px-3 overflow-hidden">
            <SidebarMenu className="space-y-1">
              {navItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="mt-auto px-4">
            <SidebarHelpCard />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 p-6 bg-transparent text-white overflow-y-auto overflow-x-hidden min-w-0 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CustomTrigger />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink className="text-[#a0aec0] text-xl font-normal hover:text-[#a0aec0]">AnimY</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-white text-xl font-medium">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <button type="button" aria-label="Notifications" className="hover:cursor-pointer">
              <BellIcon className="size-5 text-[#a0aec0] hover:text-white transition-colors" />
            </button>
          </div>
          <Outlet />
          <AlbumOverlay
            isOpen={albumOverlayOpen}
            onClose={() => {
              setAlbumOverlayOpen(false);
              setActivePage('dashboard');
              navigate('/dashboard');
            }}
          />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
