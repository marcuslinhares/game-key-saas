import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/webhooks/stripe
 * Recebe webhooks do Stripe para processar confirmações de pagamento.
 */
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET não configurado — webhook ignorado');
      return NextResponse.json({ received: true });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe não configurado' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      console.error('Stripe webhook signature verification failed:', message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Processar evento de checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.warn('Webhook recebido sem orderId nos metadados');
        return NextResponse.json({ received: true });
      }

      // 1. Atualizar status do pedido para 'paid'
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: session.id,
        })
        .eq('id', orderId)
        .eq('status', 'pending')
        .select()
        .single();

      if (orderError || !order) {
        console.error('Erro ao atualizar pedido:', orderError?.message);
        return NextResponse.json({ received: true });
      }

      // 2. Alocar chave para o pedido (marcar como sold)
      const { data: key, error: keyError } = await supabase
        .from('keys')
        .select('id')
        .eq('listing_id', order.listing_id)
        .eq('status', 'available')
        .limit(1)
        .single();

      if (keyError || !key) {
        console.error('Nenhuma chave disponível para alocar');
        return NextResponse.json({ received: true });
      }

      await supabase
        .from('keys')
        .update({
          status: 'sold',
          order_id: orderId,
        })
        .eq('id', key.id);

      // 3. Atualizar contagem de estoque do anúncio
      const { data: listing } = await supabase
        .from('listings')
        .select('stock_count')
        .eq('id', order.listing_id)
        .single();

      if (listing && listing.stock_count > 0) {
        await supabase
          .from('listings')
          .update({ stock_count: listing.stock_count - 1 })
          .eq('id', order.listing_id);
      }

      // 4. Adicionar valor ao balance_pending do vendedor (escrow)
      const amount = parseFloat(order.amount);
      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('balance_pending')
        .eq('id', order.seller_id)
        .single();

      if (sellerProfile) {
        const currentPending = parseFloat(sellerProfile.balance_pending || '0');
        await supabase
          .from('profiles')
          .update({ balance_pending: currentPending + amount })
          .eq('id', order.seller_id);
      }

      // 5. Registrar log financeiro
      await supabase.from('financial_logs').insert([
        {
          user_id: order.seller_id,
          order_id: orderId,
          change_amount: amount,
          new_balance_pending: parseFloat(sellerProfile?.balance_pending || '0') + amount,
          new_balance_available: 0,
          reason: 'sale',
        },
      ]);

      // 6. Definir data de liberação do escrow (7 dias)
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + 7);
      await supabase
        .from('orders')
        .update({ escrow_release_date: releaseDate.toISOString() })
        .eq('id', orderId);

      console.log(`Pedido ${orderId} pago com sucesso via Stripe. Escrow liberado em ${releaseDate.toISOString()}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err = error as Error;
    console.error('Stripe webhook error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
