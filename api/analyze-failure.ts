import { AIAnalysisService } from '../server/api.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const trace = body?.trace || body;
    if (!trace || typeof trace !== 'object') {
      return Response.json({ error: 'A trace object is required.' }, { status: 400 });
    }

    const provider = AIAnalysisService.getProvider();
    const analysis = await provider.analyzeFailure(trace);

    return Response.json({
      ...analysis,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      { error: 'Internal Analysis Error', message: error?.message || 'Analysis failed.' },
      { status: 500 }
    );
  }
}
