/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from './api';
import { User, Paper, DashboardStats } from './types';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import CompareWorkspace from './components/CompareWorkspace';
import SettingsModal from './components/SettingsModal';
import { FileUp, Sliders, LayoutDashboard, Brain, Cpu, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(api.getCurrentUser());
  const [isSandbox, setIsSandbox] = useState(api.isSandbox());
  const [apiConnected, setApiConnected] = useState(false);
  
  // Navigation states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'compare'>('dashboard');
  const [activePaperName, setActivePaperName] = useState<string | null>(null);
  
  // Comparative initial selections
  const [comparePaper1, setComparePaper1] = useState('');
  const [comparePaper2, setComparePaper2] = useState('');

  // Loaded database state
  const [papers, setPapers] = useState<Paper[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_papers: 0,
    total_questions: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Settings Modal state
  const [showSettings, setShowSettings] = useState(false);

  // Heartbeat check for FastAPI backend in non-sandbox mode
  const checkApiHeartbeat = async () => {
    if (api.isSandbox()) {
      setApiConnected(true);
      return;
    }
    try {
      const response = await fetch(`${api.getApiUrl()}/`);
      if (response.ok) {
        setApiConnected(true);
      } else {
        setApiConnected(false);
      }
    } catch (e) {
      setApiConnected(false);
    }
  };

  // Sync settings across client
  const refreshWorkspaceConfigs = () => {
    setIsSandbox(api.isSandbox());
    setCurrentUser(api.getCurrentUser());
    checkApiHeartbeat();
  };

  // Load papers and stats
  const loadWorkspaceData = async () => {
    if (!currentUser) return;
    setLoadingStats(true);
    try {
      // Load papers
      const listedPapers = await api.listPapers();
      setPapers(listedPapers);
      
      // Load stats
      const statsObj = await api.getDashboardStats();
      setStats(statsObj);
    } catch (err) {
      console.error("Failed to load workspace files and stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Initial and reactive effects
  useEffect(() => {
    checkApiHeartbeat();
    const interval = setInterval(checkApiHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [isSandbox]);

  useEffect(() => {
    loadWorkspaceData();
  }, [currentUser, isSandbox]);

  // Auth handler
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    refreshWorkspaceConfigs();
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setPapers([]);
    setActivePaperName(null);
    setActiveTab('dashboard');
  };

  // Upload handler
  const handleUploadPaper = async (file: File) => {
    // Call client upload api
    const newPaper = await api.uploadPaper(file);
    
    // Call index/embed document
    await api.indexPaper(newPaper.paper_name);
    
    // Reload database list
    await loadWorkspaceData();
  };

  // Delete handler
  const handleDeletePaper = async (paperName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${paperName}"? This will clear its vectors in ChromaDB.`);
    if (!confirmDelete) return;

    try {
      await api.deletePaper(paperName);
      if (activePaperName === paperName) {
        setActivePaperName(null);
        setActiveTab('dashboard');
      }
      await loadWorkspaceData();
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    }
  };

  // Select paper
  const handleSelectPaper = (paperName: string) => {
    setActivePaperName(paperName);
    setActiveTab('chat');
  };

  // Open comparison workspace from dashboard
  const handleCompareFromDashboard = (p1: string, p2: string) => {
    setComparePaper1(p1);
    setComparePaper2(p2);
    setActiveTab('compare');
  };

  // Check if authenticated
  if (!currentUser) {
    return (
      <Auth 
        onAuthSuccess={handleAuthSuccess}
        isSandbox={isSandbox}
        onToggleSandbox={(val) => {
          api.setSandbox(val);
          setIsSandbox(val);
        }}
      />
    );
  }

  return (
    <div id="app_root" className="flex h-screen w-screen bg-[#020617] overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        papers={papers}
        activePaperName={activePaperName}
        activeTab={activeTab}
        currentUser={currentUser}
        isSandbox={isSandbox}
        onSelectPaper={handleSelectPaper}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
        onUploadClick={() => setActiveTab('dashboard')}
        onDeletePaper={handleDeletePaper}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#020617]">
        {/* Atmospheric Ambient Lights from Immersive UI theme */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full z-0"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none rounded-full z-0"></div>

        {/* Content container aligned with backdrop */}
        <div className="flex-grow flex flex-col relative z-10 h-full overflow-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              papers={papers}
              stats={stats}
              loadingStats={loadingStats}
              onSelectPaper={handleSelectPaper}
              onUploadPaper={handleUploadPaper}
              onDeletePaper={handleDeletePaper}
              onComparePapers={handleCompareFromDashboard}
              isSandbox={isSandbox}
              apiConnected={apiConnected}
              onRefreshStats={loadWorkspaceData}
            />
          )}

          {activeTab === 'chat' && activePaperName && (
            <ChatInterface 
              paperName={activePaperName} 
            />
          )}

          {activeTab === 'chat' && !activePaperName && (
            <div className="flex-1 bg-transparent flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500 mb-4 shadow-lg shadow-cyan-500/5">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5">No Active Paper Selected</h2>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Select an indexed research document from the sidebar to query embeddings, view summaries, or test comprehension.
              </p>
            </div>
          )}

          {activeTab === 'compare' && (
            <CompareWorkspace
              papers={papers}
              initialPaper1={comparePaper1}
              initialPaper2={comparePaper2}
            />
          )}
        </div>
      </main>

      {/* Configuration modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSettingsSaved={refreshWorkspaceConfigs}
        />
      )}

    </div>
  );
}
