import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { HelpCircle, MessageCircle, BookOpen, Shield } from 'lucide-react';

export default function SuportePage() {
  const faqs = [
    {
      question: 'Como comprar uma chave de jogo?',
      answer: 'Navegue pelo catálogo, escolha o jogo desejado, selecione uma oferta e finalize o pagamento via Pix ou cartão. Após a confirmação, a chave será revelada na sua área de compras.',
    },
    {
      question: 'As chaves são legítimas?',
      answer: 'Sim! Todas as chaves passam por verificação antes de serem listadas. Além disso, oferecemos garantia de 7 dias para qualquer problema com a chave.',
    },
    {
      question: 'Como funciona o pagamento?',
      answer: 'Aceitamos Pix (aprovação instantânea) e cartão de crédito. O pagamento é processado de forma segura e protegida.',
    },
    {
      question: 'Posso vender minhas chaves?',
      answer: 'Sim! Acesse a página "Vender Jogos", crie sua conta de vendedor e comece a anunciar suas chaves com preços competitivos.',
    },
    {
      question: 'Quando recebo o pagamento como vendedor?',
      answer: 'Com o split de pagamento, você recebe via Pix instantaneamente quando a venda é confirmada.',
    },
    {
      question: 'O que fazer se a chave não funcionar?',
      answer: 'Entre em contato conosco pelo formulário abaixo. Nossa equipe irá verificar e, se confirmado o problema, você receberá reembolso integral.',
    },
  ];

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Central de Ajuda</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais frequentes ou entre em contato conosco.
          </p>
        </div>

        {/* Links rápidos */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          <Link href="/contato">
            <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
              <CardContent className="pt-6">
                <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">Contato</h3>
                <p className="text-sm text-muted-foreground">Fale conosco</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/termos">
            <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
              <CardContent className="pt-6">
                <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">Termos de Uso</h3>
                <p className="text-sm text-muted-foreground">Regras da plataforma</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/privacidade">
            <Card className="hover:shadow-md transition-shadow cursor-pointer text-center">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold">Privacidade</h3>
                <p className="text-sm text-muted-foreground">Seus dados protegidos</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Não encontrou o que procurava?</p>
          <Link href="/contato">
            <Button size="lg">Entrar em Contato</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
