'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PaymentSelector } from '@/components/checkout/payment-selector';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChevronLeft, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CheckoutPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = use(params);
  const router = useRouter();
  interface Listing {
    id: string;
    price: number;
    games: {
      title: string;
      cover_image: string;
      platform: string;
    };
    profiles: {
      full_name: string;
    };
    game_id: string;
  }
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            games (
              title,
              cover_image,
              platform
            ),
            profiles:seller_id (
              full_name
            )
          `)
          .eq('id', listingId)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (error) {
        const err = error as Error;
        toast.error('Erro ao carregar detalhes do pedido: ' + (err.message || 'Erro desconhecido'));
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleCheckout = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para realizar a compra.');
        router.push('/login');
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          paymentMethod,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      toast.success('Pedido criado! Redirecionando para o pagamento...');
      // Em produção, aqui redirecionaríamos para o URL de checkout do Stripe ou Mercado Pago
      // window.location.href = result.checkoutUrl;
      
      // Para o MVP, vamos simular o sucesso e ir direto para o dashboard
      router.push('/dashboard/purchases');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao processar checkout: ' + message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8 animate-pulse">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="md:col-span-2 h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const gameData = Array.isArray(listing.games) ? listing.games[0] : listing.games;
  const sellerData = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link href={`/games/${listing.game_id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
        <ChevronLeft className="h-5 w-5" /> Cancelar e Voltar
      </Link>

      <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentSelector value={paymentMethod} onValueChange={setPaymentMethod} />
            </CardContent>
          </Card>

          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 rounded-lg">
            <ShieldCheck className="h-10 w-10 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900 dark:text-green-300">Sua compra está protegida</p>
              <p className="text-sm text-green-800/80 dark:text-green-400/80">
                O pagamento só será liberado ao vendedor após você receber e validar sua chave.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="h-20 w-16 relative rounded-md overflow-hidden bg-gray-100 shrink-0">
                  {gameData?.cover_image && (
                    <Image src={gameData.cover_image} alt={gameData.title} fill className="object-cover" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm line-clamp-2">{gameData?.title}</h4>
                  <p className="text-xs text-muted-foreground">{gameData?.platform}</p>
                  <p className="text-xs text-muted-foreground">Vendedor: {sellerData?.full_name}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>Preço do item</span>
                  <span>R$ {parseFloat(listing.price.toString()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de serviço</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-extrabold text-primary">
                  R$ {parseFloat(listing.price.toString()).toFixed(2)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                onClick={handleCheckout} 
                className="w-full h-14 text-lg font-bold gap-2" 
                disabled={processing}
              >
                {processing ? 'Processando...' : (
                  <>
                    <Lock className="h-5 w-5" /> Finalizar Pedido
                  </>
                )}
              </Button>
              <p className="text-[10px] text-center text-muted-foreground">
                Ao clicar em &quot;Finalizar Pedido&quot;, você concorda com nossos Termos de Serviço e Política de Reembolso.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
