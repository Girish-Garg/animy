import { HelpCircleIcon } from 'lucide-react';
import { SUPPORT_EMAIL } from '@/lib/config';

// Shared "Need help?" footer card (was duplicated in SideBar and ChatSideBar).
export default function SidebarHelpCard() {
  return (
    <div className="m-2 overflow-hidden rounded-2xl min-h-[170px] flex flex-col justify-between p-5 shadow-xl relative border border-blue-900/40 bg-gradient-to-br from-[#060b28]/85 to-[#0a0e23]/85 backdrop-blur-md">
      <img
        src="/SideBarFooter.png"
        alt=""
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
        style={{ background: 'linear-gradient(127deg, rgba(6, 11, 40, 0.92) 28.26%, rgba(10, 14, 35, 0.91) 91.2%)' }}
        onClick={() => {
          window.location.href = `mailto:${SUPPORT_EMAIL}`;
        }}
      >
        CONTACT US
      </button>
    </div>
  );
}
