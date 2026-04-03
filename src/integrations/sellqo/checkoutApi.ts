// Checkout flow API endpoints — separate from main api.ts
import { sellqoFetch } from './client';
import type {
  CheckoutStartResponse,
  CheckoutCompleteResponse,
  CheckoutCustomer,
  CheckoutAddress,
} from './checkoutTypes';

const SUCCESS_URL = `${window.location.origin}/bedankt`;
const CANCEL_URL = `${window.location.origin}/shop`;

export const checkoutFlowAPI = {
  start: (cartId: string) =>
    sellqoFetch<{ success: boolean; data: CheckoutStartResponse }>('/checkout/start', {
      method: 'POST',
      body: JSON.stringify({ cart_id: cartId }),
    }),

  saveCustomer: (orderId: string, customer: CheckoutCustomer) =>
    sellqoFetch<{ success: boolean; data: unknown; error?: { code: string; message: string; fields?: Record<string, string> } }>('/checkout/customer', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, customer }),
    }),

  saveAddress: (orderId: string, shippingAddress: CheckoutAddress, billingSameAsShipping: boolean, billingAddress?: CheckoutAddress | null) =>
    sellqoFetch<{ success: boolean; data: unknown; error?: { code: string; message: string; fields?: Record<string, string> } }>('/checkout/address', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        shipping_address: shippingAddress,
        billing_same_as_shipping: billingSameAsShipping,
        billing_address: billingSameAsShipping ? null : billingAddress,
      }),
    }),

  selectShipping: (orderId: string, shippingMethodId: string) =>
    sellqoFetch<{ success: boolean; data: { shipping_cost: number; total: number } }>('/checkout/shipping', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, shipping_method_id: shippingMethodId }),
    }),

  complete: (orderId: string, paymentMethodId: string) =>
    sellqoFetch<{ success: boolean; data: CheckoutCompleteResponse }>('/checkout/complete', {
      method: 'POST',
      body: JSON.stringify({
        order_id: orderId,
        payment_method_id: paymentMethodId,
        success_url: SUCCESS_URL,
        cancel_url: CANCEL_URL,
      }),
    }),

  applyDiscount: (orderId: string, code: string) =>
    sellqoFetch<{ success: boolean; data: { discount_code: string; discount_amount: number; total: number }; error?: { code: string; message: string } }>('/checkout/discount', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, discount_code: code }),
    }),

  removeDiscount: (orderId: string) =>
    sellqoFetch<{ success: boolean }>('/checkout/discount', {
      method: 'DELETE',
      body: JSON.stringify({ order_id: orderId }),
    }),
};
