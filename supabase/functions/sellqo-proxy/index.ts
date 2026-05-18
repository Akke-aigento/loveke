import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SELLQO_API_URL = "https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tenant-id, accept-language, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

function resolveAction(
  method: string,
  path: string,
  query: URLSearchParams,
  body: Record<string, unknown> | null,
  tenantId: string,
  locale: string | null,
): { action: string; tenant_id: string; params: Record<string, unknown> } {
  const segments = path.replace(/^\//, '').split('/').filter(Boolean);
  const params: Record<string, unknown> = {};
  if (locale) params.locale = locale;

  if (segments[0] === 'products') {
    if (segments.length === 1) {
      for (const [k, v] of query.entries()) params[k] = v;
      if (params.collection) {
        params.category_slug = params.collection;
        delete params.collection;
      }
      if (query.get('search')) return { action: 'search_products', tenant_id: tenantId, params };
      return { action: 'get_products', tenant_id: tenantId, params };
    }
    if (segments.length === 2) {
      params.slug = segments[1];
      return { action: 'get_product', tenant_id: tenantId, params };
    }
    if (segments.length === 3 && segments[2] === 'related') {
      params.slug = segments[1];
      if (query.get('limit')) params.limit = Number(query.get('limit'));
      return { action: 'get_product', tenant_id: tenantId, params };
    }
  }

  if (segments[0] === 'collections' || segments[0] === 'categories') {
    return { action: 'get_categories', tenant_id: tenantId, params };
  }

  if (segments[0] === 'cart') {
    if (segments.length === 1 && method === 'POST') {
      return { action: 'cart_create', tenant_id: tenantId, params: { ...params, ...body } };
    }
    const cartId = segments[1];
    if (cartId) params.cart_id = cartId;

    if (segments.length === 2 && method === 'GET') {
      return { action: 'cart_get', tenant_id: tenantId, params };
    }

    if (segments[2] === 'items') {
      if (segments.length === 3 && method === 'POST') {
        return { action: 'cart_add_item', tenant_id: tenantId, params: { ...params, ...body } };
      }
      if (segments.length === 4) {
        params.item_id = segments[3];
        if (method === 'PUT' || method === 'PATCH') {
          return { action: 'cart_update_item', tenant_id: tenantId, params: { ...params, ...body } };
        }
        if (method === 'DELETE') {
          return { action: 'cart_remove_item', tenant_id: tenantId, params };
        }
      }
    }

    if (segments[2] === 'discount') {
      if (method === 'POST') {
        return { action: 'cart_apply_discount', tenant_id: tenantId, params: { ...params, ...body } };
      }
      if (method === 'DELETE') {
        return { action: 'cart_remove_discount', tenant_id: tenantId, params };
      }
    }
  }

  if (segments[0] === 'checkout') {
    if (segments[1] === 'order' && method === 'GET') {
      for (const [k, v] of query.entries()) params[k] = v;
      return { action: 'checkout_get_order', tenant_id: tenantId, params };
    }
    if (segments[1] === 'start' && method === 'POST') {
      return { action: 'checkout_start', tenant_id: tenantId, params: { ...params, ...body } };
    }
    if (segments[1] === 'customer' && method === 'POST') {
      return { action: 'checkout_customer', tenant_id: tenantId, params: { ...params, ...body } };
    }
    if (segments[1] === 'address' && method === 'POST') {
      return { action: 'checkout_address', tenant_id: tenantId, params: { ...params, ...body } };
    }
    if (segments[1] === 'shipping' && method === 'POST') {
      return { action: 'checkout_shipping', tenant_id: tenantId, params: { ...params, ...body } };
    }
    if (segments[1] === 'complete' && method === 'POST') {
      return { action: 'checkout_complete', tenant_id: tenantId, params: { ...params, ...body } };
    }
    if (segments[1] === 'discount' && method === 'POST') {
      return { action: 'checkout_discount', tenant_id: tenantId, params: { ...params, ...body } };
    }
    if (segments[1] === 'discount' && method === 'DELETE') {
      return { action: 'checkout_remove_discount', tenant_id: tenantId, params: { ...params, ...body } };
    }
    if (segments.length === 1 && method === 'POST') {
      return { action: 'checkout_start', tenant_id: tenantId, params: { ...params, ...body } };
    }
  }

  if (segments[0] === 'settings') {
    return { action: 'get_config', tenant_id: tenantId, params };
  }

  if (segments[0] === 'legal' || segments[0] === 'pages') {
    if (segments.length === 2) params.slug = segments[1];
    return { action: 'get_pages', tenant_id: tenantId, params };
  }

  if (segments[0] === 'reviews') {
    for (const [k, v] of query.entries()) params[k] = v;
    return { action: 'get_reviews', tenant_id: tenantId, params };
  }

  if (segments[0] === 'newsletter' && method === 'POST') {
    return { action: 'newsletter_subscribe', tenant_id: tenantId, params: { ...params, ...body } };
  }

  if (segments[0] === 'shipping') {
    return { action: 'get_shipping_methods', tenant_id: tenantId, params };
  }

  return { action: segments.join('_'), tenant_id: tenantId, params: { ...params, ...body } };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SELLQO_API_KEY = Deno.env.get('SELLQO_API_KEY');
  if (!SELLQO_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'SELLQO_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/sellqo-proxy/, '') || '/';
    const tenantSlug = req.headers.get('X-Tenant-ID') || 'loveke';
    // Resolve slug → UUID. Add other slugs here if this proxy serves multiple stores.
    const TENANT_MAP: Record<string, string> = {
      'loveke': '1671a91c-31fe-42ed-8a10-41f3117ceb50',
    };
    const tenantId = TENANT_MAP[tenantSlug] || tenantSlug;
    const locale = req.headers.get('Accept-Language') || null;

    let body: Record<string, unknown> | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const raw = await req.text();
      if (raw) {
        try { body = JSON.parse(raw); } catch { body = null; }
      }
    }

    const storefrontBody = resolveAction(req.method, path, url.searchParams, body, tenantId, locale);

    console.log(`[sellqo-proxy] ${req.method} ${path} → action: ${storefrontBody.action}`);

    const response = await fetch(SELLQO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': SELLQO_API_KEY,
      },
      body: JSON.stringify(storefrontBody),
    });

    const responseBody = await response.text();

    if (storefrontBody.action.startsWith('checkout_')) {
      console.log(`[sellqo-proxy] ${storefrontBody.action} response status: ${response.status}, body: ${responseBody.substring(0, 500)}`);
    }

    if (!response.ok) {
      const nonCriticalActions = ['get_pages'];
      if (nonCriticalActions.includes(storefrontBody.action)) {
        console.warn(`[sellqo-proxy] ${storefrontBody.action} failed: ${responseBody}`);
        return new Response(
          JSON.stringify({ data: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(responseBody, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('SellQo proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Proxy request failed', details: error.message }),
      { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
