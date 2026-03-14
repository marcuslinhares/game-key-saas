'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface GameCardProps {
  id: string;
  title: string;
  platform: string;
  region_lock: string;
  cover_image?: string;
  starting_price?: number;
}

export function GameCard({ id, title, platform, region_lock, cover_image, starting_price }: GameCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col group hover:shadow-lg transition-shadow duration-300 border-gray-100 dark:border-gray-800">
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
        {cover_image ? (
          <Image 
            src={cover_image} 
            alt={title} 
            fill 
            className="object-cover group-hover:scale-105 transition-transform duration-300" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sem Imagem
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="secondary" className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
            {platform}
          </Badge>
          <Badge variant="outline" className="bg-black/50 text-white border-none backdrop-blur-sm">
            {region_lock}
          </Badge>
        </div>
      </div>
      <CardHeader className="p-4 pb-0 flex-grow">
        <CardTitle className="text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardFooter className="p-4 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">A partir de</span>
          <span className="text-xl font-bold">
            {starting_price ? `R$ ${starting_price.toFixed(2)}` : 'Indisponível'}
          </span>
        </div>
        <Link href={`/games/${id}`}>
          <Button size="sm">Ver Ofertas</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
