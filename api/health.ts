export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'SameWindow Engine',
    timestamp: new Date().toISOString(),
  });
}
