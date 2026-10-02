import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

function adminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured.');
  return createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } });
}

const json = (value:any) => value == null ? null : value;

export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || '';
    const apiKey = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    const projectHeader = request.headers.get('x-project-id') || '';
    if (!apiKey) return Response.json({ error:'Missing API key.' }, {status:401});

    const body = await request.json();
    const runs = Array.isArray(body?.runs) ? body.runs : [body];
    const admin = adminClient();
    const hash = createHash('sha256').update(apiKey).digest('hex');

    const { data:keyRow } = await admin.from('api_keys')
      .select('id,project_id')
      .eq('key_hash',hash)
      .is('revoked_at',null)
      .maybeSingle();

    if (!keyRow || (projectHeader && projectHeader !== keyRow.project_id)) {
      return Response.json({ error:'Invalid API key or project.' }, {status:401});
    }

    const now = new Date().toISOString();
    await admin.from('api_keys').update({last_used_at:now}).eq('id',keyRow.id);

    let ingested = 0;
    for (const run of runs) {
      if (!run || typeof run !== 'object') continue;

      const agentName = String(run.agentName || run.agent || 'AI Agent').slice(0,200);
      let agentId:string|null = null;
      const { data:existingAgent } = await admin.from('agents').select('id').eq('project_id',keyRow.project_id).eq('name',agentName).maybeSingle();
      if (existingAgent) agentId = existingAgent.id;
      else {
        const { data:newAgent } = await admin.from('agents').insert({project_id:keyRow.project_id,name:agentName,environment:run.environment || 'production',metadata:{}}).select('id').single();
        agentId = newAgent?.id || null;
      }

      const metadata = {
        ...(run.metadata && typeof run.metadata === 'object' ? run.metadata : {}),
        agentName, environment:run.environment || 'production', tags:run.tags || [],
      };

      const { data:inserted, error:runError } = await admin.from('runs').insert({
        project_id:keyRow.project_id, agent_id:agentId, external_run_id:run.id || null,
        status:run.status || 'SUCCESS', started_at:run.startedAt || now, ended_at:run.completedAt || now,
        duration_ms:Number(run.durationMs || 0), model:run.model || null, provider:run.provider || null,
        input_tokens:Number(run.inputTokens || 0), output_tokens:Number(run.outputTokens || 0),
        total_tokens:Number(run.totalTokens || 0), estimated_cost:Number(run.estimatedCost || 0),
        error_message:run.errorMessage || null, metadata,
        input_snapshot:run.inputSnapshot ?? null, output_snapshot:run.outputSnapshot ?? null,
      }).select('id').single();
      if (runError) throw runError;

      const events = Array.isArray(run.events) ? run.events : [];
      if (events.length) {
        const rows = events.map((e:any,index:number)=>({
          run_id:inserted.id, sequence:index,
          event_type:e.type || 'CUSTOM', name:e.title || e.type || 'Event',
          status:e.status || null, started_at:e.timestamp || now, ended_at:e.timestamp || now,
          duration_ms:e.durationMs != null ? Number(e.durationMs) : null,
          input:json(e.data?.userInput ? {userInput:e.data.userInput} : e.data?.toolCall?.arguments),
          output:json(e.data?.finalResponse ?? e.data?.toolCall?.response ?? e.data?.modelCall?.responsePreview),
          error:json(e.data?.error || null),
          metadata:{offsetMs:Number(e.offsetMs || 0), statusCode:e.statusCode ?? null},
        }));
        const {error:eventError}=await admin.from('run_events').insert(rows);
        if (eventError) throw eventError;
      }

      ingested++;
    }

    return Response.json({success:true,persisted:true,ingested});
  } catch (error:any) {
    return Response.json({error:error?.message || 'Trace ingestion failed.'},{status:500});
  }
}
