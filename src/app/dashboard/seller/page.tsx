'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsCards } from '@/components/seller/stats-cards';
import { Plus, LayoutDashboard, Package, Edit, Power, PowerOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SellerDashboardPage() {
  interface Profile {
  balance_available: string;
  balance_pending: string;
}
interface Listing {
  id: string;
  price: string;
  stock_count: number;
  active: boolean;
  games: {
    title: string;
    platform: string;
  };
}
const [profile, setProfile] = useState<Profile | null>(null);
const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile for stats
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setProfile(profileData);

      // 2. Fetch Listings
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select(`
          *,
          games (
            title,
            platform
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (listingError) throw listingError;
      setListings(listingData || []);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao carregar painel: ' + message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('listings')
      .update({ active: !currentStatus })
      .eq('id', id);
    
    if (error) toast.error('Erro ao atualizar status');
    else {
      toast.success(currentStatus ? 'Anúncio pausado' : 'Anúncio ativado');
      fetchData();
    }
  };

  if (loading) {
    return <div className="container mx-auto p-8">Carregando painel do vendedor...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8" /> Painel do Vendedor
          </h1>
          <p className="text-muted-foreground">Gerencie seus lucros e anúncios de chaves.</p>
        </div>
        <Link href="/listings/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Anunciar Jogo
          </Button>
        </Link>
      </div>

      <StatsCards 
        balanceAvailable={parseFloat(profile?.balance_available || '0')}
        balancePending={parseFloat(profile?.balance_pending || '0')}
        totalSales={0} // Em produção, aqui viria o COUNT de orders vendidas
        activeListings={listings.filter(l => l.active).length}
      />

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" /> Seus Anúncios
        </h2>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogo</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Você ainda não tem anúncios. Comece a vender agora!
                  </TableCell>
                </TableRow>
              ) : listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.games.title}</TableCell>
                  <TableCell>{listing.games.platform}</TableCell>
                  <TableCell>R$ {parseFloat(listing.price).toFixed(2)}</TableCell>
                  <TableCell>{listing.stock_count}</TableCell>
                  <TableCell>
                    {listing.active ? (
                      <span className="text-green-600 dark:text-green-400 text-xs font-bold uppercase">Ativo</span>
                    ) : (
                      <span className="text-red-500 text-xs font-bold uppercase">Pausado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleStatus(listing.id, listing.active)}
                      title={listing.active ? 'Pausar Anúncio' : 'Ativar Anúncio'}
                    >
                      {listing.active ? <PowerOff className="h-4 w-4 text-red-500" /> : <Power className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Link href={`/admin/listings/edit/${listing.id}`}>
                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
