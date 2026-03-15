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

    // 1. Obter informações do anúncio e jogo
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, games(title)')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 });
    }

    // Normaliza o título do jogo (lidando com retorno do Supabase que pode ser objeto ou array)
    const gameTitle = Array.isArray(listing.games) ? listing.games[0]?.title : listing.games?.title;

    // 2. Criar registro do pedido no banco
    const orderId = `order_${Math.random().toString(36).substr(2, 9)}`;

    let checkoutUrl = '';
    let paymentData = null;

    // 3. Chamar provedor de pagamento
    if (paymentMethod === 'pix') {
      paymentData = await createPixPayment(listing.price, `Compra: ${gameTitle || 'Jogo'}`);
      checkoutUrl = `/checkout/pix/${orderId}`; 
    } else {
      paymentData = await createStripeSession(listing.price, `Compra: ${gameTitle || 'Jogo'}`);
      checkoutUrl = paymentData.url;
    }

    return NextResponse.json({
      orderId,
      checkoutUrl,
      paymentData,
    });

  } catch (error) {
    const err = error as Error;
    console.error('Checkout error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
