import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  try {
    const { invoiceId } = await request.json();
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: 'Missing invoiceId' }), { status: 400 });
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, invoice_items(*), clients(name, email)')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return new Response(JSON.stringify({ error: 'Invoice not found' }), { status: 404 });
    }

    const subtotal = invoice.invoice_items.reduce((s, it) => s + Number(it.qty) * Number(it.rate), 0);
    const tax = subtotal * (Number(invoice.tax_rate) || 0) / 100;
    const total = subtotal + tax;
    const balance = total - (Number(invoice.amount_paid) || 0);

    if (balance <= 0) {
      return new Response(JSON.stringify({ error: 'This invoice is already paid.' }), { status: 400 });
    }

    const origin = request.headers.get('origin') || `https://${request.headers.get('host')}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: invoice.clients?.email || undefined,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Dream Clean by DC — Invoice #${invoiceId.slice(0, 6)}` },
          unit_amount: Math.round(balance * 100)
        },
        quantity: 1
      }],
      metadata: { invoice_id: invoiceId },
      success_url: `${origin}/?paid=1`,
      cancel_url: `${origin}/?canceled=1`
    });

    await supabase
      .from('invoices')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', invoiceId);

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
