/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  email: string;
  name: string;
  token?: string;
}

export interface Paper {
  paper_name: string;
  uploaded_by?: string;
  chunks?: number;
  vector_path?: string;
  upload_date?: string;
  file_size?: string;
  pages?: number;
}

export interface ChatMessage {
  id?: string;
  paper: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_papers: number;
  total_questions: number;
}

export interface PaperInsights {
  main_contributions: string[];
  methodology: string;
  limitations: string[];
  novelty_score: number; // 1-100
  key_findings: string[];
}

export interface PaperComparison {
  paper1: string;
  paper2: string;
  similarity: number; // percentage
  overlap_topics: string[];
  contrasting_aspects: {
    feature: string;
    paper1_approach: string;
    paper2_approach: string;
  }[];
  recommendation: string;
}

export interface Citation {
  citation: string;
  authors: string;
  year: number;
  context: string;
  confidence: number; // 0-1
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // index
  explanation: string;
}

export interface ResearchReport {
  executive_summary: string;
  technical_contributions: string;
  methodology_critique: string;
  suggested_extensions: string[];
  conclusion: string;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  type: 'concept' | 'method' | 'dataset' | 'metric' | 'author';
}

export interface KnowledgeLink {
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  links: KnowledgeLink[];
}
