'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SellerOfferCard } from '@/components/games/seller-offer-card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Image from 'next/image';
import { ChevronLeft, Info, ShieldCheck, Globe } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameAndListings = async () => {
      try {
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', id)
          .single();

        if (gameError) throw gameError;
        setGame(gameData);

        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select(`
            *,
            profiles:seller_id (
              full_name,
              reputation_score
            )
          `)
          .eq('game_id', id)
          .eq('active', true)
          .gt('stock_count', 0)
          .order('price', { ascending: true });

        if (listingError) throw listingError;
        setListings(listingData || []);

      } catch (error: any) {
        toast.error('Erro ao carregar detalhes: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameAndListings();
  }, [id]);

  const handleBuy = (listingId: string) => {
    // Para o MVP, redirecionamos para o checkout
    router.push(`/checkout/${listingId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="flex flex-col md:flex-row gap-12">
          <Skeleton className="aspect-[3/4] w-full max-w-[400px] rounded-2xl" />
          <div className="flex-grow space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Jogo não encontrado.</h2>
        <Link href="/">
          <Button>Voltar para o catálogo</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
        <ChevronLeft className="h-5 w-5" /> Voltar para o Catálogo
      </Link>

      <div className="flex flex-col md:flex-row gap-12 mb-16">
        <div className="w-full max-w-[400px] aspect-[3/4] relative overflow-hidden rounded-2xl shadow-2xl bg-gray-100 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          {game.cover_image ? (
            <Image 
              src={game.cover_image} 
              alt={game.title} 
              fill 
              className="object-cover" 
              priority 
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Sem Capa</div>
          )}
        </div>

        <div className="flex-grow space-y-6">
          <div className="space-y-2">
            <div className="flex gap-2 mb-2">
              <Badge variant="secondary" className="px-3 py-1">{game.platform}</Badge>
              <Badge variant="outline" className="px-3 py-1 flex gap-1 items-center">
                <Globe className="h-3 w-3" /> {game.region_lock}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">{game.title}</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed">
            {game.description || 'Nenhuma descrição disponível para este jogo.'}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl flex gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg h-fit">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300">Atenção à região</h4>
              <p className="text-sm text-blue-800/80 dark:text-blue-400/80">
                Certifique-se de que sua conta {game.platform} é compatível com a região <strong>{game.region_lock}</strong> antes de comprar.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold">Ofertas Disponíveis ({listings.length})</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-500" /> Vendedores Verificados
          </div>
        </div>

        <div className="grid gap-4">
          {listings.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-medium text-muted-foreground mb-4">Nenhuma oferta disponível no momento.</h3>
              <p className="text-muted-foreground mb-6">Seja o primeiro a vender este jogo!</p>
              <Link href="/vender">
                <Button variant="outline">Anunciar este Jogo</Button>
              </Link>
            </div>
          ) : (
            listings.map((listing) => (
              <SellerOfferCard 
                key={listing.id} 
                id={listing.id}
                price={parseFloat(listing.price.toString())}
                seller={listing.profiles}
                onBuy={handleBuy}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
