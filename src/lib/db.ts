import { supabase } from './supabase';
import { Project, Run, RunEvent, ApiKey } from '../types';

const DEFAULT_REDACTION_KEYS = ['email','password','apiKey','authorization','creditCard'];

export async function loadProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').eq('owner_id', userId).order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapProject);
}

export async function ensureDefaultProject(userId: string): Promise<Project[]> {
  const existing = await loadProjects(userId);
  if (existing.length) return existing;
  const { error } = await supabase.from('projects').insert({
    owner_id: userId,
    name: 'Default Agent Fleet',
    description: 'Production tool-calling agents and workflow telemetry',
    environment: 'production',
    redaction_keys: DEFAULT_REDACTION_KEYS,
    retention_days: 30,
  });
  if (error) throw error;
  return loadProjects(userId);
}

export async function createProject(userId: string, name: string, description: string, environment: Project['environment']): Promise<Project> {
  const { data, error } = await supabase.from('projects').insert({
    owner_id: userId, name, description, environment,
    redaction_keys: DEFAULT_REDACTION_KEYS, retention_days: 30,
  }).select().single();
  if (error) throw error;
  return mapProject(data);
}

export async function updateProject(project: Project): Promise<Project> {
  const { data, error } = await supabase.from('projects').update({
    name: project.name, description: project.description, environment: project.environment,
    redaction_keys: project.redactionKeys, retention_days: project.retentionDays,
    updated_at: new Date().toISOString(),
  }).eq('id', project.id).select().single();
  if (error) throw error;
  return mapProject(data);
}

export async function loadRuns(projectId: string): Promise<Run[]> {
  const { data, error } = await supabase.from('runs').select('*, run_events(*)').eq('project_id', projectId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRun);
}

export async function loadApiKeys(projectId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase.from('api_keys').select('id,project_id,name,key_prefix,last_used_at,created_at').eq('project_id', projectId).is('revoked_at', null).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((k: any) => ({
    id:k.id, projectId:k.project_id, name:k.name, prefix:k.key_prefix,
    createdAt:k.created_at, lastUsedAt:k.last_used_at || undefined,
  }));
}

function mapProject(p: any): Project {
  return { id:p.id, name:p.name, description:p.description || '', environment:p.environment, createdAt:p.created_at, redactionKeys:p.redaction_keys || DEFAULT_REDACTION_KEYS, retentionDays:p.retention_days };
}

function mapRun(r: any): Run {
  const events = (r.run_events || []).sort((a:any,b:any)=>a.sequence-b.sequence).map(mapEvent);
  return {
    id:r.id, projectId:r.project_id, agentName:r.metadata?.agentName || 'AI Agent',
    status:r.status, startedAt:r.started_at, completedAt:r.ended_at || undefined,
    durationMs:r.duration_ms || 0, totalTokens:r.total_tokens || 0,
    inputTokens:r.input_tokens || 0, outputTokens:r.output_tokens || 0,
    estimatedCost:Number(r.estimated_cost || 0), model:r.model || 'unknown',
    environment:r.metadata?.environment || 'production',
    errorMessage:r.error_message || undefined, tags:r.metadata?.tags || undefined,
    events,
  };
}

function mapEvent(e:any): RunEvent {
  return {
    id:e.id, runId:e.run_id, timestamp:e.started_at || e.created_at,
    offsetMs:Number(e.metadata?.offsetMs || 0), type:e.event_type, title:e.name || e.event_type,
    status:e.status, statusCode:e.metadata?.statusCode, durationMs:e.duration_ms || undefined,
    data:{
      ...(e.metadata?.eventData || {}),
      ...(e.metadata || {}),
      rawInput:e.input,
      rawOutput:e.output,
      error:e.error || undefined,
    },
  };
}
