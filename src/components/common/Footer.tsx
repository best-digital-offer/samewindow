import React from 'react';
import { Terminal, Github, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#181e28] bg-[#07090c] text-slate-400 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <div className="w-5 h-5 rounded bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Terminal className="w-3 h-3" />
            </div>
            SameWindow
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The developer flight recorder for AI agents and tool-calling applications.
          </p>
          <div className="flex items-center gap-3 pt-2 text-slate-400">
            <span className="text-xs font-mono text-slate-400">v1.2.0-stable</span>
          </div>
        </div>

        {/* Product */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider">Product</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">Overview</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/projects/proj_default/runs/run_1842_failed')} className="hover:text-white transition-colors">Timeline Inspection</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/projects/proj_default/compare')} className="hover:text-white transition-colors">Run Comparison</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/pricing')} className="hover:text-white transition-colors">Pricing</button>
            </li>
          </ul>
        </div>

        {/* Developers */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider">Developers</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/docs')} className="hover:text-white transition-colors">Documentation</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/docs/quickstart')} className="hover:text-white transition-colors">Quickstart</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/docs/javascript')} className="hover:text-white transition-colors">SDK Reference</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/docs/api')} className="hover:text-white transition-colors">Ingestion API</button>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider">Company</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">About</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">Contact</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/security')} className="hover:text-white transition-colors">Security</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/status')} className="hover:text-white transition-colors">Status</button>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-200 tracking-wider">Legal</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">Terms</button>
            </li>
            <li>
              <button onClick={() => onNavigate('/refund')} className="hover:text-white transition-colors">Refund Policy</button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-[#141922] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          © 2026 SameWindow. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span>Zero prompt retention available</span>
          <span aria-hidden="true">·</span>
          <span>End-to-end telemetry encryption</span>
        </div>
      </div>
    </footer>
  );
};
