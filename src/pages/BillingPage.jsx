import React from 'react';

export default function BillingPage() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="p-6 bg-[#1A1F37]/80 rounded-xl shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-300">
        <h2 className="text-xl font-medium">Billing</h2>
        <p className="mt-2 text-gray-400">Manage your subscription plans and payment methods here.</p>
      </div>
    </div>
  );
}
