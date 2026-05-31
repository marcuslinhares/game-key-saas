import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/webhooks/mercadopago
 * Recebe notificações do Mercado Pago (IPN) para processar confirmações de pagamento Pix.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data, type } = body;

    // Mercado Pago IPN pode vir de diferentes formas
    // Tópico padrão: "payment" com data.id
    if (type !== 'payment' && action !== 'payment.created' && action !== 'payment.updated') {
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id?.toString() || body?.data?.id?.toString();

    if (!paymentId) {
      console.warn('Mercado Pago webhook sem payment_id');
      return NextResponse.json({ received: true });
    }

    // Buscar pedido pelo payment_id
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (orderError || !order) {
      console.warn(`Pedido não encontrado para payment_id ${paymentId}`);
      return NextResponse.json({ received: true });
    }

    // Se o pedido já está pago, ignorar
    if (order.status === 'paid' || order.status === 'completed') {
      return NextResponse.json({ received: true });
    }

    // Verificar status do pagamento no Mercado Pago
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      console.warn('MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return NextResponse.json({ received: true });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!mpResponse.ok) {
      console.error('Erro ao consultar status do pagamento no MP');
      return NextResponse.json({ received: true });
    }

    const payment = await mpResponse.json();

    if (payment.status !== 'approved') {
      console.log(`Pagamento ${paymentId} ainda não aprovado (status: ${payment.status})`);
      return NextResponse.json({ received: true });
    }

    // Pagamento aprovado! Atualizar pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', order.id)
      .eq('status', 'pending');

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError.message);
      return NextResponse.json({ received: true });
    }

    // Alocar chave para o pedido
    const { data: key, error: keyError } = await supabase
      .from('keys')
      .select('id')
      .eq('listing_id', order.listing_id)
      .eq('status', 'available')
      .limit(1)
      .single();

    if (!keyError && key) {
      await supabase
        .from('keys')
        .update({
          status: 'sold',
          order_id: order.id,
        })
        .eq('id', key.id);

      // Atualizar estoque
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
    }

    // Adicionar ao escrow (balance_pending)
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

      // Log financeiro
      await supabase.from('financial_logs').insert([
        {
          user_id: order.seller_id,
          order_id: order.id,
          change_amount: amount,
          new_balance_pending: currentPending + amount,
          new_balance_available: 0,
          reason: 'sale',
        },
      ]);

      // Data de liberação do escrow (7 dias)
      const releaseDate = new Date();
      releaseDate.setDate(releaseDate.getDate() + 7);
      await supabase
        .from('orders')
        .update({ escrow_release_date: releaseDate.toISOString() })
        .eq('id', order.id);
    }

    console.log(`Pedido ${order.id} pago com sucesso via Mercado Pago Pix. Escrow liberado em +7 dias`);

    return NextResponse.json({ received: true });
  } catch (error) {
    const err = error as Error;
    console.error('Mercado Pago webhook error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
