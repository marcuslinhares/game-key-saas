import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/escrow/release
 * Libera fundos do escrow (balance_pending -> balance_available) para um vendedor.
 * Chamado automaticamente 7 dias após a confirmação do pagamento ou manualmente pelo vendedor.
 *
 * Body: { orderId: string }
 */
export async function POST(request: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    // Buscar o pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    // Verificar se o pedido está com status 'paid' (escrow ativo)
    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Pedido não está em escrow' }, { status: 400 });
    }

    // Verificar se o usuário é o vendedor do pedido
    if (user.id !== order.seller_id) {
      return NextResponse.json({ error: 'Apenas o vendedor pode liberar os fundos' }, { status: 403 });
    }

    const amount = parseFloat(order.amount);

    // Buscar perfil do vendedor
    const { data: sellerProfile, error: sellerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.seller_id)
      .single();

    if (sellerError || !sellerProfile) {
      return NextResponse.json({ error: 'Perfil do vendedor não encontrado' }, { status: 404 });
    }

    const currentPending = parseFloat(sellerProfile.balance_pending || '0');
    const currentAvailable = parseFloat(sellerProfile.balance_available || '0');

    if (currentPending < amount) {
      return NextResponse.json({ error: 'Saldo em escrow insuficiente' }, { status: 400 });
    }

    // Atualizar saldos do vendedor
    const newPending = currentPending - amount;
    const newAvailable = currentAvailable + amount;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        balance_pending: newPending,
        balance_available: newAvailable,
      })
      .eq('id', order.seller_id);

    if (updateError) {
      return NextResponse.json({ error: 'Erro ao liberar fundos' }, { status: 500 });
    }

    // Marcar pedido como escrow released
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        escrow_released_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Registrar log financeiro
    await supabase.from('financial_logs').insert([
      {
        user_id: order.seller_id,
        order_id: orderId,
        change_amount: amount,
        new_balance_pending: newPending,
        new_balance_available: newAvailable,
        reason: 'escrow_release',
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Fundos liberados do escrow com sucesso',
      amount,
      newBalance: {
        pending: newPending,
        available: newAvailable,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Escrow release error:', err.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
