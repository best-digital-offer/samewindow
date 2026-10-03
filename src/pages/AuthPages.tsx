import React, { useState } from 'react';
import { Terminal, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    localStorage.setItem('samewindow_auth_redirect', 'dashboard');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast(error.message || 'Google authentication failed.', 'error');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    try {
      if (mode === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/signin',
        });
        if (error) throw error;
        setForgotSent(true);
        toast('Password reset email sent.', 'success');
        return;
      }

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;

        if (!data.session) {
          toast('Account created. Check your email to confirm your address.', 'success');
          onNavigate('/signin');
          return;
        }

        const user = data.user;
        onSuccess({
          email: user?.email || email,
          name: name || user?.email?.split('@')[0] || 'Developer',
        });
        toast('Account created successfully.', 'success');
        return;
      }

      localStorage.setItem('samewindow_auth_redirect', 'dashboard');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const user = data.user;
      onSuccess({
        email: user?.email || email,
        name: (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Developer',
      });
      toast('Signed in successfully.', 'success');
    } catch (error: any) {
      const message = error?.message || 'Authentication failed. Please check your details and try again.';
      setAuthError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
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

        <div className="p-6 rounded-2xl bg-[#0c0f16] border border-[#1b2230] shadow-2xl space-y-4">
          {forgotSent ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-xs font-semibold text-white">Reset Email Sent</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Check <span className="text-slate-200">{email}</span> for the recovery link.
              </p>
              <button
                onClick={() => onNavigate('/signin')}
                className="text-xs text-indigo-400 hover:underline pt-2 inline-block"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <>
              {mode !== 'forgot-password' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className="w-full py-2.5 rounded-lg text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 border border-slate-200 shadow-sm"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                      <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21z"/>
                      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.52A9.74 9.74 0 0 0 12 21.5z"/>
                      <path fill="#FBBC05" d="M6.53 13.59A5.85 5.85 0 0 1 6.22 12c0-.55.1-1.08.31-1.59V7.89H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.11l3.24-2.52z"/>
                      <path fill="#EA4335" d="M12 6.38c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.37 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.71 5.39l3.24 2.52C7.3 8.1 9.46 6.38 12 6.38z"/>
                    </svg>
                    <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                  </button>

                  <div className="flex items-center gap-3 py-1">
                    <div className="h-px flex-1 bg-[#202735]" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">or</span>
                    <div className="h-px flex-1 bg-[#202735]" />
                  </div>
                </>
              )}

              {authError && (
                <div role="alert" aria-live="polite" className="rounded-lg border border-rose-900/50 bg-rose-950/30 px-3 py-2.5 text-xs text-rose-200">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {mode === 'signup' && (
                  <div>
                    <label htmlFor="full-name" className="block text-slate-400 mb-1">Full Name</label>
                    <input
                      id="full-name"
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
                  <label htmlFor="auth-email" className="block text-slate-400 mb-1">Email</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (authError) setAuthError(''); }}
                    className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                {mode !== 'forgot-password' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="auth-password" className="text-slate-400">Password</label>
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
                      id="auth-password"
                      type="password"
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (authError) setAuthError(''); }}
                      className="w-full p-2.5 rounded-lg bg-[#10141d] border border-[#212836] text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-2"
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
            </>
          )}

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-[#171d28]">
            {mode === 'signin' ? (
              <span>
                Don't have an account?{' '}
                <button onClick={() => onNavigate('/signup')} className="text-indigo-400 hover:underline font-medium">
                  Start free
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button onClick={() => onNavigate('/signin')} className="text-indigo-400 hover:underline font-medium">
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
