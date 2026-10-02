import { AIAnalysisService } from '../server/api.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { runA, runB, divergence } = body || {};

    if (!runA || !runB) {
      return Response.json({ error: 'runA and runB are required.' }, { status: 400 });
    }

    const provider = AIAnalysisService.getProvider();
    const explanation = await provider.explainComparison(runA, runB, divergence);

    return Response.json({
      explanation,
      divergence,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      { error: 'Internal Comparison Error', message: error?.message || 'Comparison failed.' },
      { status: 500 }
    );
  }
}
