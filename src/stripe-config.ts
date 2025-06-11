export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RYPJGPrW7kCFnr2dMv9Q0OP',
    name: 'VOLT.COIN',
    description: 'Thanks for buying VoltAI Volt coin',
    mode: 'payment',
  },
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};