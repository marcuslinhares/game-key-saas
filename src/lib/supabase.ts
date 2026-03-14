import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Durante o build do Next.js ou em ambiente de CI sem segredos,
// evitamos instanciar o cliente real se a URL for inválida.
const isInvalidUrl = !supabaseUrl || !supabaseUrl.startsWith('http');

export const supabase = isInvalidUrl 
  ? ({} as unknown as ReturnType<typeof createClient>) // Mock minimal para o build não quebrar
  : createClient(supabaseUrl!, supabaseAnonKey!);
