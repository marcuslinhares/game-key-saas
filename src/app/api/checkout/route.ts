import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createPixPayment } from '@/lib/payments/mercado-pago';
import { createStripeSession } from '@/lib/payments/stripe';

export async function POST(request: Request) {
  try {
    // 0. Verificar autenticação (RIGOR DE SEGURANÇA)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { listingId, paymentMethod } = await request.json();

    if (!listingId || !paymentMethod) {
      return NextResponse.json({ error: 'listingId e paymentMethod são obrigatórios' }, { status: 400 });
    }

    if (!['pix', 'stripe'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 });
    }

    // 1. Obter informações do anúncio e jogo (com lock otimista para concorrência)
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, games(title)')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 });
    }

    if (!listing.active) {
      return NextResponse.json({ error: 'Anúncio inativo no momento' }, { status: 400 });
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json({ error: 'Você não pode comprar seu próprio anúncio' }, { status: 400 });
    }

    // 2. Verificar se há chave disponível
    const { data: availableKey, error: keyError } = await supabase
      .from('keys')
      .select('id')
      .eq('listing_id', listingId)
      .eq('status', 'available')
      .limit(1)
      .single();

    if (keyError || !availableKey) {
      return NextResponse.json({ error: 'Nenhuma chave disponível para este anúncio' }, { status: 404 });
    }

    // Normaliza o título do jogo (lidando com retorno do Supabase que pode ser objeto ou array)
    const gameTitle = Array.isArray(listing.games) ? listing.games[0]?.title : listing.games?.title;

    // 3. Obter seller_id do listing
    const sellerId = listing.seller_id;

    // 4. Criar registro do pedido no banco
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId,
        amount: listing.price,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 });
    }

    let checkoutUrl = '';
    let paymentData = null;

    // 5. Chamar provedor de pagamento
    if (paymentMethod === 'pix') {
      paymentData = await createPixPayment(
        listing.price,
        `Compra: ${gameTitle || 'Jogo'}`,
        { orderId: order.id, listingId },
      );
      checkoutUrl = `/checkout/pix/${order.id}`;

      // Atualiza o pedido com o payment_id
      await supabase
        .from('orders')
        .update({ payment_id: paymentData.id })
        .eq('id', order.id);
    } else {
      paymentData = await createStripeSession(
        listing.price,
        `Compra: ${gameTitle || 'Jogo'}`,
        { orderId: order.id, listingId },
      );
      checkoutUrl = paymentData.url || '';

      // Atualiza o pedido com o payment_id
      if (paymentData.id) {
        await supabase
          .from('orders')
          .update({ payment_id: paymentData.id })
          .eq('id', order.id);
      }
    }

    return NextResponse.json({
      orderId: order.id,
      checkoutUrl,
      paymentData,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Checkout error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
