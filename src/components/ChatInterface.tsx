/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { ChatMessage, PaperInsights, Citation, QuizQuestion, ResearchReport, KnowledgeGraph } from '../types';
import { 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  FileCheck, 
  HelpCircle, 
  Share2, 
  Send, 
  Brain, 
  Award,
  ChevronDown,
  BookMarked,
  LayoutTemplate,
  CheckCircle2,
  AlertCircle,
  Network
} from 'lucide-react';

interface ChatInterfaceProps {
  paperName: string;
}

type AnalysisTab = 'chat' | 'summary' | 'insights' | 'citations' | 'report' | 'quiz' | 'graph' | 'review';

export default function ChatInterface({ paperName }: ChatInterfaceProps) {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('chat');
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [questionInput, setQuestionInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Tab dynamic data states
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [insights, setInsights] = useState<PaperInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [citations, setCitations] = useState<Citation[]>([]);
  const [loadingCitations, setLoadingCitations] = useState(false);

  const [report, setReport] = useState<ResearchReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  const [review, setReview] = useState<any | null>(null);
  const [loadingReview, setLoadingReview] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on paperName
  const getSuggestions = () => {
    if (paperName.includes("Attention")) {
      return [
        "What is the role of Positional Encodings?",
        "Explain Multi-Head Attention mathematically",
        "Why is complexity O(N^2)?"
      ];
    } else if (paperName.includes("Retrieval")) {
      return [
        "Contrast RAG-Sequence and RAG-Token",
        "What is Dense Passage Retrieval?",
        "How does RAG eliminate hallucinations?"
      ];
    } else if (paperName.includes("Llama")) {
      return [
        "What are the pretraining stats?",
        "Explain Grouped-Query Attention (GQA)",
        "How does Direct Preference Optimization work?"
      ];
    }
    return [
      "What is the main contribution of this research?",
      "Briefly describe the research methodology.",
      "What datasets were used to train/validate the models?"
    ];
  };

  // Load chat history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingChats(true);
      try {
        const history = await api.getChatHistory(paperName);
        setChats(history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChats(false);
      }
    };
    fetchHistory();
  }, [paperName]);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeTab]);

  // Lazy loading tab contents
  useEffect(() => {
    if (activeTab === 'summary' && !summary) {
      loadSummary();
    } else if (activeTab === 'insights' && !insights) {
      loadInsights();
    } else if (activeTab === 'citations' && citations.length === 0) {
      loadCitations();
    } else if (activeTab === 'report' && !report) {
      loadReport();
    } else if (activeTab === 'quiz' && quiz.length === 0) {
      loadQuiz();
    } else if (activeTab === 'graph' && !graph) {
      loadGraph();
    } else if (activeTab === 'review' && !review) {
      loadReview();
    }
  }, [activeTab, paperName]);

  const loadSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await api.getSummary(paperName);
      setSummary(res);
    } catch (e) {
      setSummary('Failed to load summary. Is your backend running?');
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await api.getInsights(paperName);
      setInsights(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

  const loadCitations = async () => {
    setLoadingCitations(true);
    try {
      const res = await api.getCitations(paperName);
      setCitations(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCitations(false);
    }
  };

  const loadReport = async () => {
    setLoadingReport(true);
    try {
      const res = await api.getReport(paperName);
      setReport(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  const loadQuiz = async () => {
    setLoadingQuiz(true);
    try {
      const res = await api.getQuiz(paperName);
      setQuiz(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const loadGraph = async () => {
    setLoadingGraph(true);
    try {
      const res = await api.getKnowledgeGraph(paperName);
      setGraph(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGraph(false);
    }
  };

  const loadReview = async () => {
    setLoadingReview(true);
    try {
      const res = await api.getReview(paperName);
      setReview(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleSendChat = async (questionText: string) => {
    if (!questionText.trim()) return;
    setSendingChat(true);
    setQuestionInput('');

    // Pre-inject client chat
    const tempChat: ChatMessage = {
      paper: paperName,
      question: questionText,
      answer: '',
      created_at: new Date().toISOString()
    };
    setChats(prev => [...prev, tempChat]);

    try {
      const answered = await api.askQuestion(paperName, questionText);
      setChats(prev => {
        const filtered = prev.filter(c => c.question !== questionText);
        return [...filtered, answered];
      });
    } catch (err: any) {
      setChats(prev => {
        const filtered = prev.filter(c => c.question !== questionText);
        return [
          ...filtered,
          {
            paper: paperName,
            question: questionText,
            answer: `❌ Error: ${err.message || 'FastAPI failed to respond.'}`,
            created_at: new Date().toISOString()
          }
        ];
      });
    } finally {
      setSendingChat(false);
    }
  };

  // Quiz helper handlers
  const handleSelectQuizOption = (quizId: string, optionIndex: number) => {
    if (quizSubmitted[quizId]) return;
    setQuizAnswers(prev => ({ ...prev, [quizId]: optionIndex }));
  };

  const handleSubmitQuizAnswer = (quizId: string) => {
    if (quizAnswers[quizId] === undefined) return;
    setQuizSubmitted(prev => ({ ...prev, [quizId]: true }));
  };

  return (
    <div id="chat_workspace" className="flex-grow flex flex-col bg-transparent h-screen select-text selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Workspace Topbar */}
      <div className="px-6 py-4 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-none truncate max-w-md">{paperName}</h2>
            <span className="text-[10px] text-slate-500 font-mono mt-1.5 block leading-none">RAG Semantic Search Window Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>Target database: ChromaDB vector matrix</span>
        </div>
      </div>

      {/* Workspace Tab Bar */}
      <div className="px-6 bg-[#050b18]/40 backdrop-blur-md border-b border-slate-800/60 flex gap-2 overflow-x-auto scrollbar-none py-1">
        {[
          { id: 'chat', label: 'Q&A Chatbot', icon: MessageSquare },
          { id: 'summary', label: 'Summarizer', icon: BookOpen },
          { id: 'insights', label: 'Deep Insights', icon: TrendingUp },
          { id: 'citations', label: 'Citations', icon: BookMarked },
          { id: 'report', label: 'Research Report', icon: LayoutTemplate },
          { id: 'graph', label: 'Knowledge Graph', icon: Network },
          { id: 'quiz', label: 'Comprehension Quiz', icon: HelpCircle },
          { id: 'review', label: 'Peer Review Metrics', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              id={`tab_select_${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AnalysisTab)}
              className={`flex items-center gap-2 px-3 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isSelected 
                  ? 'border-cyan-500 text-cyan-400 font-bold' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Content Panel */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* Chat Tab Panel */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col justify-between">
            <div className="flex-1 space-y-6 overflow-y-auto mb-4 pr-1">
              
              {chats.length === 0 && !loadingChats ? (
                <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
                  <Brain className="w-12 h-12 text-slate-800 mx-auto animate-pulse" />
                  <h3 className="text-base font-bold text-slate-300">Start Your Cognitive Query</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Ask precise analytical questions about model layers, computational scaling, hyperparameter formulas, or limitations.
                  </p>
                  
                  {/* Suggested questions */}
                  <div className="pt-4 grid grid-cols-1 gap-2.5 max-w-lg mx-auto">
                    {getSuggestions().map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendChat(suggestion)}
                        className="text-xs text-left bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 hover:border-cyan-500/40 text-slate-400 hover:text-white p-3 rounded-xl transition-all cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto space-y-6">
                  {chats.map((chat, idx) => (
                    <div key={idx} className="space-y-4">
                      {/* User message */}
                      <div className="flex items-start gap-3 justify-end">
                        <div className="max-w-lg bg-cyan-950/20 border border-cyan-800/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-cyan-200 shadow-md">
                          {chat.question}
                        </div>
                      </div>

                      {/* Assistant message */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                          <Brain className="w-4 h-4 text-white" />
                        </div>
                        <div className="max-w-xl bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300 space-y-2 leading-relaxed shadow-xl">
                          {chat.answer === '' ? (
                            <div className="flex items-center gap-2 text-slate-500">
                              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
                              <span className="text-xs font-medium font-mono">Retrieving context & reasoning...</span>
                            </div>
                          ) : (
                            <div className="whitespace-pre-line">{chat.answer}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="max-w-3xl mx-auto w-full border border-slate-800/60 bg-[#050b18]/60 backdrop-blur-md rounded-2xl p-2.5 flex items-center gap-2.5 shadow-2xl">
              <input
                id="chat_question_input"
                type="text"
                value={questionInput}
                onChange={(e) => setQuestionInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat(questionInput)}
                placeholder="Query document embeddings..."
                className="flex-1 bg-transparent border-none text-sm text-white px-3 outline-none"
                disabled={sendingChat}
              />
              <button
                id="send_chat_btn"
                onClick={() => handleSendChat(questionInput)}
                disabled={sendingChat || !questionInput.trim()}
                className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* Summary Tab Panel */}
        {activeTab === 'summary' && (
          <div className="max-w-2xl mx-auto bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 shadow-xl">
            {loadingSummary ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-mono">Summarizing paper structure...</span>
              </div>
            ) : (
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            )}
          </div>
        )}

        {/* Insights Tab Panel */}
        {activeTab === 'insights' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {loadingInsights ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-mono">Extracting novelty scores & findings...</span>
              </div>
            ) : insights ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="md:col-span-2 space-y-6">
                  {/* Contributions Box */}
                  <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span>Primary Academic Contributions</span>
                    </h3>
                    <ul className="space-y-3.5 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                      {insights.main_contributions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Findings Box */}
                  <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span>Core Scientific Findings</span>
                    </h3>
                    <ul className="space-y-3.5 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                      {insights.key_findings.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Novelty Metric */}
                  <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 text-center shadow-xl">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Novelty Index</span>
                    <div className="relative flex items-center justify-center py-6">
                      <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center">
                        <span className="text-3xl font-extrabold text-cyan-400">{insights.novelty_score}%</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Graded benchmark originality calculated against active semantic database indices.
                    </p>
                  </div>

                  {/* Limitations Box */}
                  <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">Limitations & Risks</h3>
                    <ul className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
                      {insights.limitations.map((l, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <span className="text-rose-500">•</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        )}

        {/* Citations Tab Panel */}
        {activeTab === 'citations' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {loadingCitations ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-mono">Parsing reference blocks...</span>
              </div>
            ) : citations.length === 0 ? (
              <div className="p-8 text-center bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-xl">
                <p className="text-sm text-slate-400">No citations extracted</p>
              </div>
            ) : (
              citations.map((cite, i) => (
                <div key={i} className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-3">
                    <h4 className="text-xs font-bold text-cyan-400">{cite.citation}</h4>
                    <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                      Conf: {(cite.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">{cite.authors} ({cite.year})</p>
                  <p className="text-xs text-slate-300 mt-2 italic leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-800/40">
                    "{cite.context}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Report Tab Panel */}
        {activeTab === 'report' && (
          <div className="max-w-3xl mx-auto bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 shadow-xl">
            {loadingReport ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-mono">Generating peer-grade critique...</span>
              </div>
            ) : report ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Executive Overview</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{report.executive_summary}</p>
                </div>

                <div className="border-t border-slate-800/60 pt-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Technical Mechanics</h3>
                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{report.technical_contributions}</div>
                </div>

                <div className="border-t border-slate-800/60 pt-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Methodological Critique</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{report.methodology_critique}</p>
                </div>

                <div className="border-t border-slate-800/60 pt-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Suggested Extrapolations & Next Steps</h3>
                  <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
                    {report.suggested_extensions.map((ext, idx) => (
                      <li key={idx}>{ext}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Knowledge Graph Tab Panel */}
        {activeTab === 'graph' && (
          <div className="max-w-3xl mx-auto bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Semantic Concept Mindmap</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Visualizes connections between authors, datasets, metrics, and technical contributions discovered in PDF clusters.
            </p>

            {loadingGraph ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-mono">Parsing semantic entities...</span>
              </div>
            ) : graph ? (
              <div className="space-y-6">
                {/* Node Grid representation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {graph.nodes.map((node) => {
                    const colorMap = {
                      concept: 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400',
                      method: 'border-violet-500/30 bg-violet-500/5 text-violet-400',
                      dataset: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
                      metric: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
                      author: 'border-pink-500/30 bg-pink-500/5 text-pink-400'
                    };
                    return (
                      <div key={node.id} className={`p-3 rounded-xl border text-center relative ${colorMap[node.type] || 'border-slate-800 bg-slate-950'}`}>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-1">{node.type}</span>
                        <span className="text-xs font-semibold">{node.label}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-800/60 pt-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Semantic Relationship Map</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-none">
                    {graph.links.map((link, idx) => {
                      const sourceLabel = graph.nodes.find(n => n.id === link.source)?.label || link.source;
                      const targetLabel = graph.nodes.find(n => n.id === link.target)?.label || link.target;
                      return (
                        <div key={idx} className="flex items-center gap-3 text-xs text-slate-300 font-sans leading-relaxed bg-slate-950/40 p-2 rounded border border-slate-800/40">
                          <span className="font-semibold text-cyan-400">{sourceLabel}</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{link.label}</span>
                          <span className="font-semibold text-violet-400">{targetLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Quiz Tab Panel */}
        {activeTab === 'quiz' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {loadingQuiz ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-mono">Generating testing models...</span>
              </div>
            ) : quiz.length === 0 ? (
              <div className="p-8 text-center bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl shadow-xl">
                <p className="text-sm text-slate-400">No comprehension quiz generated.</p>
              </div>
            ) : (
              quiz.map((q, idx) => {
                const isSelected = quizAnswers[q.id] !== undefined;
                const isSubmitted = quizSubmitted[q.id];
                const selectedOption = quizAnswers[q.id];
                return (
                  <div key={q.id} className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 shadow-xl space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-800/60 pb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Question {idx + 1}</span>
                      {isSubmitted && (
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          selectedOption === q.correctAnswer 
                            ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' 
                            : 'border-rose-500/30 bg-rose-500/5 text-rose-400'
                        }`}>
                          {selectedOption === q.correctAnswer ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h4>

                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isOptSelected = selectedOption === oIdx;
                        let optStyle = 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700';
                        
                        if (isOptSelected) {
                          optStyle = 'border-cyan-500 bg-cyan-500/5 text-cyan-400';
                        }
                        
                        if (isSubmitted) {
                          if (oIdx === q.correctAnswer) {
                            optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                          } else if (isOptSelected) {
                            optStyle = 'border-rose-500 bg-rose-500/10 text-rose-400';
                          } else {
                            optStyle = 'border-slate-800 bg-slate-950/10 text-slate-500';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectQuizOption(q.id, oIdx)}
                            disabled={isSubmitted}
                            className={`w-full text-left text-xs p-3.5 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-2 ${optStyle}`}
                          >
                            <span>{opt}</span>
                            {isSubmitted && oIdx === q.correctAnswer && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {isSubmitted && isOptSelected && oIdx !== q.correctAnswer && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {!isSubmitted && (
                      <button
                        onClick={() => handleSubmitQuizAnswer(q.id)}
                        disabled={!isSelected}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 disabled:opacity-50 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        Submit Answer
                      </button>
                    )}

                    {isSubmitted && (
                      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                        <span className="font-mono font-bold text-slate-500 uppercase tracking-widest block mb-1">Explanation</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Peer Review Panel */}
        {activeTab === 'review' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {loadingReview ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-slate-500 font-mono">Running review metrics...</span>
              </div>
            ) : review ? (
              <div className="bg-[#050b18]/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Academic Review Evaluation</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Blind Peer-Grade scorecard</p>
                  </div>
                  <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono px-4 py-2 rounded-xl text-xl font-bold">
                    {review.rating}
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Concept Originality</h4>
                    <p className="bg-slate-950/40 p-3 rounded border border-slate-800/40">{review.originality}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Technical Correctness</h4>
                    <p className="bg-slate-950/40 p-3 rounded border border-slate-800/40">{review.technical_correctness}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Clarity & Presentation</h4>
                    <p className="bg-slate-950/40 p-3 rounded border border-slate-800/40">{review.clarity}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
