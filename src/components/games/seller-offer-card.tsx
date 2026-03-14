'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShieldCheck, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface SellerOfferCardProps {
  id: string;
  price: number;
  seller: {
    full_name: string;
    reputation_score: number;
  };
  onBuy: (listingId: string) => void;
}

export function SellerOfferCard({ id, price, seller, onBuy }: SellerOfferCardProps) {
  return (
    <Card className="hover:border-primary transition-colors border-gray-100 dark:border-gray-800">
      <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-lg">{seller.full_name || 'Vendedor Verificado'}</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{parseFloat(seller.reputation_score.toString()).toFixed(1)}</span>
              <span className="mx-1">•</span>
              <span className="text-green-600 dark:text-green-400 font-medium">Entrega Instantânea</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-6">
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">R$ {price.toFixed(2)}</span>
            <p className="text-xs text-muted-foreground">Melhor preço hoje</p>
          </div>
          <Button onClick={() => onBuy(id)} className="gap-2 px-8 py-6 text-lg font-bold shadow-lg shadow-primary/20">
            <ShoppingCart className="h-5 w-5" /> Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
