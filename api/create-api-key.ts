import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash } from 'node:crypto';

function adminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment is not configured.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function authenticatedUser(request: Request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const client = adminClient();
  const { data } = await client.auth.getUser(token);
  return data.user || null;
}

export async function POST(request: Request) {
  try {
    const user = await authenticatedUser(request);
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const { projectId, name } = await request.json();
    if (!projectId || !name?.trim()) return Response.json({ error:'projectId and name are required.' }, { status:400 });

    const admin = adminClient();
    const { data: project } = await admin.from('projects').select('id').eq('id', projectId).eq('owner_id', user.id).maybeSingle();
    if (!project) return Response.json({ error:'Project not found.' }, { status:404 });

    const secret = 'sw_live_' + randomBytes(20).toString('hex');
    const prefix = secret.slice(0, 13) + '...' + secret.slice(-4);
    const hash = createHash('sha256').update(secret).digest('hex');

    const { data, error } = await admin.from('api_keys').insert({
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
    const user = await authenticatedUser(request);
    if (!user) return Response.json({ error:'Unauthorized' }, { status:401 });
    const { keyId } = await request.json();
    const admin = adminClient();
    const { data:key } = await admin.from('api_keys').select('id,project_id').eq('id',keyId).maybeSingle();
    if (!key) return Response.json({ error:'API key not found.' }, { status:404 });
    const { data:project } = await admin.from('projects').select('id').eq('id',key.project_id).eq('owner_id',user.id).maybeSingle();
    if (!project) return Response.json({ error:'Forbidden' }, { status:403 });
    await admin.from('api_keys').update({ revoked_at:new Date().toISOString() }).eq('id',keyId);
    return Response.json({ success:true });
  } catch (error:any) {
    return Response.json({ error:error?.message || 'Unable to revoke API key.' }, { status:500 });
  }
}
