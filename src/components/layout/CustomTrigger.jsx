import { PanelLeft } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

// Shared sidebar toggle button (was duplicated in SideBar and ChatSideBar).
export default function CustomTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      onClick={toggleSidebar}
      className="group hover:cursor-pointer p-2 hover:bg-[#1A1F37]/40 rounded-lg transition-all duration-100"
      aria-label="Toggle sidebar"
    >
      <PanelLeft className="size-[18px] text-[#a0aec0] group-hover:text-white transition-colors" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}
