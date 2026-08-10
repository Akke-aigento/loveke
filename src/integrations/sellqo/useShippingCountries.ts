import { useQuery } from '@tanstack/react-query';
import { checkoutFlowAPI } from './checkoutApi';

export interface ShippingCountriesResult {
  countries: string[];
  unrestricted: boolean;
  defaultCountry: string | null;
  isLoading: boolean;
  isError: boolean;
}

function unwrap(res: any) {
  if (res && typeof res === 'object' && res.data && typeof res.data === 'object') return res.data;
  return res || {};
}

export function useShippingCountries(): ShippingCountriesResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['sellqo-shipping-countries'],
    queryFn: async () => {
      const raw = unwrap(await checkoutFlowAPI.getShippingCountries());
      return {
        countries: Array.isArray(raw.countries)
          ? raw.countries.filter((c: unknown) => typeof c === 'string').map((c: string) => c.toUpperCase())
          : [],
        unrestricted: raw.unrestricted === true,
        defaultCountry: typeof raw.default_country === 'string' ? raw.default_country.toUpperCase() : null,
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    countries: data?.countries ?? [],
    // On error we fall back to the full list so checkout never dead-ends;
    // the server still validates the country in checkout_shipping.
    unrestricted: isError ? true : (data?.unrestricted ?? false),
    defaultCountry: data?.defaultCountry ?? null,
    isLoading,
    isError,
  };
}
