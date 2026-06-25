/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Paper, DashboardStats } from '../types';
import { 
  FileText, 
  Upload, 
  Search, 
  Database, 
  MessageSquare, 
  Users, 
  ShieldCheck, 
  Plus, 
  FileUp, 
  ArrowRight, 
  Columns, 
  Sparkles,
  RefreshCw,
  Clock,
  HardDrive
} from 'lucide-react';

interface DashboardProps {
  papers: Paper[];
  stats: DashboardStats;
  loadingStats: boolean;
  onSelectPaper: (paperName: string) => void;
  onUploadPaper: (file: File) => Promise<void>;
  onDeletePaper: (paperName: string) => void;
  onComparePapers: (paper1: string, paper2: string) => void;
  isSandbox: boolean;
  apiConnected: boolean;
  onRefreshStats: () => void;
}

export default function Dashboard({
  papers,
  stats,
  loadingStats,
  onSelectPaper,
  onUploadPaper,
  onDeletePaper,
  onComparePapers,
  isSandbox,
  apiConnected,
  onRefreshStats
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
  // Compare dropdown states
  const [comparePaper1, setComparePaper1] = useState('');
  const [comparePaper2, setComparePaper2] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploadError('');

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileProcess(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleFileProcess(file);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF documents are supported.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("File exceeds the maximum size limit of 20MB.");
      return;
    }

    setUploading(true);
    try {
      await onUploadPaper(file);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload and index PDF.");
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCompareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comparePaper1 && comparePaper2 && comparePaper1 !== comparePaper2) {
      onComparePapers(comparePaper1, comparePaper2);
    }
  };

  const filteredPapers = papers.filter(p => 
    p.paper_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="dashboard_view" className="flex-1 bg-transparent text-slate-100 p-8 overflow-y-auto h-screen selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold font-sans tracking-tight text-white">Academic Workspace</h1>
          <p className="text-slate-400 text-sm mt-1">
            Upload papers to index them in your vector DB, query embeddings, and run deep RAG queries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection badge */}
          <div className={`px-4 py-2 rounded-full text-xs font-semibold border flex items-center gap-2 ${
            isSandbox 
              ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' 
              : apiConnected 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              isSandbox ? 'bg-violet-400' : apiConnected ? 'bg-emerald-400' : 'bg-amber-400'
            }`}></span>
            <span>{isSandbox ? 'Sandbox Mode' : apiConnected ? 'FastAPI Connected' : 'Connecting to API...'}</span>
          </div>

          <button
            id="refresh_stats_btn"
            onClick={onRefreshStats}
            disabled={loadingStats}
            className="p-2.5 bg-[#050b18]/60 backdrop-blur-md border border-slate-800/60 rounded-xl hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-slate-400"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-slate-700/60">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Database className="w-24 h-24 text-cyan-400" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Database Volume</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{loadingStats ? '...' : stats.total_papers}</span>
            <span className="text-xs text-slate-400 font-medium">indexed papers</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            Vector embeddings mapped in active ChromaDB storage bins.
          </p>
        </div>

        <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-slate-700/60">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <MessageSquare className="w-24 h-24 text-cyan-400" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Active Queries</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{loadingStats ? '...' : stats.total_questions}</span>
            <span className="text-xs text-slate-400 font-medium">questions answered</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            Total cognitive completions executed by the LLM pipelines.
          </p>
        </div>

        <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-slate-700/60">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24 text-cyan-400" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">User Registry</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{loadingStats ? '...' : stats.total_users}</span>
            <span className="text-xs text-slate-400 font-medium">active researchers</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
            Collaborative nodes connected to MongoDB auth clusters.
          </p>
        </div>
      </div>

      {/* Primary Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Upload box */}
        <div className="lg:col-span-7 bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <FileUp className="w-5 h-5 text-cyan-400" />
            <span>Upload and Index New Paper</span>
          </h2>

          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px] ${
              dragActive 
                ? 'border-cyan-500 bg-cyan-500/5 ring-1 ring-cyan-500/30' 
                : 'border-slate-800/80 hover:border-slate-700/60 bg-slate-900/10 hover:bg-slate-900/30'
            }`}
          >
            <input
              id="dashboard_file_input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Uploading & Embedding Document...</p>
                  <p className="text-xs text-slate-500">FastAPI is running OCR, loading PDF, and initializing ChromaDB vectors.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-950/80 border border-slate-800/60 rounded-xl flex items-center justify-center mb-4 text-slate-400 group-hover:text-white transition-colors">
                  <Upload className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Drag & drop your PDF file here, or click to browse</p>
                <p className="text-xs text-slate-500 mt-1.5 font-sans">Supports PDF formats up to 20MB</p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-4 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>

        {/* Quick Compare Panel */}
        <div className="lg:col-span-5 bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Columns className="w-5 h-5 text-cyan-400" />
              <span>Comparative Analytics</span>
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Compare architectural baselines, methodologies, novelties, and findings across two uploaded research papers side-by-side.
            </p>

            <form onSubmit={handleCompareSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Primary Research Paper (Target)
                </label>
                <select
                  id="compare_select_1"
                  value={comparePaper1}
                  onChange={(e) => setComparePaper1(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-500/50 outline-none"
                >
                  <option value="">Select paper 1...</option>
                  {papers.map(p => (
                    <option key={p.paper_name} value={p.paper_name}>{p.paper_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Comparison Baseline Paper (Reference)
                </label>
                <select
                  id="compare_select_2"
                  value={comparePaper2}
                  onChange={(e) => setComparePaper2(e.target.value)}
                  className="w-full bg-[#0f172a] border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-500/50 outline-none"
                >
                  <option value="">Select paper 2...</option>
                  {papers.map(p => (
                    <option key={p.paper_name} value={p.paper_name} disabled={p.paper_name === comparePaper1}>
                      {p.paper_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="dashboard_compare_submit_btn"
                type="submit"
                disabled={!comparePaper1 || !comparePaper2 || comparePaper1 === comparePaper2}
                className="w-full bg-[#0f172a] hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-800/80 hover:border-slate-700/60 disabled:opacity-50 text-xs font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>Compare Side-by-Side</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Indexed Papers Table */}
      <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Library Database ({papers.length})</span>
          </h2>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="library_search_input"
              type="text"
              placeholder="Search papers by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f172a] border border-slate-800/80 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredPapers.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-sm font-medium text-slate-400">No matching research papers found</p>
              <p className="text-xs text-slate-500 mt-1">Upload a PDF to begin indexing, or clear your query.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#020617]/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/60">
                <tr>
                  <th className="px-6 py-4">Paper Title</th>
                  <th className="px-6 py-4">Upload Date</th>
                  <th className="px-6 py-4">Total Chunks</th>
                  <th className="px-6 py-4">Pages</th>
                  <th className="px-6 py-4">File Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPapers.map((paper) => (
                  <tr key={paper.paper_name} className="hover:bg-slate-800/20 transition-all">
                    <td className="px-6 py-5 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-950/50 rounded-lg flex items-center justify-center shrink-0 border border-slate-800/40">
                          <FileText className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="truncate max-w-xs md:max-w-md block text-xs" title={paper.paper_name}>
                          {paper.paper_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        <span>{paper.upload_date || 'June 25, 2026'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono font-bold text-cyan-400">{paper.chunks || 0}</td>
                    <td className="px-6 py-5 text-slate-400">{paper.pages || '?'} pgs</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <HardDrive className="w-3.5 h-3.5 text-slate-600" />
                        <span>{paper.file_size || '1.5 MB'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectPaper(paper.paper_name)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(8,145,178,0.3)] transition-all cursor-pointer text-xs"
                        >
                          Analyze
                        </button>
                        <button
                          onClick={() => onDeletePaper(paper.paper_name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                          title="Delete Paper"
                        >
                          <Database className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
