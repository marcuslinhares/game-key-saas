import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createPixPayment } from '@/lib/payments/mercado-pago';
import { createStripeSession } from '@/lib/payments/stripe';

export async function POST(request: Request) {
  try {
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

    // 2. Criar registro do pedido no banco (Status: Pending)
    // Nota: Em produção, usaríamos o service_role para bypass RLS se necessário
    // ou garantiríamos que o usuário autenticado pode inserir.
    // Aqui assumimos que o cliente Supabase está configurado corretamente.
    
    // Simulação de criação de pedido:
    const orderId = `order_${Math.random().toString(36).substr(2, 9)}`;

    let checkoutUrl = '';
    let paymentData = null;

    // 3. Chamar provedor de pagamento
    if (paymentMethod === 'pix') {
      paymentData = await createPixPayment(listing.price, `Compra: ${listing.games.title}`);
      checkoutUrl = `/checkout/pix/${orderId}`; // Redireciona para tela de QR Code interna
    } else {
      paymentData = await createStripeSession(listing.price, `Compra: ${listing.games.title}`);
      checkoutUrl = paymentData.url;
    }

    return NextResponse.json({
      orderId,
      checkoutUrl,
      paymentData,
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
