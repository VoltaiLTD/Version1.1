import React from 'react';
import { stripeProducts } from '../../stripe-config';
import StripeProductCard from './StripeProductCard';

const StripeProductsSection: React.FC = () => {
  if (stripeProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">Available Products</h2>
        <p className="text-neutral-600">Purchase VOLT.COIN and other premium features</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stripeProducts.map((product) => (
          <StripeProductCard key={product.priceId} product={product} />
        ))}
      </div>
    </div>
  );
};

export default StripeProductsSection;