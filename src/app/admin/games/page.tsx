'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Game {
  id: string;
  title: string;
  platform: string;
  region_lock: string;
  created_at: string;
}

export default function AdminGamesPage() {
const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) toast.error(error.message);
    else setGames((data as Game[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchGames();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependência vazia para rodar apenas no mount

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este jogo?')) return;
    
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Jogo excluído!');
      fetchGames();
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Catálogo de Jogos</h1>
        <Link href="/admin/games/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Jogo
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Região</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>
            ) : games.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center">Nenhum jogo cadastrado.</TableCell></TableRow>
            ) : games.map((game) => (
              <TableRow key={game.id}>
                <TableCell className="font-medium">{game.title}</TableCell>
                <TableCell>{game.platform}</TableCell>
                <TableCell>{game.region_lock}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/games/edit/${game.id}`}>
                    <Button variant="outline" size="icon"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(game.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
