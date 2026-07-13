import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TABLES = [
  'business_settings', 'services', 'clients', 'properties', 'team_members',
  'quotes', 'quote_items', 'jobs', 'invoices', 'invoice_items',
  'documents', 'document_signatures'
];

export async function GET(request) {
  const auth = request.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const snapshot = {};
    for (const table of TABLES) {
      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        snapshot[table] = { error: error.message };
      } else {
        snapshot[table] = data;
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const fileName = `backup-${dateStr}-${now.getTime()}.json`;
    const body = JSON.stringify({ generated_at: now.toISOString(), tables: snapshot }, null, 2);

    const { error: upErr } = await supabase.storage
      .from('backups')
      .upload(fileName, new Blob([body], { type: 'application/json' }), {
        contentType: 'application/json',
        upsert: false
      });

    if (upErr) {
      return new Response(JSON.stringify({ error: upErr.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true, file: fileName }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
