import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'node:crypto';

function supabaseServerClient(accessToken: string) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

function getAccessToken(request: Request) {
  const auth = request.headers.get('authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
}

async function authenticatedClient(request: Request) {
  const token = getAccessToken(request);
  if (!token) return null;
  const client = supabaseServerClient(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { client, user: data.user };
}

export async function POST(request: Request) {
  try {
    const auth = await authenticatedClient(request);
    if (!auth) return Response.json({ error:'Unauthorized' }, { status:401 });
    const { client, user } = auth;
    const { projectId, name } = await request.json();
    if (!projectId || !name?.trim()) return Response.json({ error:'projectId and name are required.' }, { status:400 });

    const { data: project, error: projectError } = await client
      .from('projects').select('id').eq('id', projectId).eq('owner_id', user.id).maybeSingle();
    if (projectError) throw projectError;
    if (!project) return Response.json({ error:'Project not found.' }, { status:404 });

    const secret = 'sw_live_' + randomBytes(20).toString('hex');
    const prefix = secret.slice(0, 13) + '...' + secret.slice(-4);
    const hash = createHash('sha256').update(secret).digest('hex');

    const { data, error } = await client.from('api_keys').insert({
      project_id: projectId, name:name.trim(), key_prefix:prefix, key_hash:hash
    }).select('id,project_id,name,key_prefix,last_used_at,created_at').single();
    if (error) throw error;

    return Response.json({
      key:{ id:data.id, projectId:data.project_id, name:data.name, prefix:data.key_prefix, createdAt:data.created_at, lastUsedAt:data.last_used_at || undefined },
      rawSecret:secret,
    });
  } catch (error:any) {
    return Response.json({ error:error?.message || 'Unable to create API key.' }, { status:500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await authenticatedClient(request);
    if (!auth) return Response.json({ error:'Unauthorized' }, { status:401 });
    const { client, user } = auth;
    const { keyId } = await request.json();
    const { data:key, error:keyError } = await client.from('api_keys').select('id,project_id').eq('id',keyId).maybeSingle();
    if (keyError) throw keyError;
    if (!key) return Response.json({ error:'API key not found.' }, { status:404 });
    const { data:project, error:projectError } = await client.from('projects').select('id').eq('id',key.project_id).eq('owner_id',user.id).maybeSingle();
    if (projectError) throw projectError;
    if (!project) return Response.json({ error:'Forbidden' }, { status:403 });
    const { error:updateError } = await client.from('api_keys').update({ revoked_at:new Date().toISOString() }).eq('id',keyId);
    if (updateError) throw updateError;
    return Response.json({ success:true });
  } catch (error:any) {
    return Response.json({ error:error?.message || 'Unable to revoke API key.' }, { status:500 });
  }
}
