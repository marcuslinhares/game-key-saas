'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function ListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    game_id: '',
    price: '',
    stock_count: '1'
  });

  useEffect(() => {
    const fetchGames = async () => {
      const { data, error } = await supabase.from('games').select('id, title');
      if (error) toast.error('Erro ao carregar jogos');
      else setGames(data || []);
    };
    fetchGames();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Você precisa estar logado para criar um anúncio.');

      const { error } = await supabase.from('listings').insert([
        { 
          game_id: formData.game_id, 
          price: parseFloat(formData.price), 
          stock_count: parseInt(formData.stock_count),
          seller_id: user.id
        }
      ]);

      if (error) throw error;
      toast.success('Anúncio criado com sucesso!');
      router.push('/dashboard/seller');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      <div className="space-y-2">
        <Label>Selecionar Jogo</Label>
        <Select 
          value={formData.game_id} 
          onValueChange={(v) => setFormData({ ...formData, game_id: v || '' })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Escolha um jogo do catálogo" />
          </SelectTrigger>
          <SelectContent>
            {games.map((game) => (
              <SelectItem key={game.id} value={game.id}>{game.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01" 
            required 
            placeholder="0,00"
            value={formData.price} 
            onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Estoque Inicial</Label>
          <Input 
            id="stock" 
            type="number" 
            required 
            value={formData.stock_count} 
            onChange={(e) => setFormData({ ...formData, stock_count: e.target.value })} 
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !formData.game_id}>
        {loading ? 'Criando Anúncio...' : 'Publicar Anúncio'}
      </Button>
    </form>
  );
}
