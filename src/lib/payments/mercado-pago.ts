export async function createPixPayment(amount: number, description: string) {
  // Simulação de chamada para o Mercado Pago
  console.log(`Criando pagamento Pix de R$ ${amount}: ${description}`);
  
  return {
    id: `mp_${Math.random().toString(36).substr(2, 9)}`,
    qr_code: "00020101021226830014BR.GOV.BCB.PIX0161mercadopago@exemplo.com.br520400005303986540510.005802BR5925GameKey Market6009SAO PAULO62070503***6304E229",
    qr_code_base64: "iVBORw0KGgoAAAANSUhEUgA...",
    status: "pending",
  };
}
