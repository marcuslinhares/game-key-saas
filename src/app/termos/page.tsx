import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermosPage() {
  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Catálogo
        </Link>

        <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e utilizar a plataforma GameKey Market, você concorda em cumprir e estar
              vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes
              termos, não deverá utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O GameKey Market é uma plataforma de marketplace que permite a compra e venda de chaves
              digitais de jogos (game keys). Atuamos como intermediários entre compradores e vendedores,
              facilitando transações seguras.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar nossos serviços, você deve criar uma conta fornecendo informações precisas
              e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas
              as atividades realizadas em sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Compras</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao realizar uma compra, você concorda em pagar o valor anunciado pelo vendedor mais a
              taxa de serviço do GameKey Market. As chaves são entregues digitalmente após a confirmação
              do pagamento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Vendas</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vendedores devem garantir que as chaves anunciadas são legítimas e funcionais. O descumprimento
              desta regra resultará em suspensão da conta e possível reembolso ao comprador. O pagamento ao
              vendedor é processado via split de pagamento após confirmação da compra.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Política de Reembolso</h2>
            <p className="text-muted-foreground leading-relaxed">
              Oferecemos reembolso integral em caso de chave não funcional, desde que a solicitação seja
              feita em até 7 dias após a compra. O comprador deve fornecer evidências do problema.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Proibições</h2>
            <p className="text-muted-foreground leading-relaxed">
              É proibido utilizar a plataforma para: vender chaves obtidas de forma ilegal; realizar
              atividades fraudulentas; violar direitos de propriedade intelectual; ou qualquer atividade
              que viole leis aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O GameKey Market não se responsabiliza por danos indiretos, incidentais ou consequentes
              decorrentes do uso da plataforma. Nossa responsabilidade máxima é limitada ao valor da
              transação em questão.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Modificações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações serão
              comunicadas através da plataforma e entrarão em vigor imediatamente após a publicação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas a estes termos, entre em contato através da nossa{' '}
              <Link href="/contato" className="text-primary hover:underline">página de contato</Link>.
            </p>
          </section>

          <p className="text-sm text-muted-foreground mt-8">
            Última atualização: Março de 2026
          </p>
        </div>
      </div>
    </main>
  );
}
