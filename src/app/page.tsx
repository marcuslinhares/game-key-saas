'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GameCard } from '@/components/games/game-card';
import { SearchBar } from '@/components/games/search-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function Home() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGames = async () => {
    setLoading(true);
    try {
      // Fetch games with their minimum listing price
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

      // Transform data to include starting price
      const gamesWithPrice = (data || []).map((game: any) => {
        const activeListings = game.listings?.filter((l: any) => l.active && l.stock_count > 0) || [];
        const minPrice = activeListings.length > 0 
          ? Math.min(...activeListings.map((l: any) => l.price)) 
          : null;
        
        return {
          ...game,
          starting_price: minPrice
        };
      });

      setGames(gamesWithPrice);
    } catch (error: any) {
      toast.error('Erro ao carregar jogos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGames();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Sua próxima aventura começa aqui.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Chaves de ativação globais pelos melhores preços, garantidas pela nossa comunidade.
        </p>
        <SearchBar onSearch={setSearchQuery} />
      </header>

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
            <GameCard key={game.id} {...game} />
          ))
        )}
      </div>
    </div>
  );
}
