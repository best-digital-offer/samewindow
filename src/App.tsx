/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Sidebar } from './components/dashboard/Sidebar';
import { TopNav } from './components/dashboard/TopNav';
import { Storage } from './lib/storage';
import { ensureDefaultProject, loadRuns } from './lib/db';
import { supabase } from './lib/supabase';
import { AIService } from './services/aiService';
import { simulateLiveAgentRun, SimulatorScenario } from './lib/simulator';
import { Run, Project } from './types';

// Landing Page Components
import { Hero } from './pages/landing/Hero';
import { TrustStrip } from './pages/landing/TrustStrip';
import { ProblemSection } from './pages/landing/ProblemSection';
import { FeatureGrid } from './pages/landing/FeatureGrid';
import { SignatureFeature } from './pages/landing/SignatureFeature';
import { HowItWorks } from './pages/landing/HowItWorks';
import { StorySection } from './pages/landing/StorySection';
import { FaqSection } from './pages/landing/FaqSection';
import { FinalCta } from './pages/landing/FinalCta';

// Public Pages
import { PricingPage } from './pages/PricingPage';
import { DocsPage } from './pages/DocsPage';
import { SecurityPage } from './pages/SecurityPage';
import { StatusPage } from './pages/StatusPage';
import { AboutPage, ContactPage, PrivacyPage, TermsPage, RefundPage } from './pages/CompanyPages';
import { AuthPage } from './pages/AuthPages';
import { BlogPage, BLOG_ARTICLES } from './pages/BlogPage';

// Dashboard Pages
import { DashboardOverviewPage } from './pages/dashboard/DashboardOverviewPage';
import { ProjectsPage } from './pages/dashboard/ProjectsPage';
import { ApiKeysPage } from './pages/dashboard/ApiKeysPage';
import { ProjectSettingsPage } from './pages/dashboard/ProjectSettingsPage';
import { BillingDashboardPage } from './pages/dashboard/BillingDashboardPage';
import { AgentsPage } from './pages/dashboard/AgentsPage';

// Run Detail & Compare Components
import { RunHeader } from './components/run/RunHeader';
import { RunTimeline } from './components/run/RunTimeline';
import { ReplayController } from './components/run/ReplayController';
import { AiAnalysisModal } from './components/run/AiAnalysisModal';
import { RunComparison } from './components/compare/RunComparison';
import { RunsTable } from './components/dashboard/RunsTable';

