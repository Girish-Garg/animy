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
} from "@/components/ui/sidebar";
import { 
  HomeIcon, 
  Disc,
  CreditCardIcon, 
  SettingsIcon, 
  UserIcon,
  HelpCircleIcon,
} from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState('dashboard');
  
  // Extract the current path without leading slash
  useEffect(() => {
    const path = location.pathname.replace(/^\//, '') || 'dashboard';
    setActivePage(path);
  }, [location]);
  
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { key: 'projects', label: 'Projects', icon: Disc },
    { key: 'billing', label: 'Billing', icon: CreditCardIcon },
    { key: 'settings', label: 'Settings', icon: SettingsIcon },
  ];
  
  const accountItems = [
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
          className={`
            w-64 h-14 flex items-center rounded-[15px] transition-all duration-100 hover:cursor-pointer
            ${isActive 
              ? "!bg-[#1A1F37] shadow-md" 
              : "hover:bg-[#1A1F37]/40 hover:shadow-md hover:translate-x-1"
            }
          `}
          onClick={() => {
            navigate(`/${key}`);
            setActivePage(key);
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
    return (
    <div className="flex h-screen w-full relative">
      <img src="/WholeBg.png" alt="" className="absolute inset-0 w-full h-full object-cover z-0" />
      <div class="absolute inset-0 bg-black/60 z-10" />
        <SidebarProvider defaultOpen={true}>
            <Sidebar variant="sidebar" className="w-72 flex-shrink-0 backdrop-blur-[3.125vw] shadow-xl !border-0"
            style={{background: 'linear-gradient(112deg, rgba(6, 11, 38, 0.94) 59.3%, rgba(26, 31, 55, 0.00) 100%);'}}>          
                <SidebarHeader className="flex w-full items-start justify-baseline py-4 px-3 border-b border-blue-900/20">                    
                <div className="flex items-center space-x-5 py-2 pl-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md hover:bg-blue-500/30 transition-all duration-300"></div>
                            <img 
                                src='/Favicon.svg' 
                                alt="Logo" 
                                className="h-11 w-11 -rotate-90 relative z-10 scale-150" 
                            />
                        </div>
                        <div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent tracking-wide select-none">AnimY</span>
                            <div className="text-xs text-blue-400/80 select-none">Animation Platform</div>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="px-3 overflow-hidden">                    
                    <SidebarMenu className="space-y-1">
                        {navItems.map(renderMenuItem)}
                    </SidebarMenu>
                    
                    <SidebarGroupLabel className="text-gray-400 px-2 pb-2 font-medium tracking-wide text-xs">
                        ACCOUNT PAGES
                    </SidebarGroupLabel>
                      <SidebarMenu className="space-y-1">
                        {accountItems.map(renderMenuItem)}
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
            <div className="flex justify-between items-baseline mb-8">
              <SidebarTrigger className="mr-4 hover:cursor-pointer p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h1>
              <div className="flex-1"></div>
            </div>
            <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}