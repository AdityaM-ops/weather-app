
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { AppTab } from '../types';

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-[#1F2A44] h-screen fixed left-0 top-0 text-white flex flex-col z-50">
      <div className="p-8 border-b border-white/5">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span className="text-[#4A90E2]">Sky</span>Sync
        </h1>
        <p className="text-[10px] text-[#AAB2C0] mt-1 uppercase tracking-[0.2em] font-black">Weather Intel Engine</p>
      </div>
      
      <nav className="flex-1 p-5 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
              activeTab === item.id 
              ? 'bg-[#4A90E2] text-white shadow-xl shadow-blue-500/20 translate-x-1' 
              : 'text-[#AAB2C0] hover:bg-white/5 hover:text-white'
            }`}
          >
            {/* Cast icon to React.ReactElement<any> to fix type error when injecting className */}
            {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
            <span className="font-semibold text-sm tracking-tight">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
