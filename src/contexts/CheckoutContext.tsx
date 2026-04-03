import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { checkoutFlowAPI } from '@/integrations/sellqo/checkoutApi';
import type {
  CheckoutState,
  CheckoutCustomer,
  CheckoutAddress,
} from '@/integrations/sellqo/checkoutTypes';

interface CheckoutContextType extends CheckoutState {
  startCheckout: (cartId: string) => Promise<boolean>;
  saveCustomerAndAddress: (customer: CheckoutCustomer, shipping: CheckoutAddress, billingSame: boolean, billing?: CheckoutAddress | null) => Promise<boolean>;
  saveCustomer: (customer: CheckoutCustomer) => Promise<boolean>;
  saveAddress: (shipping: CheckoutAddress, billingSame: boolean, billing?: CheckoutAddress | null) => Promise<boolean>;
  selectShipping: (methodId: string) => Promise<boolean>;
  completeCheckout: (paymentMethodId: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => Promise<void>;
  goToStep: (step: number) => void;
  goBack: () => void;
  getSteps: () => { id: number; label: string }[];
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

const initialState: CheckoutState = {
  cartId: null,
  items: [],
  availablePaymentMethods: [],
  availableShippingMethods: [],
  customer: null,
  shippingAddress: null,
  billingAddress: null,
  billingSameAsShipping: true,
  selectedShippingMethod: null,
  selectedPaymentMethod: null,
  subtotal: 0,
  shippingCost: 0,
  discount: null,
  total: 0,
  currency: 'EUR',
  currentStep: 1,
  isLoading: false,
  errors: {},
  fieldErrors: {},
};

function extractData<T>(response: unknown): T {
  if (!response || typeof response !== 'object') return response as T;
  const r = response as Record<string, unknown>;
  if (r.data && typeof r.data === 'object') return r.data as T;
  return response as T;
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setLoading = (isLoading: boolean) => setState(s => ({ ...s, isLoading }));
  const setFieldErrors = (fieldErrors: Record<string, string>) => setState(s => ({ ...s, fieldErrors }));

  const handleApiError = useCallback((result: any): boolean => {
    if (result?.success === false || result?.error) {
      const err = result.error || {};
      if (err.code === 'VALIDATION_ERROR' && err.fields) {
        setFieldErrors(err.fields);
      } else {
        toast.error(err.message || 'Er ging iets mis. Probeer opnieuw.');
      }
      return true;
    }
    return false;
  }, []);

  const startCheckout = useCallback(async (cartId: string): Promise<boolean> => {
    setLoading(true);
    setFieldErrors({});
    try {
      const result = await checkoutFlowAPI.start(cartId);
      if (handleApiError(result)) { setLoading(false); return false; }
      const data = extractData<any>(result);
      setState(s => ({
        ...s,
        cartId,
        items: data.items || [],
        availablePaymentMethods: data.available_payment_methods || [],
        availableShippingMethods: data.available_shipping_methods || [],
        subtotal: Number(data.subtotal) || 0,
        total: Number(data.subtotal) || 0,
        currency: data.currency || 'EUR',
        currentStep: 1,
        isLoading: false,
        errors: {},
        fieldErrors: {},
      }));
      return true;
    } catch (e) {
      toast.error('Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [handleApiError]);

  const saveCustomer = useCallback(async (customer: CheckoutCustomer): Promise<boolean> => {
    if (!state.cartId) return false;
    setLoading(true);
    setFieldErrors({});
    try {
      const result = await checkoutFlowAPI.saveCustomer(state.cartId, customer);
      if (handleApiError(result)) { setLoading(false); return false; }
      setState(s => ({ ...s, customer, isLoading: false, fieldErrors: {} }));
      return true;
    } catch {
      toast.error('Verbinding onderbroken. Probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [state.cartId, handleApiError]);

  const saveAddress = useCallback(async (shipping: CheckoutAddress, billingSame: boolean, billing?: CheckoutAddress | null): Promise<boolean> => {
    if (!state.cartId) return false;
    setLoading(true);
    setFieldErrors({});
    try {
      const result = await checkoutFlowAPI.saveAddress(state.cartId, shipping, billingSame, billing);
      if (handleApiError(result)) { setLoading(false); return false; }
      setState(s => ({
        ...s,
        shippingAddress: shipping,
        billingAddress: billingSame ? null : (billing || null),
        billingSameAsShipping: billingSame,
        isLoading: false,
        fieldErrors: {},
      }));
      return true;
    } catch {
      toast.error('Verbinding onderbroken. Probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [state.cartId, handleApiError]);

  // Combined: save customer + address + auto-select shipping → go to payment
  const saveCustomerAndAddress = useCallback(async (
    customer: CheckoutCustomer,
    shipping: CheckoutAddress,
    billingSame: boolean,
    billing?: CheckoutAddress | null,
  ): Promise<boolean> => {
    if (!state.cartId) return false;
    setLoading(true);
    setFieldErrors({});

    try {
      // 1. Save customer
      const custResult = await checkoutFlowAPI.saveCustomer(state.cartId, customer);
      if (handleApiError(custResult)) { setLoading(false); return false; }

      // 2. Save address
      const addrResult = await checkoutFlowAPI.saveAddress(state.cartId, shipping, billingSame, billing);
      if (handleApiError(addrResult)) { setLoading(false); return false; }

      // 3. Auto-select shipping if only 1 method
      let shippingCost = 0;
      let newTotal = state.subtotal;
      let selectedShippingMethod: string | null = null;

      if (state.availableShippingMethods.length === 1) {
        const method = state.availableShippingMethods[0];
        const shippingResult = await checkoutFlowAPI.selectShipping(state.cartId, method.id);
        const shippingData = extractData<any>(shippingResult);
        shippingCost = Number(shippingData?.shipping_cost) || Number(method.price) || 0;
        newTotal = Number(shippingData?.total) || (state.subtotal + shippingCost);
        selectedShippingMethod = method.id;
      } else if (state.availableShippingMethods.length > 1) {
        // Multiple shipping methods — show shipping step (step 3) before payment
        setState(s => ({
          ...s,
          customer,
          shippingAddress: shipping,
          billingAddress: billingSame ? null : (billing || null),
          billingSameAsShipping: billingSame,
          currentStep: 3,
          isLoading: false,
          fieldErrors: {},
        }));
        return true;
      }

      setState(s => ({
        ...s,
        customer,
        shippingAddress: shipping,
        billingAddress: billingSame ? null : (billing || null),
        billingSameAsShipping: billingSame,
        selectedShippingMethod,
        shippingCost,
        total: newTotal,
        currentStep: 2, // Go to payment
        isLoading: false,
        fieldErrors: {},
      }));
      return true;
    } catch {
      toast.error('Verbinding onderbroken. Probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [state.cartId, state.availableShippingMethods, state.subtotal, handleApiError]);

  const selectShipping = useCallback(async (methodId: string): Promise<boolean> => {
    if (!state.cartId) return false;
    setLoading(true);
    try {
      const result = await checkoutFlowAPI.selectShipping(state.cartId, methodId);
      if (handleApiError(result)) { setLoading(false); return false; }
      const data = extractData<any>(result);
      setState(s => ({
        ...s,
        selectedShippingMethod: methodId,
        shippingCost: Number(data?.shipping_cost) || 0,
        total: Number(data?.total) || s.total,
        currentStep: 2, // Go to payment
        isLoading: false,
      }));
      return true;
    } catch {
      toast.error('Verbinding onderbroken. Probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [state.cartId, handleApiError]);

  const completeCheckout = useCallback(async (paymentMethodId: string) => {
    if (!state.cartId) return;
    setLoading(true);
    try {
      const result = await checkoutFlowAPI.complete(state.cartId, paymentMethodId);
      if (handleApiError(result)) { setLoading(false); return; }
      const data = extractData<any>(result);
      console.log('[Checkout] complete response data:', JSON.stringify(data));

      switch (data.payment_type) {
        case 'redirect':
          window.location.href = data.checkout_url;
          break;
        case 'manual':
          try { localStorage.removeItem('sellqo_cart_id'); } catch { /* noop */ }
          queryClient.removeQueries({ queryKey: ['sellqo-cart'] });
          navigate('/bedankt', {
            state: {
              orderNumber: data.order_number,
              total: data.total,
              currency: data.currency,
              bankDetails: data.bank_details,
              paymentType: 'manual',
            },
          });
          break;
        case 'qr':
          try { localStorage.removeItem('sellqo_cart_id'); } catch { /* noop */ }
          navigate('/bedankt', {
            state: {
              orderNumber: data.order_number,
              total: data.total,
              currency: data.currency,
              qrData: data.qr_data,
              paymentType: 'qr',
            },
          });
          break;
        default:
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            toast.error('Onbekende betaalmethode. Neem contact op.');
            setLoading(false);
          }
      }
    } catch {
      toast.error('Er ging iets mis bij het afronden. Probeer opnieuw.');
      setLoading(false);
    }
  }, [state.cartId, navigate, handleApiError]);

  const applyDiscountFn = useCallback(async (code: string): Promise<boolean> => {
    if (!state.cartId) return false;
    try {
      const result = await checkoutFlowAPI.applyDiscount(state.cartId, code);
      if (handleApiError(result)) return false;
      const data = extractData<any>(result);
      setState(s => ({
        ...s,
        discount: { code: data.discount_code || code, amount: Number(data.discount_amount) || 0 },
        total: Number(data.total) ?? s.total,
      }));
      return true;
    } catch {
      toast.error('Kortingscode kon niet worden toegepast.');
      return false;
    }
  }, [state.cartId, handleApiError]);

  const removeDiscountFn = useCallback(async () => {
    if (!state.cartId) return;
    try {
      await checkoutFlowAPI.removeDiscount(state.cartId);
      setState(s => ({ ...s, discount: null, total: (Number(s.subtotal) || 0) + (Number(s.shippingCost) || 0) }));
    } catch { /* noop */ }
  }, [state.cartId]);

  const goToStep = useCallback((step: number) => {
    setState(s => ({ ...s, currentStep: step, fieldErrors: {} }));
  }, []);

  const goBack = useCallback(() => {
    setState(s => {
      if (s.currentStep === 2) return { ...s, currentStep: 1, fieldErrors: {} };
      if (s.currentStep === 3) return { ...s, currentStep: 1, fieldErrors: {} };
      return { ...s, currentStep: Math.max(1, s.currentStep - 1), fieldErrors: {} };
    });
  }, []);

  const getSteps = useCallback(() => {
    return [
      { id: 1, label: 'Gegevens & Adres' },
      { id: 2, label: 'Betaling' },
    ];
  }, []);

  // Computed total with fallbacks
  const computedTotal = useMemo(() => {
    const apiTotal = Number(state.total) || 0;
    if (apiTotal > 0) return apiTotal;
    const sub = Number(state.subtotal) || 0;
    const ship = Number(state.shippingCost) || 0;
    const disc = Number(state.discount?.amount) || 0;
    return Math.max(0, sub + ship - disc);
  }, [state.total, state.subtotal, state.shippingCost, state.discount]);

  const value = useMemo<CheckoutContextType>(() => ({
    ...state,
    total: computedTotal,
    startCheckout,
    saveCustomer,
    saveAddress,
    saveCustomerAndAddress,
    selectShipping,
    completeCheckout,
    applyDiscount: applyDiscountFn,
    removeDiscount: removeDiscountFn,
    goToStep,
    goBack,
    getSteps,
  }), [state, computedTotal, startCheckout, saveCustomer, saveAddress, saveCustomerAndAddress, selectShipping, completeCheckout, applyDiscountFn, removeDiscountFn, goToStep, goBack, getSteps]);

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