function MainApp() {
  const { toast } = useToast();

  // Navigation state
  const [route, setRoute] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // User and project state
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [showDemoRuns, setShowDemoRuns] = useState<boolean>(() =>
    Storage.getShowDemoRuns()
  );
  const [runs, setRuns] = useState<Run[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Run detail and interactive state
  const [isSimulating, setIsSimulating] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState(0);

  // AI Failure Analysis state
  const [aiAnalysisModalOpen, setAiAnalysisModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);

  useEffect(() => {
    const articleSlug = route.startsWith('/blog/') ? route.slice('/blog/'.length) : '';
    const article = BLOG_ARTICLES.find((item) => item.slug === articleSlug);
    const metadata: Record<string, { title: string; description: string }> = {
      '/': { title: 'SameWindow — AI Agent Flight Recorder', description: 'Record, replay, and debug AI agent executions. Inspect tool calls, latency, errors, token usage, and the first meaningful divergence.' },
      '/pricing': { title: 'Pricing — SameWindow', description: 'Simple plans for AI agent debugging, execution tracing, replay, and production analysis.' },
      '/docs': { title: 'Documentation — SameWindow', description: 'Developer documentation for recording AI agent runs, tool calls, traces, replay, and analysis.' },
      '/security': { title: 'Security — SameWindow', description: 'Security, redaction, telemetry controls, and data handling for SameWindow AI agent traces.' },
      '/blog': { title: 'AI Agent Debugging Blog — SameWindow', description: 'Practical guides to AI agent debugging, observability, tracing, run replay, tool calls, and production failures.' },
    };
    const meta = article ? { title: article.title + ' — SameWindow', description: article.description } : (metadata[route] || metadata['/']);
    document.title = meta.title;
    let description = document.querySelector('meta[name="description"]');
    if (!description) { description = document.createElement('meta'); description.setAttribute('name', 'description'); document.head.appendChild(description); }
    description.setAttribute('content', meta.description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://samewindow.com' + (route === '/' ? '/' : route));
  }, [route]);

  // Supabase authentication session
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const sessionUser = data.session?.user;
      if (sessionUser && localStorage.getItem('samewindow_auth_redirect') === 'dashboard') {
        localStorage.removeItem('samewindow_auth_redirect');
        window.history.replaceState({}, '', '/dashboard');
        setRoute('/dashboard');
      }
      setUser(sessionUser ? {
        email: sessionUser.email || '',
        name: (sessionUser.user_metadata?.full_name as string) || sessionUser.email?.split('@')[0] || 'Developer',
      } : null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser && localStorage.getItem('samewindow_auth_redirect') === 'dashboard') {
        localStorage.removeItem('samewindow_auth_redirect');
        window.history.replaceState({}, '', '/dashboard');
        setRoute('/dashboard');
      }
      setUser(sessionUser ? {
        email: sessionUser.email || '',
        name: (sessionUser.user_metadata?.full_name as string) || sessionUser.email?.split('@')[0] || 'Developer',
      } : null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) { setProjects([]); setActiveProjectId(''); setRuns([]); return; }
    let cancelled = false;
    setDataLoading(true);
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      try {
        const loaded = await ensureDefaultProject(data.user.id);
        if (cancelled) return;
        setProjects(loaded);
        const saved = localStorage.getItem('samewindow_active_project_id');
        const active = loaded.find(p => p.id === saved) || loaded[0];
        if (!active) throw new Error('No project is available for this account.');
        setActiveProjectId(active.id);
        localStorage.setItem('samewindow_active_project_id', active.id);
        setRuns(await loadRuns(active.id));
      } catch { if (!cancelled) toast('Could not load your workspace data.', 'error'); }
      finally { if (!cancelled) setDataLoading(false); }
    });
    return () => { cancelled = true; };
  }, [user]);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newRoute: string) => {
    window.history.pushState({}, '', newRoute);
    setRoute(newRoute);
    setIsReplaying(false);
    setReplayStep(0);
    window.scrollTo(0, 0);
  };

  // Re-fetch runs whenever active project or showDemoRuns changes
  useEffect(() => {
    if (!activeProjectId || showDemoRuns) return;
    loadRuns(activeProjectId).then(setRuns).catch(() => toast('Could not refresh runs.', 'error'));
  }, [activeProjectId, showDemoRuns]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const handleToggleDemoRuns = () => {
    const nextVal = !showDemoRuns;
    Storage.setShowDemoRuns(nextVal);
    setShowDemoRuns(nextVal);
    toast(
      nextVal
        ? 'Sample demo runs enabled.'
        : 'Sample demo runs hidden (Showing real runs only).',
      'info'
    );
  };

  const handleSimulateRun = async (scenario: SimulatorScenario = 'finance_401') => {
    setIsSimulating(true);
    toast(`Simulating agent execution (${scenario})...`, 'info');
    try {
      const newRun = await simulateLiveAgentRun(activeProjectId, scenario);
      setRuns(Storage.getRuns(activeProjectId));
      toast('Agent run completed and recorded to timeline.', 'success');
      navigate(`/projects/${activeProjectId}/runs/${newRun.id}`);
    } catch {
      toast('Simulation encountered an error.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast('Signed out.', 'info');
    navigate('/');
  };

  const handleTriggerAiAnalysis = async (run: Run) => {
    setAiAnalysisModalOpen(true);
    setAiAnalysisLoading(true);
    try {
      const result = await AIService.analyzeFailure(run);
      setAiAnalysisResult(result);
    } catch (err: any) {
      toast('Could not complete AI analysis.', 'error');
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const handleDeleteRun = (runId: string) => {
    if (confirm('Delete this execution run trace permanently?')) {
      Storage.deleteRun(runId);
      setRuns(Storage.getRuns(activeProjectId));
      toast('Run trace deleted.', 'info');
      navigate(`/projects/${activeProjectId}/runs`);
    }
  };

  if (authLoading || (user && dataLoading)) {
    return <div className="min-h-screen bg-[#090b0e] text-[#ededef] flex items-center justify-center text-sm text-slate-400">Loading SameWindow...</div>;
  }

  // ----------------------------------------------------
  // ROUTE PARSING & DISPATCHING
  // ----------------------------------------------------
  const isDashboardRoute =
    route.startsWith('/dashboard') ||
    route.startsWith('/projects') ||
    route.startsWith('/api-keys') ||
    route.startsWith('/billing') ||
    route.startsWith('/settings');

  // Match /projects/:projectId/runs/:runId
  const runDetailMatch = route.match(/\/projects\/[^/]+\/runs\/([^/]+)/);
  const currentRunId = runDetailMatch ? runDetailMatch[1] : null;
  const currentRun = currentRunId ? runs.find((r) => r.id === currentRunId) : null;

  // Match /projects/:projectId/compare
  const isCompareRoute = route.includes('/compare');

  // If user is not authenticated and attempts to access dashboard route, prompt to sign in
  const shouldShowAuthGuard = isDashboardRoute && !user;

  // Render Public Website (when on marketing or public routes)
  if (!isDashboardRoute || shouldShowAuthGuard) {
    if (route === '/signin' || route === '/signup' || route === '/forgot-password' || shouldShowAuthGuard) {
      return (
        <div className="min-h-screen flex flex-col bg-[#090b0e] text-[#ededef]">
          <Navbar
            currentRoute={route}
            onNavigate={navigate}
            isAuthenticated={!!user}
          />
          <main className="flex-1">
            <AuthPage
              mode={
                route === '/signup'
                  ? 'signup'
                  : route === '/forgot-password'
                  ? 'forgot-password'
                  : 'signin'
              }
              onSuccess={(u) => {
                setUser(u);
                navigate('/dashboard');
              }}
              onNavigate={navigate}
            />
          </main>
          <Footer onNavigate={navigate} />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-[#090b0e] text-[#ededef]">
        <Navbar
          currentRoute={route}
          onNavigate={navigate}
          isAuthenticated={!!user}
        />

        <main className="flex-1">
          {route === '/' && (
            <>
              <Hero
                onStartFree={() => navigate('/signup')}
                onViewDemo={() => navigate('/projects/proj_default/runs/run_1842_failed')}
              />
              <TrustStrip />
              <ProblemSection />
              <FeatureGrid />
              <SignatureFeature
                onTryCompare={() => navigate('/projects/proj_default/compare')}
              />
              <HowItWorks />
              <StorySection />
              <FaqSection />
              <FinalCta onStartBuildingFree={() => navigate('/signup')} />
            </>
          )}

          {route === '/pricing' && (
            <PricingPage
              onSelectPlan={(planId) => {
                if (!user) navigate('/signup');
              }}
              isAuthenticated={!!user}
            />
          )}

          {route.startsWith('/docs') && (
            <DocsPage
              currentSubPage={route.split('/docs/')[1] || 'quickstart'}
              onNavigate={navigate}
            />
          )}

          {route === '/security' && <SecurityPage />}
          {route === '/status' && <StatusPage />}
          {route === '/about' && <AboutPage />}
          {route === '/contact' && <ContactPage />}
          {route === '/privacy' && <PrivacyPage />}
          {route === '/terms' && <TermsPage />}
          {route === '/refund' && <RefundPage />}
          {route === '/blog' && <BlogPage onNavigate={navigate} />}
          {route.startsWith('/blog/') && <BlogPage slug={route.slice('/blog/'.length)} onNavigate={navigate} />}
        </main>

        <Footer onNavigate={navigate} />
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED DASHBOARD APPLICATION
  // ----------------------------------------------------
  if (!activeProject) {
    return (
      <div className="min-h-screen bg-[#090b0e] text-[#ededef] flex items-center justify-center text-sm text-slate-400">
        No project is available for this account.
      </div>
    );
  }

  const breadcrumbs: { label: string; route?: string }[] = [
    { label: 'Projects', route: '/projects' },
    { label: activeProject.name, route: `/projects/${activeProject.id}/runs` },
  ];

  if (currentRun) {
    breadcrumbs.push({ label: `Run #${currentRun.id}` });
  } else if (isCompareRoute) {
    breadcrumbs.push({ label: 'Compare Executions' });
  } else if (route.includes('/settings')) {
    breadcrumbs.push({ label: 'Settings' });
  } else if (route.includes('/api-keys')) {
    breadcrumbs.push({ label: 'API Keys' });
  } else if (route.includes('/agents')) {
    breadcrumbs.push({ label: 'Agents' });
  } else if (route.includes('/billing')) {
    breadcrumbs.push({ label: 'Billing' });
  }

  return (
    <div className="flex h-screen bg-[#090b0e] text-[#ededef] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentRoute={route}
        onNavigate={navigate}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => {
          setActiveProjectId(id);
          localStorage.setItem('samewindow_active_project_id', id);
        }}
        onCreateProjectClick={() => navigate('/projects')}
        userEmail={user?.email || 'developer@samewindow.io'}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <TopNav
          breadcrumbs={breadcrumbs}
          onNavigate={navigate}
          activeProject={activeProject}
          showDemoRuns={showDemoRuns}
          onToggleDemoRuns={handleToggleDemoRuns}
          onSimulateRun={handleSimulateRun}
          isSimulating={isSimulating}
        />

        <main className="flex-1 pb-16">
          {/* 1. RUN DETAIL SCREEN */}
          {currentRun ? (
            <div className="space-y-6">
              <RunHeader
                run={currentRun}
                onBack={() => navigate(`/projects/${activeProjectId}/runs`)}
                onReplayClick={() => setIsReplaying(!isReplaying)}
                isReplaying={isReplaying}
                onCompareClick={() =>
                  navigate(`/projects/${activeProjectId}/compare?runA=${currentRun.id}`)
                }
                onAnalyzeClick={() => handleTriggerAiAnalysis(currentRun)}
                onDeleteClick={() => handleDeleteRun(currentRun.id)}
                isAnalyzing={aiAnalysisLoading}
              />

              <RunTimeline
                events={currentRun.events}
                currentReplayStepIndex={isReplaying ? replayStep : undefined}
              />

              {isReplaying && (
                <ReplayController
                  events={currentRun.events}
                  currentStepIndex={replayStep}
                  onStepChange={(step) => setReplayStep(step)}
                  onCloseReplay={() => setIsReplaying(false)}
                />
              )}

              <AiAnalysisModal
                isOpen={aiAnalysisModalOpen}
                onClose={() => setAiAnalysisModalOpen(false)}
                analysis={aiAnalysisResult}
                loading={aiAnalysisLoading}
                onRetry={() => handleTriggerAiAnalysis(currentRun)}
              />
            </div>
          ) : isCompareRoute ? (
            /* 2. RUN COMPARISON SCREEN */
            <RunComparison
              runs={runs}
              onSelectRunDetail={(id) =>
                navigate(`/projects/${activeProjectId}/runs/${id}`)
              }
            />
          ) : route.includes('/runs') ? (
            /* 3. RUNS LIST SCREEN */
            <div className="p-6 space-y-4 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Execution Runs</h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filterable traces and latency metrics for {activeProject.name}.
                  </p>
                </div>
              </div>
              <RunsTable
                runs={runs}
                onSelectRun={(id) =>
                  navigate(`/projects/${activeProjectId}/runs/${id}`)
                }
              />
            </div>
          ) : route.includes('/errors') ? (
            /* 4. ERRORS ONLY SCREEN */
            <div className="p-6 space-y-4 max-w-7xl mx-auto">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Agent Error Log</h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtering exclusively for aborted or failed executions.
                </p>
              </div>
              <RunsTable
                runs={runs.filter((r) => r.status === 'FAILED')}
                onSelectRun={(id) =>
                  navigate(`/projects/${activeProjectId}/runs/${id}`)
                }
              />
            </div>
          ) : route.includes('/agents') ? (
            /* 5. AGENTS SCREEN */
            <AgentsPage
              runs={runs}
              onSelectAgent={(agentName) =>
                navigate(`/projects/${activeProjectId}/runs`)
              }
            />
          ) : route.includes('/analytics') ? (
            /* 6. ANALYTICS SCREEN */
            <div className="p-6 space-y-6 max-w-7xl mx-auto">
              <h1 className="text-xl font-bold text-white tracking-tight">Fleet Analytics</h1>
              <DashboardOverviewPage
                runs={runs}
                activeProject={activeProject}
                onSelectRun={(id) =>
                  navigate(`/projects/${activeProjectId}/runs/${id}`)
                }
                onNavigate={navigate}
                onCreateKeyClick={() => navigate('/api-keys')}
                onSimulateRun={handleSimulateRun}
              />
            </div>
          ) : route.startsWith('/projects') && !route.includes('/runs') ? (
            /* 7. PROJECTS LIST */
            <ProjectsPage
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                Storage.setActiveProjectId(id);
              }}
              onNavigate={navigate}
            />
          ) : route === '/api-keys' ? (
            /* 8. API KEYS SCREEN */
            <ApiKeysPage activeProject={activeProject} />
          ) : route.includes('/settings') ? (
            /* 9. PROJECT SETTINGS SCREEN */
            <ProjectSettingsPage
              project={activeProject}
              onProjectUpdated={(updated) => {
                setProjects(Storage.getProjects());
              }}
            />
          ) : route === '/billing' ? (
            /* 10. BILLING SCREEN */
            <BillingDashboardPage />
          ) : (
            /* 11. DEFAULT: DASHBOARD OVERVIEW */
            <DashboardOverviewPage
              runs={runs}
              activeProject={activeProject}
              onSelectRun={(id) =>
                navigate(`/projects/${activeProjectId}/runs/${id}`)
              }
              onNavigate={navigate}
              onCreateKeyClick={() => navigate('/api-keys')}
              onSimulateRun={handleSimulateRun}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
