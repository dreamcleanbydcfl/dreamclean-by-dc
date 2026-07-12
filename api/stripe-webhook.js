import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const invoiceId = session.metadata?.invoice_id;

    if (invoiceId) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*, invoice_items(*)')
        .eq('id', invoiceId)
        .single();

      if (invoice) {
        const subtotal = invoice.invoice_items.reduce((s, it) => s + Number(it.qty) * Number(it.rate), 0);
        const tax = subtotal * (Number(invoice.tax_rate) || 0) / 100;
        const total = subtotal + tax;
        const paidNow = (session.amount_total || 0) / 100;
        const newPaid = (Number(invoice.amount_paid) || 0) + paidNow;
        const newStatus = newPaid >= total - 0.01 ? 'paid' : 'partial';

        await supabase
          .from('invoices')
          .update({
            amount_paid: newPaid,
            status: newStatus,
            payment_method: 'card',
            stripe_payment_intent_id: session.payment_intent || null
          })
          .eq('id', invoiceId);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
