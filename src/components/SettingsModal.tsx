/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../api';
import { X, Globe, Sliders, ShieldCheck, Cpu } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onSettingsSaved: () => void;
}

export default function SettingsModal({ onClose, onSettingsSaved }: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useState(api.getApiUrl());
  const [sandboxMode, setSandboxMode] = useState(api.isSandbox());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [testError, setTestError] = useState('');

  const handleSave = () => {
    api.setApiUrl(apiUrl);
    api.setSandbox(sandboxMode);
    onSettingsSaved();
    onClose();
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus('idle');
    setTestError('');
    try {
      const response = await fetch(`${apiUrl}/`);
      if (response.ok) {
        const data = await response.json();
        if (data.message && data.message.includes('ResearchGPT')) {
          setConnectionStatus('success');
        } else {
          setConnectionStatus('success'); // General FastAPI ok
        }
      } else {
        throw new Error(`Server returned status: ${response.status}`);
      }
    } catch (err: any) {
      setConnectionStatus('failed');
      setTestError(err.message || 'Could not connect to backend server. Make sure FastAPI is running on host & port.');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Banner border highlight */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-violet-600"></div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span>Connection Configuration</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Mode toggle */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Workspace Core Engine Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSandboxMode(true)}
                className={`py-3 px-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer h-24 ${
                  sandboxMode 
                    ? 'border-cyan-500 bg-cyan-500/5 text-cyan-400' 
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Globe className="w-4.5 h-4.5 text-cyan-400 shrink-0" />
                <div>
                  <span className="block text-xs font-bold leading-none text-white">Sandbox Mode</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Local visual demo</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSandboxMode(false)}
                className={`py-3 px-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer h-24 ${
                  !sandboxMode 
                    ? 'border-violet-500 bg-violet-500/5 text-violet-400' 
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-4.5 h-4.5 text-violet-400 shrink-0" />
                <div>
                  <span className="block text-xs font-bold leading-none text-white">Live Backend</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">Connect to FastAPI</span>
                </div>
              </button>
            </div>
          </div>

          {/* API Server URL */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Python FastAPI API URL
            </label>
            <div className="flex gap-2">
              <input
                id="api_url_input"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white outline-none"
              />
              <button
                id="test_conn_btn"
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                {testingConnection ? 'Testing...' : 'Test'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              Enter the backend host URL where your FastAPI application is listening (usually <code>http://localhost:8000</code>).
            </p>
          </div>

          {/* Connection diagnostics */}
          {connectionStatus === 'success' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs text-emerald-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">FastAPI Connection Verified!</span>
                <span className="text-[10px] text-emerald-500/80 block mt-0.5">The backend successfully responded to heartbeat requests.</span>
              </div>
            </div>
          )}

          {connectionStatus === 'failed' && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs text-rose-400 flex items-start gap-2">
              <X className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Heartbeat Failed</span>
                <span className="text-[10px] text-rose-500/80 block mt-1">{testError}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-950/20">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 bg-transparent hover:bg-slate-900 rounded-lg text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="save_settings_btn"
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-slate-950 font-bold rounded-lg text-xs cursor-pointer hover:opacity-90 active:opacity-100 transition-opacity"
          >
            Apply Configurations
          </button>
        </div>

      </div>
    </div>
  );
}
