export async function createStripeSession(amount: number, description: string) {
  // Simulação de chamada para o Stripe
  console.log(`Criando sessão Stripe de R$ ${amount}: ${description}`);
  
  return {
    id: `cs_test_${Math.random().toString(36).substr(2, 9)}`,
    url: "https://checkout.stripe.com/pay/cs_test_simulated",
    status: "pending",
  };
}
