/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Paper, PaperComparison } from '../types';
import { 
  Columns, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Scale, 
  Layers, 
  Bookmark, 
  Grid
} from 'lucide-react';

interface CompareWorkspaceProps {
  papers: Paper[];
  initialPaper1?: string;
  initialPaper2?: string;
}

export default function CompareWorkspace({ papers, initialPaper1 = '', initialPaper2 = '' }: CompareWorkspaceProps) {
  const [paper1, setPaper1] = useState(initialPaper1);
  const [paper2, setPaper2] = useState(initialPaper2);
  const [comparison, setComparison] = useState<PaperComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPaper1) setPaper1(initialPaper1);
    if (initialPaper2) setPaper2(initialPaper2);
  }, [initialPaper1, initialPaper2]);

  const runComparison = async () => {
    if (!paper1 || !paper2 || paper1 === paper2) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.comparePapers(paper1, paper2);
      setComparison(result);
    } catch (err: any) {
      setError(err.message || 'Comparison failed. Check your API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paper1 && paper2 && paper1 !== paper2) {
      runComparison();
    } else {
      setComparison(null);
    }
  }, [paper1, paper2]);

  return (
    <div id="compare_workspace" className="flex-grow flex flex-col bg-transparent text-slate-100 p-8 overflow-y-auto h-screen selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-cyan-400" />
          <span>Cross-Paper Comparative Analysis</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1.5">
          Select two indexed research papers from your library to synthesize architectural contrasts, overlaps, and recommendations.
        </p>
      </div>

      {/* Selectors Bar */}
      <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Research Paper 1
          </label>
          <select
            id="workspace_compare_select_1"
            value={paper1}
            onChange={(e) => setPaper1(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-500/50 outline-none"
          >
            <option value="">Select paper 1...</option>
            {papers.map(p => (
              <option key={p.paper_name} value={p.paper_name}>{p.paper_name}</option>
            ))}
          </select>
        </div>

        <div className="shrink-0 text-slate-600 mt-4 sm:mt-0 font-mono text-xs">
          VS
        </div>

        <div className="flex-1 w-full">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Research Paper 2
          </label>
          <select
            id="workspace_compare_select_2"
            value={paper2}
            onChange={(e) => setPaper2(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:border-cyan-500/50 outline-none"
          >
            <option value="">Select paper 2...</option>
            {papers.map(p => (
              <option key={p.paper_name} value={p.paper_name} disabled={p.paper_name === paper1}>
                {p.paper_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Render comparison output */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4 bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-xl">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-white">Synthesizing Comparative Analysis...</h3>
            <p className="text-xs text-slate-500 mt-1">Cross-referencing vector spaces in ChromaDB.</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-4 rounded-xl flex items-start gap-2">
          <HelpCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      ) : comparison ? (
        <div className="space-y-8 animate-fade-in">
          
          {/* Top Overviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Similarity Badge */}
            <div className="md:col-span-4 bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 text-center flex flex-col justify-center items-center shadow-xl">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-4">Semantic Overlap</span>
              <div className="relative flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-4 border-slate-800/60 flex items-center justify-center bg-slate-950/40">
                  <span className="text-3xl font-extrabold text-cyan-400">{comparison.similarity}%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-4">
                Percentage score calculated via cosine distance matrices in local embedding models.
              </p>
            </div>

            {/* Overlapping Topics */}
            <div className="md:col-span-8 bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Shared Conceptual Fields</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Both documents exhibit high density overlap in the following areas:
              </p>
              <div className="flex flex-wrap gap-2.5">
                {comparison.overlap_topics.map((topic, i) => (
                  <span key={i} className="text-xs bg-slate-950/60 border border-slate-800/40 text-slate-300 px-3.5 py-1.5 rounded-full font-semibold">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contrast Table Grid */}
          <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800/60 flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Methodological Contrast</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#020617]/80 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800/60">
                    <th className="px-6 py-4 w-1/4">Feature Indicator</th>
                    <th className="px-6 py-4 w-3/8 text-cyan-400 truncate max-w-xs">{comparison.paper1}</th>
                    <th className="px-6 py-4 w-3/8 text-violet-400 truncate max-w-xs">{comparison.paper2}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-transparent">
                  {comparison.contrasting_aspects.map((aspect, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-200 bg-slate-950/20">{aspect.feature}</td>
                      <td className="px-6 py-5 text-slate-300 leading-relaxed font-sans">{aspect.paper1_approach}</td>
                      <td className="px-6 py-5 text-slate-300 leading-relaxed font-sans">{aspect.paper2_approach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="w-24 h-24 text-cyan-400" />
            </div>
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Comparative Verdict & Recommendation</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {comparison.recommendation}
            </p>
          </div>

        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center py-24 gap-4 bg-[#050b18]/10 border border-dashed border-slate-800/60 rounded-2xl shadow-inner">
          <Scale className="w-10 h-10 text-slate-700" />
          <div className="text-center max-w-xs">
            <h3 className="text-sm font-semibold text-slate-400">Awaiting Select Selection</h3>
            <p className="text-xs text-slate-500 mt-1">Select two papers from the drop-downs above to begin structural cross-referencing.</p>
          </div>
        </div>
      )}

    </div>
  );
}
