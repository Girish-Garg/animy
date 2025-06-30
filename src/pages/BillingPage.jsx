import React from 'react';
import { CalendarClock } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="p-8 bg-[#0c1d43]/70 rounded-xl shadow-lg border border-blue-900/30 text-center max-w-xl w-full">
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-blue-900/30 flex items-center justify-center">
            <CalendarClock size={40} className="text-blue-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-white">Coming Soon</h1>
        <p className="text-gray-300 mb-6">
          Our billing system is currently under development. Check back soon for subscription options and payment methods.
        </p>
        
        <div className="inline-block bg-blue-600/70 text-white px-5 py-2.5 rounded-lg">
          Launching Soon
        </div>
      </div>
    </div>
  );
}
