import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { checkoutFlowAPI } from '@/integrations/sellqo/checkoutApi';
import { extractSingle } from '@/integrations/sellqo/client';
import type {
  CheckoutState,
  CheckoutCustomer,
  CheckoutAddress,
  PaymentMethod,
  ShippingMethod,
  CartItem,
} from '@/integrations/sellqo/checkoutTypes';

interface CheckoutContextType extends CheckoutState {
  startCheckout: (cartId: string) => Promise<boolean>;
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
  orderId: null,
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
        orderId: data.order_id,
        items: data.items || [],
        availablePaymentMethods: data.available_payment_methods || [],
        availableShippingMethods: data.available_shipping_methods || [],
        subtotal: data.subtotal || 0,
        total: data.subtotal || 0,
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
    if (!state.orderId) return false;
    setLoading(true);
    setFieldErrors({});
    try {
      const result = await checkoutFlowAPI.saveCustomer(state.orderId, customer);
      if (handleApiError(result)) { setLoading(false); return false; }
      setState(s => ({ ...s, customer, currentStep: 2, isLoading: false, fieldErrors: {} }));
      return true;
    } catch {
      toast.error('Verbinding onderbroken. Probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [state.orderId, handleApiError]);

  const saveAddress = useCallback(async (shipping: CheckoutAddress, billingSame: boolean, billing?: CheckoutAddress | null): Promise<boolean> => {
    if (!state.orderId) return false;
    setLoading(true);
    setFieldErrors({});
    try {
      const result = await checkoutFlowAPI.saveAddress(state.orderId, shipping, billingSame, billing);
      if (handleApiError(result)) { setLoading(false); return false; }

      // Determine next step
      const hasShipping = state.availableShippingMethods.length > 0;
      let nextStep = hasShipping ? 3 : 4;

      // Auto-select if only 1 shipping method
      if (hasShipping && state.availableShippingMethods.length === 1) {
        const method = state.availableShippingMethods[0];
        const shippingResult = await checkoutFlowAPI.selectShipping(state.orderId, method.id);
        const shippingData = extractData<any>(shippingResult);
        setState(s => ({
          ...s,
          shippingAddress: shipping,
          billingAddress: billingSame ? null : (billing || null),
          billingSameAsShipping: billingSame,
          selectedShippingMethod: method.id,
          shippingCost: shippingData?.shipping_cost ?? method.price ?? 0,
          total: shippingData?.total ?? s.total,
          currentStep: 4,
          isLoading: false,
          fieldErrors: {},
        }));
        return true;
      }

      setState(s => ({
        ...s,
        shippingAddress: shipping,
        billingAddress: billingSame ? null : (billing || null),
        billingSameAsShipping: billingSame,
        currentStep: nextStep,
        isLoading: false,
        fieldErrors: {},
      }));
      return true;
    } catch {
      toast.error('Verbinding onderbroken. Probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [state.orderId, state.availableShippingMethods, handleApiError]);

  const selectShipping = useCallback(async (methodId: string): Promise<boolean> => {
    if (!state.orderId) return false;
    setLoading(true);
    try {
      const result = await checkoutFlowAPI.selectShipping(state.orderId, methodId);
      if (handleApiError(result)) { setLoading(false); return false; }
      const data = extractData<any>(result);
      setState(s => ({
        ...s,
        selectedShippingMethod: methodId,
        shippingCost: data?.shipping_cost ?? 0,
        total: data?.total ?? s.total,
        currentStep: 4,
        isLoading: false,
      }));
      return true;
    } catch {
      toast.error('Verbinding onderbroken. Probeer opnieuw.');
      setLoading(false);
      return false;
    }
  }, [state.orderId, handleApiError]);

  const completeCheckout = useCallback(async (paymentMethodId: string) => {
    if (!state.orderId) return;
    setLoading(true);
    try {
      const result = await checkoutFlowAPI.complete(state.orderId, paymentMethodId);
      if (handleApiError(result)) { setLoading(false); return; }
      const data = extractData<any>(result);

      // Clear cart
      try { localStorage.removeItem('sellqo_cart_id'); } catch { /* noop */ }

      switch (data.payment_type) {
        case 'redirect':
          window.location.href = data.checkout_url;
          break;
        case 'manual':
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
          // Fallback — try redirect
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else {
            navigate('/bedankt');
          }
      }
    } catch {
      toast.error('Er ging iets mis bij het afronden. Probeer opnieuw.');
      setLoading(false);
    }
  }, [state.orderId, navigate, handleApiError]);

  const applyDiscountFn = useCallback(async (code: string): Promise<boolean> => {
    if (!state.orderId) return false;
    try {
      const result = await checkoutFlowAPI.applyDiscount(state.orderId, code);
      if (handleApiError(result)) return false;
      const data = extractData<any>(result);
      setState(s => ({
        ...s,
        discount: { code: data.discount_code || code, amount: data.discount_amount || 0 },
        total: data.total ?? s.total,
      }));
      return true;
    } catch {
      toast.error('Kortingscode kon niet worden toegepast.');
      return false;
    }
  }, [state.orderId, handleApiError]);

  const removeDiscountFn = useCallback(async () => {
    if (!state.orderId) return;
    try {
      await checkoutFlowAPI.removeDiscount(state.orderId);
      setState(s => ({ ...s, discount: null, total: s.subtotal + s.shippingCost }));
    } catch { /* noop */ }
  }, [state.orderId]);

  const goToStep = useCallback((step: number) => {
    setState(s => ({ ...s, currentStep: step, fieldErrors: {} }));
  }, []);

  const goBack = useCallback(() => {
    setState(s => {
      let prevStep = s.currentStep - 1;
      // Skip shipping step if no methods
      if (prevStep === 3 && s.availableShippingMethods.length <= 1) {
        prevStep = 2;
      }
      return { ...s, currentStep: Math.max(1, prevStep), fieldErrors: {} };
    });
  }, []);

  const getSteps = useCallback(() => {
    const steps = [
      { id: 1, label: 'Gegevens' },
      { id: 2, label: 'Adres' },
    ];
    if (state.availableShippingMethods.length > 1) {
      steps.push({ id: 3, label: 'Verzending' });
    }
    steps.push({ id: 4, label: 'Betaling' });
    return steps;
  }, [state.availableShippingMethods]);

  const value = useMemo<CheckoutContextType>(() => ({
    ...state,
    startCheckout,
    saveCustomer,
    saveAddress,
    selectShipping,
    completeCheckout,
    applyDiscount: applyDiscountFn,
    removeDiscount: removeDiscountFn,
    goToStep,
    goBack,
    getSteps,
  }), [state, startCheckout, saveCustomer, saveAddress, selectShipping, completeCheckout, applyDiscountFn, removeDiscountFn, goToStep, goBack, getSteps]);

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout must be used within CheckoutProvider');
  return ctx;
}
