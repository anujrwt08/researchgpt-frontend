/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  Paper, 
  ChatMessage, 
  DashboardStats, 
  PaperInsights, 
  PaperComparison, 
  Citation, 
  QuizQuestion, 
  ResearchReport, 
  KnowledgeGraph 
} from './types';

import { 
  MOCK_PAPERS, 
  MOCK_INSIGHTS, 
  MOCK_CHAT_HISTORY, 
  MOCK_CITATIONS, 
  MOCK_REPORTS, 
  MOCK_QUIZZES, 
  MOCK_GRAPHS, 
  MOCK_DASHBOARD_STATS,
  GENERAL_MOCK_INSIGHTS,
  GENERAL_MOCK_QUIZ,
  GENERAL_MOCK_GRAPH
} from './mockData';

// Class to manage connection settings and API calls
class ResearchGPTClient {
  private base_url: string = 'http://localhost:8000';
  private sandbox_mode: boolean = true;
  private current_user: User | null = null;

  constructor() {
    const savedUrl = localStorage.getItem('researchgpt_api_url');
    if (savedUrl) {
      this.base_url = savedUrl;
    }
    const savedMode = localStorage.getItem('researchgpt_sandbox');
    if (savedMode !== null) {
      this.sandbox_mode = savedMode === 'true';
    }
    const savedUser = localStorage.getItem('researchgpt_user');
    if (savedUser) {
      try {
        this.current_user = JSON.parse(savedUser);
      } catch (e) {
        this.current_user = null;
      }
    }

    // Initialize Mock database in localStorage if empty
    if (!localStorage.getItem('sandbox_papers')) {
      localStorage.setItem('sandbox_papers', JSON.stringify(MOCK_PAPERS));
    }
    if (!localStorage.getItem('sandbox_chats')) {
      const allChats: ChatMessage[] = [];
      Object.values(MOCK_CHAT_HISTORY).forEach(chats => {
        allChats.push(...chats);
      });
      localStorage.setItem('sandbox_chats', JSON.stringify(allChats));
    }
  }

  // Getters & Setters
  getApiUrl(): string {
    return this.base_url;
  }

  setApiUrl(url: string) {
    this.base_url = url;
    localStorage.setItem('researchgpt_api_url', url);
  }

  isSandbox(): boolean {
    return this.sandbox_mode;
  }

  setSandbox(val: boolean) {
    this.sandbox_mode = val;
    localStorage.setItem('researchgpt_sandbox', String(val));
  }

  getCurrentUser(): User | null {
    return this.current_user;
  }

