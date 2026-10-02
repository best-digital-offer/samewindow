import React, { useState } from 'react';
import { Terminal, Lock, Mail, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { Storage } from '../lib/storage';
import { useToast } from '../components/common/Toast';

interface AuthPageProps {
  mode: 'signin' | 'signup' | 'forgot-password';
  onSuccess: (user: { email: string; name: string }) => void;
  onNavigate: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onSuccess, onNavigate }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (mode === 'forgot-password') {
        setForgotSent(true);
        toast(`Password reset link dispatched to ${email}`, 'success');
        return;
      }

      const user = {
        email: email || 'developer@samewindow.io',
        name: name || email.split('@')[0] || 'Developer',
      };
      Storage.setUserSession(user);
      toast(mode === 'signup' ? 'Welcome to SameWindow! Flight recorder initialized.' : 'Signed in successfully.', 'success');
      onSuccess(user);
    }, 400);
  };

  const handleDemoSignIn = () => {
    const devUser = { email: 'developer@samewindow.io', name: 'Dev Operator' };
    Storage.setUserSession(devUser);
    toast('Authenticated as Dev Operator.', 'success');
    onSuccess(devUser);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-white font-bold text-base hover:text-indigo-400 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
            <span>SameWindow</span>
          </button>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'signin' && 'Sign in to Console'}
            {mode === 'signup' && 'Create your free account'}
            {mode === 'forgot-password' && 'Reset your password'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'signin' && 'Enter your credentials to access your agent runs'}
            {mode === 'signup' && 'Includes 1,000 monthly runs and live trace replay'}
            {mode === 'forgot-password' && 'Enter your registered email address'}
          </p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-[#0c0f16] border border-[#1b2230] shadow-2xl space-y-4">
          {forgotSent ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-semibold text-white">Reset Email Sent</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check <span className="text-slate-200">{email}</span> for the recovery link to configure a new password.
              </p>
              <button
                onClick={() => onNavigate('/signin')}
                className="text-xs text-indigo-400 hover:underline pt-2 inline-block"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Ada Lovelace"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="developer@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              {mode !== 'forgot-password' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => onNavigate('/forgot-password')}
                        className="text-[11px] text-indigo-400 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                <span>
                  {loading
                    ? 'Authenticating...'
                    : mode === 'signin'
                    ? 'Sign In'
                    : mode === 'signup'
                    ? 'Start Free'
                    : 'Send Reset Link'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Instant Developer Demo Sign-in */}
          {mode !== 'forgot-password' && (
            <div className="pt-2 border-t border-[#171d28] space-y-2">
              <button
                onClick={handleDemoSignIn}
                type="button"
                className="w-full py-2 rounded-lg text-xs font-medium text-slate-300 bg-[#121622] hover:bg-[#18202e] border border-[#222b3b] hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Instant 1-Click Sandbox Sign-In</span>
              </button>
            </div>
          )}

          {/* Footer switcher */}
          <div className="text-center text-xs text-slate-400 pt-1">
            {mode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button
                  onClick={() => onNavigate('/signup')}
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Start free
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('/signin')}
                  className="text-indigo-400 hover:underline font-medium"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
