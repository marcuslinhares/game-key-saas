'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Package, Clock } from 'lucide-react';

interface StatsCardsProps {
  balanceAvailable: number;
  balancePending: number;
  totalSales: number;
  activeListings: number;
}

export function StatsCards({ balanceAvailable, balancePending, totalSales, activeListings }: StatsCardsProps) {
  const stats = [
    {
      title: 'Saldo Disponível',
      value: `R$ ${balanceAvailable.toFixed(2)}`,
      icon: Wallet,
      description: 'Pronto para saque',
      color: 'text-green-600',
    },
    {
      title: 'Saldo Pendente',
      value: `R$ ${balancePending.toFixed(2)}`,
      icon: Clock,
      description: 'Em período de garantia',
      color: 'text-yellow-600',
    },
    {
      title: 'Vendas Totais',
      value: totalSales.toString(),
      icon: TrendingUp,
      description: 'Pedidos concluídos',
      color: 'text-blue-600',
    },
    {
      title: 'Anúncios Ativos',
      value: activeListings.toString(),
      icon: Package,
      description: 'Itens no catálogo',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-gray-100 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
