'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Gamepad2, ShoppingCart, User, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Gamepad2 className="h-8 w-8" />
          <span>GameKey Market</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Catálogo</Link>
          <Link href="/vender" className="text-sm font-medium hover:text-primary transition-colors">Vender Jogos</Link>
          <Link href="/suporte" className="text-sm font-medium hover:text-primary transition-colors">Suporte</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" /> Entrar
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
