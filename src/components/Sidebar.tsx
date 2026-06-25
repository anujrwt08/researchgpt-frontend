/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Paper, User } from '../types';
import { 
  FileText, 
  LayoutDashboard, 
  Sparkles, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Cpu, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Columns
} from 'lucide-react';

interface SidebarProps {
  papers: Paper[];
  activePaperName: string | null;
  activeTab: 'dashboard' | 'chat' | 'compare';
  currentUser: User | null;
  isSandbox: boolean;
  onSelectPaper: (paperName: string) => void;
  onSelectTab: (tab: 'dashboard' | 'chat' | 'compare') => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onUploadClick: () => void;
  onDeletePaper: (paperName: string) => void;
}

export default function Sidebar({
  papers,
  activePaperName,
  activeTab,
  currentUser,
  isSandbox,
  onSelectPaper,
  onSelectTab,
  onLogout,
  onOpenSettings,
  onUploadClick,
  onDeletePaper
}: SidebarProps) {
  
  return (
    <aside id="sidebar_nav" className="w-80 bg-[#050b18] border-r border-slate-800/60 flex flex-col h-screen text-slate-300 shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-none">ResearchGPT</h1>
            <span className="text-[10px] text-slate-500 font-mono mt-1 block">
              {isSandbox ? "SANDBOX MODE" : "FASTAPI BACKEND"}
            </span>
          </div>
        </div>
        <button
          id="sidebar_settings_btn"
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-slate-800/40 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Connection Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="p-4 space-y-1.5">
        <button
          id="nav_dashboard_btn"
          onClick={() => onSelectTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
            activeTab === 'dashboard' 
              ? 'bg-slate-800/40 border border-slate-700/50 text-cyan-400 font-semibold' 
              : 'hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard & Stats</span>
        </button>

        <button
          id="nav_compare_btn"
          onClick={() => onSelectTab('compare')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
            activeTab === 'compare' 
              ? 'bg-slate-800/40 border border-slate-700/50 text-cyan-400 font-semibold' 
              : 'hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Columns className="w-4 h-4 shrink-0" />
          <span>Compare Workspace</span>
        </button>
      </div>

      {/* Papers Section Header */}
      <div className="px-6 py-2 flex items-center justify-between text-slate-500">
        <span className="text-xs font-bold uppercase tracking-wider">Research Papers</span>
        <button
          id="sidebar_add_paper_btn"
          onClick={onUploadClick}
          className="p-1 hover:bg-slate-800 hover:text-white rounded text-slate-400 transition-colors cursor-pointer"
          title="Add New Paper"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Papers List */}
      <div id="sidebar_papers_list" className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {papers.length === 0 ? (
          <div className="p-4 text-center rounded-xl bg-slate-950/20 border border-dashed border-slate-800/60">
            <p className="text-xs text-slate-500 leading-relaxed">
              No indexed papers yet. Click '+' or go to Dashboard to upload a PDF.
            </p>
          </div>
        ) : (
          papers.map((paper) => {
            const isSelected = activePaperName === paper.paper_name && activeTab === 'chat';
            return (
              <div 
                key={paper.paper_name}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-sm transition-all duration-150 relative border ${
                  isSelected 
                    ? 'bg-slate-800/40 border-slate-700/50 text-white font-semibold' 
                    : 'hover:bg-slate-800/30 hover:text-slate-200 text-slate-400 border-transparent'
                }`}
              >
                <div 
                  className="flex-1 min-w-0 flex items-center gap-2.5 cursor-pointer"
                  onClick={() => onSelectPaper(paper.paper_name)}
                >
                  <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <div className="truncate text-left">
                    <span className="block truncate text-xs leading-tight">{paper.paper_name}</span>
                    <span className="text-[9px] text-slate-500 font-mono block mt-0.5 leading-none">
                      {paper.chunks || 0} chunks • {paper.pages || '?'} pgs
                    </span>
                  </div>
                </div>

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 z-10">
                  <button
                    onClick={() => onDeletePaper(paper.paper_name)}
                    className="p-1 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                    title="Delete Paper"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Info / Footer */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/30">
        <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {currentUser?.name?.slice(0, 2).toUpperCase() || 'EX'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-bold text-white truncate leading-tight">{currentUser?.name || 'Explorer'}</span>
            <span className="block text-[10px] text-slate-500 truncate mt-0.5 uppercase tracking-wider">Trial Active</span>
          </div>
          <button
            id="logout_btn"
            onClick={onLogout}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
