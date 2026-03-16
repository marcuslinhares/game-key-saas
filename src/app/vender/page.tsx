'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, Store, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';

export default function VenderPage() {
  const steps = [
    {
      number: '1',
      title: 'Cadastre-se',
      description: 'Crie sua conta gratuitamente e valide sua identidade para começar a vender.',
    },
    {
      number: '2',
      title: 'Anuncie suas chaves',
      description: 'Cadastre suas chaves de jogos com preço e estoque em nosso catálogo.',
    },
    {
      number: '3',
      title: 'Receba via Pix',
      description: 'Venda concluída, o dinheiro cai na hora direto na sua conta.',
    },
  ];

  const benefits = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Split de Pagamento',
      description: 'Receba seus pagamentos automaticamente via Pix na hora da venda.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Proteção contra Fraudes',
      description: 'Sistema de verificação automática protege você contra compras fraudulentas.',
    },
    {
      icon: <Store className="h-8 w-8 text-primary" />,
      title: 'Sua Própria Loja',
      description: 'Painel completo para gerenciar seus anúncios, vendas e estatísticas.',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: 'Menores Taxas',
      description: 'Taxas competitivas do mercado para maximizar seu lucro.',
    },
  ];

  const features = [
    'Catálogo completo de jogos',
    'Notificações em tempo real',
    'Histórico detalhado de vendas',
    'Suporte prioritário',
    'Dashboard com métricas',
    'Integração com Pix',
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Venda suas chaves de jogos
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Transforme chaves paradas em dinheiro. Junte-se a milhares de vendedores
            no marketplace mais confiável do Brasil.
          </p>
          <Link href="/listings/create">
            <Button size="lg" variant="secondary" className="font-bold px-10 h-14 text-lg gap-2">
              Começar a Vender <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Por que vender no GameKey?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4">{benefit.icon}</div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">Tudo que você precisa para vender</h2>
              <p className="text-muted-foreground mb-8">
                Nossa plataforma oferece todas as ferramentas necessárias para você
                gerenciar suas vendas de forma simples e eficiente.
              </p>
              <ul className="space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Painel do Vendedor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Saldo Disponível</span>
                    <span className="font-bold text-green-500">R$ 1.234,56</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Vendas este mês</span>
                    <span className="font-bold">47</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span className="text-sm">Anúncios Ativos</span>
                    <span className="font-bold">12</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto mb-8">
            Crie seu primeiro anúncio em menos de 2 minutos e comece a vender hoje mesmo.
          </p>
          <Link href="/listings/create">
            <Button size="lg" variant="secondary" className="font-bold px-10 h-14 text-lg gap-2">
              Criar Primeiro Anúncio <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
