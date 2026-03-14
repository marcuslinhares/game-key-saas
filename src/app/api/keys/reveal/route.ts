import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    // 1. Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Verificar se o pedido pertence ao usuário e está pago
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, keys(*)')
      .eq('id', orderId)
      .eq('buyer_id', user.id)
      .eq('status', 'paid')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido não encontrado ou não pago' }, { status: 404 });
    }

    // 3. Obter a chave vinculada ao pedido
    const { data: key, error: keyError } = await supabase
      .from('keys')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (keyError || !key) {
      return NextResponse.json({ error: 'Chave não encontrada' }, { status: 404 });
    }

    // 4. Registrar o log de revelação (Auditoria)
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('key_reveal_logs').insert([
      {
        key_id: key.id,
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent
      }
    ]);

    // 5. Retornar a chave (Em produção, aqui descriptografaríamos com a Master Key)
    return NextResponse.json({
      keyCode: key.key_code,
    });

  } catch (error) {
    const err = error as Error;
    console.error('Key Reveal error:', err.message);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