  setCurrentUser(user: User | null) {
    this.current_user = user;
    if (user) {
      localStorage.setItem('researchgpt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('researchgpt_user');
    }
  }

  // Helper for requests
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (this.current_user?.token) {
      headers.set('Authorization', `Bearer ${this.current_user.token}`);
    }

    const response = await fetch(`${this.base_url}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = 'API Request Failed';
      try {
        const parsed = JSON.parse(errText);
        errMsg = parsed.detail || parsed.message || errMsg;
      } catch (e) {
        errMsg = errText || errMsg;
      }
      throw new Error(errMsg);
    }

    return response.json() as Promise<T>;
  }

  // Auth Operations
  async register(name: string, email: string, password: string): Promise<User> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const user: User = { name, email, token: 'mock-sandbox-jwt-token' };
      this.setCurrentUser(user);
      return user;
    }

    const res = await this.request<any>('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    // Some backends might return user, some might return token directly
    const user: User = {
      name: res.name || name,
      email: res.email || email,
      token: res.access_token || res.token || 'mock-jwt-token'
    };
    this.setCurrentUser(user);
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const name = email.split('@')[0];
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      const user: User = { name: formattedName, email, token: 'mock-sandbox-jwt-token' };
      this.setCurrentUser(user);
      return user;
    }

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const res = await this.request<any>('/login', {
      method: 'POST',
      body: formData // Form data submission for OAuth2 compatibility
    });

    const user: User = {
      name: res.name || email.split('@')[0],
      email: email,
      token: res.access_token || res.token
    };
    this.setCurrentUser(user);
    return user;
  }

  logout() {
    this.setCurrentUser(null);
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    if (this.sandbox_mode) {
      const papers = this.getSandboxPapers();
      const chats = this.getSandboxChats();
      return {
        total_users: MOCK_DASHBOARD_STATS.total_users,
        total_papers: papers.length,
        total_questions: chats.length
      };
    }
    return this.request<DashboardStats>('/dashboard');
  }

  // Papers Operations
  async listPapers(): Promise<Paper[]> {
    if (this.sandbox_mode) {
      return this.getSandboxPapers();
    }
    const res = await this.request<{ papers: Paper[] }>('/papers');
    return res.papers;
  }

  async uploadPaper(file: File): Promise<Paper> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const paperName = file.name.replace('.pdf', '');
      const paperSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      const newPaper: Paper = {
        paper_name: paperName,
        uploaded_by: this.current_user?.email || 'demo@researchgpt.ai',
        chunks: Math.floor(Math.random() * 50) + 20,
        vector_path: `chroma_db/${paperName.replace(/\s+/g, '_')}`,
        upload_date: new Date().toISOString().split('T')[0],
        file_size: paperSize,
        pages: Math.floor(Math.random() * 15) + 5
      };

      const papers = this.getSandboxPapers();
      if (!papers.some(p => p.paper_name === paperName)) {
        papers.unshift(newPaper);
        localStorage.setItem('sandbox_papers', JSON.stringify(papers));
      }

      return newPaper;
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await this.request<any>('/upload', {
      method: 'POST',
      body: formData
    });

    return {
      paper_name: res.paper_name || res.filename.replace('.pdf', ''),
      uploaded_by: this.current_user?.email || 'user',
      upload_date: new Date().toISOString().split('T')[0]
    };
  }

  async indexPaper(paperName: string): Promise<any> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return { message: 'Vector DB Created', paper: paperName };
    }
    return this.request<any>(`/index?paper=${encodeURIComponent(paperName)}`);
  }

  async deletePaper(paperName: string): Promise<any> {
    if (this.sandbox_mode) {
      const papers = this.getSandboxPapers().filter(p => p.paper_name !== paperName);
      localStorage.setItem('sandbox_papers', JSON.stringify(papers));
      
      const chats = this.getSandboxChats().filter(c => c.paper !== paperName);
      localStorage.setItem('sandbox_chats', JSON.stringify(chats));

      return { message: 'Deleted Successfully', paper: paperName };
    }
    return this.request<any>(`/paper/${encodeURIComponent(paperName)}`, {
      method: 'DELETE'
    });
  }

  // Chat Operations
  async getChatHistory(paperName?: string): Promise<ChatMessage[]> {
    if (this.sandbox_mode) {
      const chats = this.getSandboxChats();
      if (paperName) {
        return chats.filter(c => c.paper === paperName);
      }
      return chats;
    }

    if (paperName) {
      const res = await this.request<{ history: ChatMessage[] }>(`/history/${encodeURIComponent(paperName)}`);
      return res.history;
    } else {
      const res = await this.request<{ history: ChatMessage[] }>('/history');
      return res.history;
    }
  }

  async askQuestion(paperName: string, question: string): Promise<ChatMessage> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let answer = '';
      const qLower = question.toLowerCase();

      // Look for custom templates or generate smart answering
      if (qLower.includes('multi-head') || qLower.includes('multi head')) {
        answer = "Multi-head attention projects queries, keys, and values linearly h times with different dimension weights. It allows the model to process relationships in multiple representation subspaces simultaneously, avoiding single-focus pitfalls.";
      } else if (qLower.includes('complexity') || qLower.includes('computational')) {
        answer = "The self-attention layer has a computational complexity of O(N^2 * d) where N is the sequence length and d is the embedding dimension. It scales quadratically, which makes context extensions computationally expensive.";
      } else if (qLower.includes('rag') || qLower.includes('retrieval')) {
        answer = "Retrieval-Augmented Generation bridges dense vector indexing with generator LLMs. By retrieving specific passage contexts before calling the generator, RAG dramatically reduces hallucinations and opens up real-time enterprise search layers.";
      } else if (qLower.includes('llama')) {
        answer = "Llama 3 is trained on 15 trillion tokens of data. Optimizations include Grouped-Query Attention (GQA), Rotational Positional Embeddings (RoPE), and a 128k sequence vocabulary, scaling performance capabilities dramatically.";
      } else {
        // Dynamic semantic answer
        answer = `Based on the academic document "${paperName}", we analyzed the query "${question}". The research indicates that the proposed approach leverages targeted attention vectors to increase precision. Compared to prior baseline evaluations, this methodology reduces error rates by approximately 14% and optimizes compute utilization in large cluster nodes.`;
      }

      const newChat: ChatMessage = {
        paper: paperName,
        question: question,
        answer: answer,
        created_at: new Date().toISOString()
      };

      const chats = this.getSandboxChats();
      chats.push(newChat);
      localStorage.setItem('sandbox_chats', JSON.stringify(chats));

      return newChat;
    }

    return this.request<ChatMessage>(`/ask?paper=${encodeURIComponent(paperName)}&question=${encodeURIComponent(question)}`);
  }

  // Academic Action Operations
  async getSummary(paperName: string): Promise<string> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const insights = MOCK_INSIGHTS[paperName] || GENERAL_MOCK_INSIGHTS(paperName);
      return `**Executive Summary**\n\nThis paper, *"${paperName}"*, presents key breakthroughs. In terms of contributions, the authors establish:\n\n${insights.main_contributions.map(c => `- ${c}`).join('\n')}\n\n**Methodology Framework**\n\n${insights.methodology}`;
    }
    const res = await this.request<{ summary: string }>(`/summarize?paper=${encodeURIComponent(paperName)}`);
    return res.summary;
  }

  async getInsights(paperName: string): Promise<PaperInsights> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 900));
      return MOCK_INSIGHTS[paperName] || GENERAL_MOCK_INSIGHTS(paperName);
    }
    const res = await this.request<{ insights: PaperInsights }>(`/insights?paper=${encodeURIComponent(paperName)}`);
    return res.insights;
  }

  async getCitations(paperName: string): Promise<Citation[]> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_CITATIONS[paperName] || [
        {
          citation: "Smith & Doe, 2023",
          authors: "John Smith, Jane Doe",
          year: 2023,
          context: `Explored basic neural foundations supporting the baseline results of ${paperName}.`,
          confidence: 0.85
        },
        {
          citation: "Alpha Researchers, 2025",
          authors: "A. Zhang, B. Miller, C. Jenkins",
          year: 2025,
          context: "Conducted high-volume ablation studies confirming context limitations in multi-modal layers.",
          confidence: 0.91
        }
      ];
    }
    const res = await this.request<{ citations: Citation[] }>(`/citations?paper=${encodeURIComponent(paperName)}`);
    return res.citations;
  }

  async getReport(paperName: string): Promise<ResearchReport> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 1100));
      return MOCK_REPORTS[paperName] || {
        executive_summary: `Comprehensive evaluation of the research principles introduced in ${paperName}.`,
        technical_contributions: "1. Defined highly robust training checkpoints.\n2. Addressed major bias limits in validation datasets.",
        methodology_critique: "The study exhibits superb reproducibility but lacks multi-modal testing grids.",
        suggested_extensions: ["Implementing sparse transformer kernels.", "Evaluating across cross-lingual corpus segments."],
        conclusion: "A highly authoritative study that advances current technical domains."
      };
    }
    const res = await this.request<{ report: ResearchReport }>(`/report?paper=${encodeURIComponent(paperName)}`);
    return res.report;
  }

  async comparePapers(paper1: string, paper2: string): Promise<PaperComparison> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 1400));
      return {
        paper1,
        paper2,
        similarity: Math.floor(Math.random() * 30) + 45,
        overlap_topics: ["Neural Deep Layers", "High-Volume Optimization", "Context Sequence Lengths"],
        contrasting_aspects: [
          {
            feature: "Sequence Handling",
            paper1_approach: paper1.includes("Attention") ? "Parallel Multi-head Attention matrix" : "Retrieval context routing",
            paper2_approach: paper2.includes("Llama") ? "Decoder GQA autoregression" : "Non-parametric dense retrievers"
          },
          {
            feature: "Compute Efficiency",
            paper1_approach: "Quadratic N^2 attention maps",
            paper2_approach: "KV-cache optimized clusters"
          }
        ],
        recommendation: `For high-performance local instruction-tuning, use elements from ${paper2}. For core mathematical modeling foundations, implement structures from ${paper1}.`
      };
    }
    const res = await this.request<{ comparison: PaperComparison }>(`/compare?paper1=${encodeURIComponent(paper1)}&paper2=${encodeURIComponent(paper2)}`);
    return res.comparison;
  }

  async getQuiz(paperName: string): Promise<QuizQuestion[]> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 900));
      return MOCK_QUIZZES[paperName] || GENERAL_MOCK_QUIZ(paperName);
    }
    const res = await this.request<{ quiz: QuizQuestion[] }>(`/quiz?paper=${encodeURIComponent(paperName)}`);
    return res.quiz;
  }

  async getKnowledgeGraph(paperName: string): Promise<KnowledgeGraph> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_GRAPHS[paperName] || GENERAL_MOCK_GRAPH(paperName);
    }
    return this.request<KnowledgeGraph>(`/knowledge-graph?paper=${encodeURIComponent(paperName)}`);
  }

  async getRecommendations(paperName: string): Promise<any[]> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 700));
      return [
        {
          title: "Generative Query Networks for Dense Text Search",
          authors: "K. Chen, L. Davis",
          year: 2025,
          journal: "Scribe NLP Journal",
          similarity_score: 87
        },
        {
          title: "Context Window Optimizations in Self-Attention Nodes",
          authors: "S. Patel et al.",
          year: 2026,
          journal: "ML Systems Annual Review",
          similarity_score: 82
        }
      ];
    }
    const res = await this.request<{ recommendations: any[] }>(`/related-papers?paper=${encodeURIComponent(paperName)}`);
    return res.recommendations;
  }

  async getReview(paperName: string): Promise<any> {
    if (this.sandbox_mode) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        rating: "8/10",
        originality: "Strong contribution with novel conceptual architectures.",
        technical_correctness: "Mathematically sound, backed by ablation studies.",
        clarity: "Excellent writeup, clear graphs, detailed pseudocode appendix."
      };
    }
    return this.request<any>(`/review?paper=${encodeURIComponent(paperName)}`);
  }

  // Sandbox Local Storage Helpers
  private getSandboxPapers(): Paper[] {
    const raw = localStorage.getItem('sandbox_papers');
    return raw ? JSON.parse(raw) : MOCK_PAPERS;
  }

  private getSandboxChats(): ChatMessage[] {
    const raw = localStorage.getItem('sandbox_chats');
    return raw ? JSON.parse(raw) : [];
  }
}

export const api = new ResearchGPTClient();
