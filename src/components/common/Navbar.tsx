import React, { useState } from 'react';
import { Menu, X, Terminal } from 'lucide-react';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
  isAuthenticated?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentRoute = '/', isAuthenticated = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (route: string) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1c222c] bg-[#090b0e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 text-slate-100 hover:text-white transition-colors group focus:outline-none"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:border-indigo-400/50 transition-colors">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-base tracking-tight text-white">SameWindow</span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
          <button
            onClick={() => handleNav('/')}
            className={`hover:text-slate-200 transition-colors ${currentRoute === '/' ? 'text-white' : ''}`}
          >
            Product
          </button>
          <button
            onClick={() => handleNav('/projects/proj_default/runs/run_1842_failed')}
            className="hover:text-slate-200 transition-colors"
          >
            Flight Recorder
          </button>
          <button
            onClick={() => handleNav('/projects/proj_default/compare')}
            className="hover:text-slate-200 transition-colors"
          >
            Divergence Compare
          </button>
          <button
            onClick={() => handleNav('/pricing')}
            className={`hover:text-slate-200 transition-colors ${currentRoute === '/pricing' ? 'text-white' : ''}`}
          >
            Pricing
          </button>
          <button
            onClick={() => handleNav('/blog')}
            className={`hover:text-slate-200 transition-colors ${currentRoute.startsWith('/blog') ? 'text-white' : ''}`}
          >
            Blog
          </button>
          <button
            onClick={() => handleNav('/docs')}
            className={`hover:text-slate-200 transition-colors ${currentRoute.startsWith('/docs') ? 'text-white' : ''}`}
          >
            Docs
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => handleNav('/dashboard')}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm"
            >
              Open Console
            </button>
          ) : (
            <>
              <button
                onClick={() => handleNav('/signin')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/signup')}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm"
              >
                Start Free
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#1c222c] bg-[#0c0f14] px-4 py-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm text-slate-300">
            <button onClick={() => handleNav('/')} className="text-left py-1 hover:text-white">Product</button>
            <button onClick={() => handleNav('/projects/proj_default/runs/run_1842_failed')} className="text-left py-1 hover:text-white">Flight Recorder Demo</button>
            <button onClick={() => handleNav('/projects/proj_default/compare')} className="text-left py-1 hover:text-white">Divergence Compare</button>
            <button onClick={() => handleNav('/pricing')} className="text-left py-1 hover:text-white">Pricing</button>
            <button onClick={() => handleNav('/blog')} className="text-left py-1 hover:text-white">Blog</button>
            <button onClick={() => handleNav('/docs')} className="text-left py-1 hover:text-white">Docs</button>
            <button onClick={() => handleNav('/status')} className="text-left py-1 hover:text-white">System Status</button>
          </div>
          <div className="pt-3 border-t border-[#1c222c] flex flex-col gap-2">
            <button
              onClick={() => handleNav('/signin')}
              className="w-full text-center py-2 text-xs font-medium text-slate-300 bg-[#161a22] rounded-md"
            >
              Sign In
            </button>
            <button
              onClick={() => handleNav('/signup')}
              className="w-full text-center py-2 text-xs font-medium text-white bg-indigo-600 rounded-md"
            >
              Start Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
