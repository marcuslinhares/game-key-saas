import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/escrow/disputes/resolve
 * Resolve uma disputa (admin ou sistema).
 *
 * Body: { disputeId: string, resolution: 'resolved_buyer' | 'resolved_seller', adminNotes?: string }
 */
export async function POST(request: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { disputeId, resolution, adminNotes } = await request.json();

    if (!disputeId || !resolution) {
      return NextResponse.json({ error: 'disputeId e resolution são obrigatórios' }, { status: 400 });
    }

    if (!['resolved_buyer', 'resolved_seller'].includes(resolution)) {
      return NextResponse.json({ error: 'Resolução inválida' }, { status: 400 });
    }

    // Buscar a disputa
    const { data: dispute, error: disputeError } = await supabase
      .from('disputes')
      .select('*, orders(*)')
      .eq('id', disputeId)
      .single();

    if (disputeError || !dispute) {
      return NextResponse.json({ error: 'Disputa não encontrada' }, { status: 404 });
    }

    if (dispute.status !== 'open') {
      return NextResponse.json({ error: 'Disputa já foi resolvida' }, { status: 400 });
    }

    // Verificar permissão: apenas o comprador, vendedor ou admin pode resolver
    const isBuyer = user.id === dispute.buyer_id;
    const isSeller = user.id === dispute.seller_id;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Sem permissão para resolver esta disputa' }, { status: 403 });
    }

    const order = dispute.orders as { id: string; amount: string; seller_id: string; buyer_id: string };

    // Atualizar status da disputa
    const { error: updateError } = await supabase
      .from('disputes')
      .update({
        status: resolution,
        admin_notes: adminNotes || null,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', disputeId);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao resolver disputa' }, { status: 500 });
    }

    if (resolution === 'resolved_buyer') {
      // Comprador venceu: estornar valor para o comprador
      // No MVP: marcar pedido como cancelado e devolver fundos
      await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', order.id);
    } else {
      // Vendedor venceu: liberar escrow para o vendedor
      await supabase
        .from('orders')
        .update({
          status: 'completed',
          escrow_released_at: new Date().toISOString(),
        })
        .eq('id', order.id);
    }

    return NextResponse.json({
      success: true,
      message: `Disputa resolvida: ${resolution === 'resolved_buyer' ? 'comprador venceu' : 'vendedor venceu'}`,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Dispute resolution error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
