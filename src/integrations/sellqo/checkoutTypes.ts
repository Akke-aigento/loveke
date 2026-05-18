// Checkout flow types — separate from main types to keep files focused

import type { CartItem } from './types';

export interface CheckoutStartResponse {
  items: CartItem[];
  available_payment_methods: PaymentMethod[];
  available_shipping_methods: ShippingMethod[];
  subtotal: number;
  currency: string;
}

export interface PaymentMethod {
  method: string;
  group: 'direct' | 'later' | 'transfer';
  name: string;
  description?: string;
  fee_cents?: number;
  available: boolean;
  reason_unavailable?: string | null;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  estimated_delivery?: string;
}

export interface BankDetails {
  iban: string;
  account_holder: string;
  reference: string;
  bank_name?: string;
}

export interface QRData {
  image_url?: string;
  payload?: string;
}

export interface CheckoutCompleteResponse {
  payment_type: 'redirect' | 'manual' | 'qr';
  order_number: string;
  total: number;
  currency: string;
  checkout_url?: string;
  bank_details?: BankDetails;
  qr_data?: QRData;
}

export interface CheckoutCustomer {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface CheckoutAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
  company?: string;
}

export interface CheckoutState {
  cartId: string | null;
  items: CartItem[];
  availablePaymentMethods: PaymentMethod[];
  availableShippingMethods: ShippingMethod[];
  customer: CheckoutCustomer | null;
  shippingAddress: CheckoutAddress | null;
  billingAddress: CheckoutAddress | null;
  billingSameAsShipping: boolean;
  selectedShippingMethod: string | null;
  selectedPaymentMethod: string | null;
  subtotal: number;
  shippingCost: number;
  discount: { code: string; amount: number } | null;
  total: number;
  currency: string;
  currentStep: number;
  isLoading: boolean;
  errors: Record<string, string>;
  fieldErrors: Record<string, string>;
}
