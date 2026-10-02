export async function POST(request: Request) {
  try {
    const body = await request.json();
    const runsCount = Array.isArray(body?.runs) ? body.runs.length : 1;

    // Persistence is intentionally not claimed here until the SameWindow
    // Supabase project is connected and the ingestion path is authenticated.
    return Response.json({
      success: true,
      persisted: false,
      ingested: runsCount,
      message: 'Trace received by the API boundary. Persistent storage is not enabled in this deployment yet.',
    });
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }
}
