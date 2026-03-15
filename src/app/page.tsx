'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateStartingPrice, type Listing } from '@/lib/prices';
import { GameCard } from '@/components/games/game-card';
import { SearchBar } from '@/components/games/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Store, ShieldCheck, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

interface Game {
  id: string;
  title: string;
  platform: string;
  region_lock: string;
  cover_image?: string;
  listings?: Listing[];
  starting_price?: number | null;
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGames = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          listings (
            price,
            active,
            stock_count
          )
        `)
        .ilike('title', `%${searchQuery}%`);

      if (error) throw error;

      const gamesWithPrice = (data || []).map((item: any) => {
        return {
          id: item.id,
          title: item.title,
          platform: item.platform,
          region_lock: item.region_lock,
          cover_image: item.cover_image,
          starting_price: calculateStartingPrice(item.listings)
        } as Game;
      });

      setGames(gamesWithPrice);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao carregar jogos: ' + message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGames();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchGames]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-20 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Sua próxima aventura <span className="text-primary">começa aqui.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
            O marketplace de chaves de jogos mais confiável. Ativação global, preços locais e entrega instantânea.
          </p>
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </section>

      {/* Grid de Jogos */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Destaques do Catálogo</h2>
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-green-500" /> 100% Protegido
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : games.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <h3 className="text-xl font-medium text-muted-foreground">Nenhum jogo encontrado.</h3>
            </div>
          ) : (
            games.map((game) => (
              <GameCard 
                key={game.id} 
                id={game.id}
                title={game.title}
                platform={game.platform}
                region_lock={game.region_lock}
                cover_image={game.cover_image}
                starting_price={game.starting_price ?? undefined}
              />
            ))
          )}
        </div>
      </section>

      {/* Venda Conosco CTA */}
      <section className="bg-primary text-primary-foreground py-20 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Transforme suas chaves em dinheiro.</h2>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                Junte-se a milhares de vendedores em nosso marketplace. Oferecemos as menores taxas do mercado, split de pagamento automático e segurança total contra fraudes.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><Zap className="h-5 w-5" /></div>
                  <div><h4 className="font-bold">Split de Pagamento</h4><p className="text-sm opacity-80">Receba via Pix na hora</p></div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg"><Store className="h-5 w-5" /></div>
                  <div><h4 className="font-bold">Sua Própria Loja</h4><p className="text-sm opacity-80">Painel completo de gestão</p></div>
                </div>
              </div>
              <Link href="/vender">
                <Button size="lg" variant="secondary" className="font-bold px-10 h-14 text-lg">
                  Começar a Vender
                </Button>
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hidden md:block">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center font-bold">1</div>
                  <p className="font-medium">Cadastre-se e valide sua identidade.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center font-bold">2</div>
                  <p className="font-medium">Anuncie suas chaves com nosso catálogo.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center font-bold">3</div>
                  <p className="font-medium">Venda e receba o dinheiro com segurança.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl opacity-50">
              <Globe className="h-6 w-6" /> GameKey Market
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="/termos" className="hover:text-primary transition-colors">Termos</Link>
              <Link href="/privacidade" className="hover:text-primary transition-colors">Privacidade</Link>
              <Link href="/contato" className="hover:text-primary transition-colors">Contato</Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 GameKey Market. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
