import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Durante o build do Next.js ou em ambiente de CI sem segredos,
// evitamos instanciar o cliente real se a URL for inválida.
const isInvalidUrl = !supabaseUrl || !supabaseUrl.startsWith('http');

/**
 * Cria um objeto Proxy que aceita qualquer chamada de método ou propriedade,
 * retornando a si mesmo para permitir encadeamento, exceto quando
 * é tratado como uma Promise (ex: await).
 */
const createRecursiveMock = (defaultResponse: unknown = { data: null, error: null }) => {
  const proxyHandler: ProxyHandler<() => void> = {
    get(target, prop) {
      // Se for .then, estamos sendo 'awaited'
      if (prop === 'then') {
        return (resolve: (val: unknown) => void) => resolve(defaultResponse);
      }
      
      // Métodos específicos que precisam retornar algo diferente de si mesmo
      if (prop === 'auth') {
        return createAuthMock();
      }

      if (prop === 'storage') {
        return { from: () => createRecursiveMock({ data: { path: '' }, error: null }) };
      }

      // Por padrão, retorna uma função que retorna o próprio proxy (encadeamento)
      return () => new Proxy(() => {}, proxyHandler);
    },
    // Se for chamado como função diretamente
    apply() {
      return new Proxy(() => {}, proxyHandler);
    }
  };

  return new Proxy(() => {}, proxyHandler);
};

const createAuthMock = () => {
  return {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: {}, error: new Error('Supabase não configurado') }),
    signUp: async () => ({ data: {}, error: new Error('Supabase não configurado') }),
    signOut: async () => ({ error: null }),
  };
};

export const supabase = isInvalidUrl 
  ? (createRecursiveMock({ data: [], error: null }) as unknown as ReturnType<typeof createClient>)
  : createClient(supabaseUrl!, supabaseAnonKey!);
