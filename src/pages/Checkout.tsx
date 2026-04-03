import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutProvider, useCheckout } from '@/contexts/CheckoutContext';
import { useSellQoCart } from '@/integrations/sellqo/CartContext';
import StepIndicator from '@/components/checkout/StepIndicator';
import CustomerStep from '@/components/checkout/CustomerStep';
import AddressStep from '@/components/checkout/AddressStep';
import ShippingStep from '@/components/checkout/ShippingStep';
import PaymentStep from '@/components/checkout/PaymentStep';
import OrderSummary from '@/components/checkout/OrderSummary';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag } from 'lucide-react';

function CheckoutContent() {
  const checkout = useCheckout();
  const { currentStep, startCheckout, getSteps, cartId, goToStep } = checkout;
  const { items, closeCart } = useSellQoCart();
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    closeCart();
  }, [closeCart]);

  useEffect(() => {
    const cartId = localStorage.getItem('sellqo_cart_id');
    if (!cartId || !items.length) {
      navigate('/shop', { replace: true });
      return;
    }
    if (!cartId) {
      startCheckout(cartId).then(ok => {
        if (!ok) navigate('/shop', { replace: true });
        setInitializing(false);
      });
    } else {
      setInitializing(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (initializing) {
    return (
      <main className="min-h-screen bg-background pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-20 h-2 rounded" />
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-20 h-2 rounded" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const steps = getSteps();

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <CustomerStep />;
      case 2: return <AddressStep />;
      case 3: return <ShippingStep />;
      case 4: return <PaymentStep />;
      default: return <CustomerStep />;
    }
  };

  return (
    <main className="min-h-screen bg-background pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-display text-2xl md:text-3xl text-center mb-6 flex items-center justify-center gap-2">
          <ShoppingBag size={24} /> Checkout
        </h1>

        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => { if (step < currentStep) goToStep(step); }}
        />

        <div className="grid md:grid-cols-5 gap-8">
          {/* Mobile: order summary first */}
          <div className="md:col-span-2 md:order-2">
            <OrderSummary />
          </div>

          {/* Form steps */}
          <div className="md:col-span-3 md:order-1">
            {renderStep()}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Checkout() {
  return (
    <CheckoutProvider>
      <CheckoutContent />
    </CheckoutProvider>
  );
}
