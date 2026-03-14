'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KeyReveal } from '@/components/purchases/key-reveal';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Image from 'next/image';
import { ShoppingBag, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PurchasesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            listings (
              games (
                title,
                cover_image,
                platform
              )
            )
          `)
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error: any) {
        toast.error('Erro ao carregar pedidos: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" /> Minhas Compras
          </h1>
          <p className="text-muted-foreground">Acesse suas chaves de ativação e histórico de pedidos.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : orders.length === 0 ? (
          <Card className="border-dashed py-12 text-center bg-gray-50 dark:bg-gray-900/50">
            <CardContent className="space-y-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
              <h3 className="text-xl font-medium text-muted-foreground">Você ainda não realizou nenhuma compra.</h3>
              <Link href="/">
                <Button variant="outline" className="mt-4">Explorar Catálogo</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-gray-100 dark:border-gray-800">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-32 bg-gray-100 dark:bg-gray-900 relative aspect-square md:aspect-auto">
                    {order.listings.games.cover_image && (
                      <Image 
                        src={order.listings.games.cover_image} 
                        alt={order.listings.games.title} 
                        fill 
                        className="object-cover" 
                      />
                    )}
                  </div>
                  
                  <div className="flex-grow p-6 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-4">
                      <div>
                        <Badge variant="outline" className="mb-2">{order.listings.games.platform}</Badge>
                        <h3 className="text-xl font-bold">{order.listings.games.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" /> {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            ID: {order.id.split('-')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium">
                        {order.status === 'paid' ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Pagamento Confirmado
                          </span>
                        ) : order.status === 'pending' ? (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" /> Pagamento Pendente
                          </span>
                        ) : (
                          <span className="text-gray-500 uppercase">{order.status}</span>
                        )}
                      </div>
                    </div>

                    <div className="w-full md:w-64 space-y-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 border-gray-100 dark:border-gray-800">
                      {order.status === 'paid' ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold mb-2">Sua Chave:</p>
                          <KeyReveal orderId={order.id} gameTitle={order.listings.games.title} />
                        </div>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Aguardando confirmação do pagamento para liberar a chave.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
