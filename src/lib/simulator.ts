import { SameWindow } from '../sdk';
import { Storage } from './storage';
import { Run } from '../types';

export type SimulatorScenario = 'finance_401' | 'sql_syntax' | 'nominal_success';

export async function simulateLiveAgentRun(
  projectId: string,
  scenario: SimulatorScenario = 'nominal_success',
  onProgress?: (step: string) => void
): Promise<Run> {
  const sw = new SameWindow({
    apiKey: 'sw_live_simulated_key',
    projectId,
  });

  const runNum = Math.floor(1000 + Math.random() * 9000);

  if (scenario === 'finance_401') {
    const recorder = sw.startRun({
      agent: 'Customer Refund Specialist',
      model: 'llama-3.3-70b-versatile',
    });

    onProgress?.('Receiving refund prompt...');
    recorder.userInput(`Customer requested immediate cash refund of $142.00 for order #ORD-${runNum}`);
    await new Promise((r) => setTimeout(r, 180));

    onProgress?.('Model analyzing customer verification...');
    recorder.modelCall({
      model: 'llama-3.3-70b-versatile',
      inputTokens: 490,
      outputTokens: 72,
      latencyMs: 310,
      promptPreview: 'Customer policy: Verify customer lifetime standing before dispatching refund...',
      responsePreview: `Action: search_customer({"orderId": "ORD-${runNum}"})`,
    });
    await new Promise((r) => setTimeout(r, 200));

    recorder.toolCall(
      'search_customer',
      { orderId: `ORD-${runNum}` },
      { customerId: `cus_${runNum}`, status: 'VERIFIED', tier: 'PRO' },
      200,
      340
    );
    await new Promise((r) => setTimeout(r, 200));

    onProgress?.('Executing process_refund payment gateway mutation...');
    recorder.toolCall(
      'process_refund',
      { orderId: `ORD-${runNum}`, amount: 142.0, currency: 'USD' },
      {
        error: 'Unauthorized',
        code: 'EXPIRED_PAYMENT_SESSION_TOKEN',
        message: 'The OAuth token scope has expired or lacks finance:refund permissions',
      },
      401,
      280
    );
    await new Promise((r) => setTimeout(r, 200));

    onProgress?.('Agent retrying process_refund...');
    recorder.toolCall(
      'process_refund',
      { orderId: `ORD-${runNum}`, amount: 142.0, currency: 'USD', retry: 1 },
      {
        error: 'Unauthorized',
        code: 'EXPIRED_PAYMENT_SESSION_TOKEN',
        message: 'The OAuth token scope has expired or lacks finance:refund permissions',
      },
      401,
      270
    );
    await new Promise((r) => setTimeout(r, 150));

    recorder.error(
      'ToolAuthenticationException',
      `HTTP 401 Unauthorized encountered on process_refund for order ORD-${runNum}`,
      401,
      'process_refund'
    );

    const run = recorder.end(
      'Execution aborted: could not process refund due to expired gateway bearer authorization.',
      'FAILED'
    );
    Storage.saveRun(run);
    return run;
  }

  if (scenario === 'sql_syntax') {
    const recorder = sw.startRun({
      agent: 'Warehouse SQL Copilot',
      model: 'llama-3.3-70b-versatile',
    });

    onProgress?.('Receiving aggregation analytical prompt...');
    recorder.userInput(`Aggregate total sales grouped by merchant_id and created_at date for Q3 2026`);
    await new Promise((r) => setTimeout(r, 180));

    recorder.modelCall({
      model: 'llama-3.3-70b-versatile',
      inputTokens: 620,
      outputTokens: 110,
      latencyMs: 380,
      promptPreview: 'Generate SQL for warehouse reporting...',
      responsePreview: 'SELECT merchant_id, created_at, SUM(gross) FROM sales GROUP BY merchant_id',
    });
    await new Promise((r) => setTimeout(r, 200));

    onProgress?.('Executing query on PostgreSQL warehouse...');
    recorder.toolCall(
      'execute_sql_query',
      { query: 'SELECT merchant_id, created_at, SUM(gross) FROM sales GROUP BY merchant_id' },
      {
        error: 'SQLSTATE 42803',
        message: 'column "sales.created_at" must appear in the GROUP BY clause or be used in an aggregate function',
      },
      400,
      310
    );
    await new Promise((r) => setTimeout(r, 180));

    recorder.error(
      'QueryExecutionException',
      'PostgreSQL SQLSTATE 42803: unaggregated column created_at missing from GROUP BY clause',
      400,
      'execute_sql_query'
    );

    const run = recorder.end('Execution halted following warehouse syntax exception.', 'FAILED');
    Storage.saveRun(run);
    return run;
  }

  // Nominal Success Scenario
  const recorder = sw.startRun({
    agent: 'Autonomous Financial Ops Agent',
    model: 'llama-3.3-70b-versatile',
  });

  onProgress?.('Receiving customer prompt...');
  recorder.userInput(`Issue emergency voucher of $50 for delayed flight reservation #RES-${runNum}`);
  await new Promise((r) => setTimeout(r, 180));

  onProgress?.('Model analyzing policy invariants...');
  recorder.modelCall({
    model: 'llama-3.3-70b-versatile',
    inputTokens: 520,
    outputTokens: 85,
    temperature: 0.1,
    latencyMs: 310,
    promptPreview: 'Analyze airline delay compensation eligibility against ticket class rules...',
    responsePreview: `Action: verify_reservation({"reservationId": "RES-${runNum}"})`,
  });
  await new Promise((r) => setTimeout(r, 200));

  onProgress?.('Invoking reservation database tool...');
  recorder.toolCall(
    'verify_reservation',
    { reservationId: `RES-${runNum}` },
    { status: 'CONFIRMED', delayedHours: 4.5, passengerClass: 'BUSINESS' },
    200,
    380
  );
  await new Promise((r) => setTimeout(r, 200));

  onProgress?.('Model selecting payment ledger tool...');
  recorder.modelCall({
    model: 'llama-3.3-70b-versatile',
    inputTokens: 610,
    outputTokens: 70,
    temperature: 0.1,
    latencyMs: 280,
    promptPreview: 'Passenger verified. 4.5h delay qualifies for voucher issuance.',
    responsePreview: `Action: issue_credit({"amount": 50, "currency": "USD", "resId": "RES-${runNum}"})`,
  });
  await new Promise((r) => setTimeout(r, 180));

  onProgress?.('Issuing credit via financial gateway...');
  recorder.toolCall(
    'issue_credit',
    { amount: 50, currency: 'USD', resId: `RES-${runNum}` },
    { voucherCode: `VOUCH-${runNum}-OK`, validUntil: '2027-10-01' },
    200,
    320
  );
  await new Promise((r) => setTimeout(r, 180));

  onProgress?.('Finalizing run trace...');
  const completedRun = recorder.end(
    `Voucher of $50 successfully issued under reference VOUCH-${runNum}-OK.`,
    'SUCCESS'
  );

  Storage.saveRun(completedRun);
  return completedRun;
}
