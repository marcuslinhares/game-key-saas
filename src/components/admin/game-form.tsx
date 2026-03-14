'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface GameFormProps {
  initialData?: {
    id?: string;
    title?: string;
    description?: string;
    platform?: string;
    region_lock?: string;
    cover_image?: string;
  };
}

export function GameForm({ initialData }: GameFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    platform: initialData?.platform || 'Steam',
    region_lock: initialData?.region_lock || 'Global',
    cover_image: initialData?.cover_image || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData?.id) {
        const { error } = await supabase.from('games').update(formData).eq('id', initialData.id);
        if (error) throw error;
        toast.success('Jogo atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('games').insert([formData]);
        if (error) throw error;
        toast.success('Jogo cadastrado com sucesso!');
      }
      router.push('/admin/games');
      router.refresh();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="title">Título do Jogo</Label>
        <Input 
          id="title" 
          required 
          value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea 
          id="description" 
          value={formData.description} 
          onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Plataforma</Label>
          <Select 
            value={formData.platform} 
            onValueChange={(v) => setFormData({ ...formData, platform: v || '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Steam">Steam</SelectItem>
              <SelectItem value="Xbox">Xbox</SelectItem>
              <SelectItem value="PlayStation">PlayStation</SelectItem>
              <SelectItem value="Epic Games">Epic Games</SelectItem>
              <SelectItem value="GOG">GOG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Região (Lock)</Label>
          <Select 
            value={formData.region_lock} 
            onValueChange={(v) => setFormData({ ...formData, region_lock: v || '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Global">Global</SelectItem>
              <SelectItem value="Latam">Latam (Brasil/América Latina)</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="USA">USA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover_image">URL da Imagem de Capa</Label>
        <Input 
          id="cover_image" 
          type="url" 
          placeholder="https://exemplo.com/capa.jpg" 
          value={formData.cover_image} 
          onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })} 
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : initialData?.id ? 'Atualizar Jogo' : 'Cadastrar Jogo'}
      </Button>
    </form>
  );
}
