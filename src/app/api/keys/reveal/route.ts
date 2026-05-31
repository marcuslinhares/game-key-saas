import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { decrypt } from '@/lib/crypto';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId é obrigatório' }, { status: 400 });
    }

    // 1. Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Verificar se o pedido pertence ao usuário e está pago
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
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

    // 4. Descriptografar a chave usando AES-256-GCM
    let decryptedKey = key.key_code;
    try {
      // Se a chave estiver no formato iv:authTag:ciphertext (criptografada), descriptografa
      if (key.key_code && key.key_code.includes(':')) {
        decryptedKey = decrypt(key.key_code);
      }
      // Caso contrário, assume que é texto plano (migração) e usa direto
    } catch {
      // Se falhar ao descriptografar, retorna o valor armazenado
      console.warn('Falha ao descriptografar chave, retornando valor bruto');
    }

    // 5. Registrar o log de revelação (Auditoria)
    const ip = request.headers.get('x-forwarded-for') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('key_reveal_logs').insert([
      {
        key_id: key.id,
        user_id: user.id,
        ip_address: ip,
        user_agent: userAgent,
      },
    ]);

    // 6. Retornar a chave descriptografada
    return NextResponse.json({
      keyCode: decryptedKey,
    });
  } catch (error) {
    const err = error as Error;
    console.error('Key Reveal error:', err.message);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
