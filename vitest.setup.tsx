import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mocks exportáveis
export const mockSupabaseAuth = {
  getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '1' } }, error: null })),
  getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: '1' } } }, error: null })),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  signInWithPassword: vi.fn(() => Promise.resolve({ data: { user: { id: '1' } }, error: null })),
  signUp: vi.fn(() => Promise.resolve({ data: { user: { id: '1' } }, error: null })),
  signOut: vi.fn(() => Promise.resolve({ error: null })),
};

const createMockQueryBuilder = (singleData: any = null, arrayData: any[] = []) => {
  const queryBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => Promise.resolve({ data: singleData, error: null })),
    order: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    // Por padrão, resolve como array para .then() se não for .single()
    then: vi.fn((resolve) => resolve({ data: arrayData, error: null })),
  };
  return queryBuilder;
};

export const mockSupabaseFrom = vi.fn((table) => {
  if (table === 'listings') {
    const data = { 
      id: '1', 
      price: 100, 
      games: { title: 'Mock Game', cover_image: '/test.jpg' },
      profiles: { full_name: 'Seller Test' },
      active: true
    };
    return createMockQueryBuilder(data, [data]);
  }
  if (table === 'games') {
    const data = { id: '1', title: 'Mock Game', platform: 'PC', region_lock: 'Global', cover_image: '/test.jpg' };
    return createMockQueryBuilder(data, [data]);
  }
  if (table === 'profiles') {
    const data = { id: '1', full_name: 'User Test', balance_available: '100', balance_pending: '50' };
    return createMockQueryBuilder(data, [data]);
  }
  return createMockQueryBuilder(null, []);
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: mockSupabaseAuth,
    from: mockSupabaseFrom,
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

vi.mock('lucide-react', async () => {
  const actual = await vi.importActual('lucide-react');
  const mockIcons = Object.keys(actual as any).reduce((acc: any, key) => {
    acc[key] = (props: any) => <svg data-testid={`icon-${key}`} {...props} />;
    return acc;
  }, {});
  return mockIcons;
});
