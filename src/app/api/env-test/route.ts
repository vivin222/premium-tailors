export const dynamic = 'force-dynamic'; export async function GET() { return Response.json({ keys: Object.keys(process.env) }); }  
