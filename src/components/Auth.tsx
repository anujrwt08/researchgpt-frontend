/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../api';
import { User } from '../types';
import { Shield, Key, UserPlus, LogIn, Cpu, Globe } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  isSandbox: boolean;
  onToggleSandbox: (val: boolean) => void;
}

export default function Auth({ onAuthSuccess, isSandbox, onToggleSandbox }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (isLogin) {
        user = await api.login(email, password);
      } else {
        user = await api.register(name, email, password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxEnter = () => {
    onToggleSandbox(true);
    const demoUser: User = {
      name: 'Academic Explorer',
      email: 'explorer@researchgpt.ai'
    };
    api.setCurrentUser(demoUser);
    onAuthSuccess(demoUser);
  };

  return (
    <div id="auth_container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 overflow-hidden">
        
        {/* Banner border highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-violet-600"></div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
            <Cpu className="w-6 h-6 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white">ResearchGPT</h1>
          <p className="text-sm text-slate-400 mt-1 text-center">
            AI-powered academic analysis, search, and RAG dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-sm text-rose-400 flex items-start gap-2 animate-pulse">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="auth_name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Richard Feynman"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              id="auth_email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="feynman@caltech.edu"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="auth_password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
              />
            </div>
          </div>

          <button
            id="auth_submit_btn"
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 hover:opacity-90 active:opacity-100 disabled:opacity-50 font-semibold rounded-lg py-2.5 px-4 transition-all duration-200 shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4 text-slate-950" />
                <span>Sign In to Workspace</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-slate-950" />
                <span>Create Academic Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <button
            id="toggle_auth_btn"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-cyan-400 hover:text-cyan-300 text-center transition-colors cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-widest">Or try locally</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          <button
            id="sandbox_mode_btn"
            type="button"
            onClick={handleSandboxEnter}
            className="w-full border border-slate-800 bg-slate-950/50 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg py-2.5 px-4 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-violet-400" />
            <span>Launch Sandbox (Instant Demo)</span>
          </button>
        </div>
      </div>

      <div className="mt-8 text-center max-w-sm">
        <p className="text-xs text-slate-500 leading-relaxed">
          ResearchGPT connects to your custom Python FastAPI RAG backend to index documents, extract citations, query LLMs, and produce synthesized reports.
        </p>
      </div>
    </div>
  );
}
