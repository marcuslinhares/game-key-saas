import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/escrow/dispute
 * Abre uma disputa sobre um pedido (comprador contesta a chave recebida).
 *
 * Body: { orderId: string, reason: string, evidenceUrls?: string[] }
 */
export async function POST(request: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { orderId, reason, evidenceUrls } = await request.json();

    if (!orderId || !reason) {
      return NextResponse.json({ error: 'orderId e reason são obrigatórios' }, { status: 400 });
    }

    // Verificar se o pedido existe e pertence ao comprador
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar se já existe disputa aberta para este pedido
    const { data: existingDispute } = await supabase
      .from('disputes')
      .select('id, status')
      .eq('order_id', orderId)
      .in('status', ['open'])
      .limit(1)
      .single();

    if (existingDispute) {
      return NextResponse.json({ error: 'Já existe uma disputa aberta para este pedido' }, { status: 409 });
    }

    // Criar a disputa
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .insert({
        order_id: orderId,
        buyer_id: user.id,
        seller_id: order.seller_id,
        reason,
        evidence_urls: evidenceUrls || [],
        status: 'open',
      })
      .select()
      .single();

    if (disputeError || !dispute) {
      return NextResponse.json({ error: 'Erro ao criar disputa' }, { status: 500 });
    }

    // Atualizar status do pedido para 'disputed'
    await supabase
      .from('orders')
      .update({ status: 'disputed' })
      .eq('id', orderId);

    // Atualizar status da chave para 'disputed'
    await supabase
      .from('keys')
      .update({ status: 'disputed' })
      .eq('order_id', orderId);

    return NextResponse.json({
      success: true,
      disputeId: dispute.id,
      message: 'Disputa aberta com sucesso',
    });
  } catch (error) {
    const err = error as Error;
    console.error('Dispute creation error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
