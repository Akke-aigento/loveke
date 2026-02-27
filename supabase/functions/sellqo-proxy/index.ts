const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept-language, x-tenant-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SELLQO_API_BASE = "https://gczmfcabnoofnmfpzeop.supabase.co/functions/v1/storefront-api";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SELLQO_API_KEY = Deno.env.get("VITE_SELLQO_API_KEY") || Deno.env.get("SELLQO_API_KEY");

  if (!SELLQO_API_KEY) {
    console.error("SELLQO_API_KEY not configured in secrets");
    return new Response(
      JSON.stringify({ success: false, error: "Server configuration error: API key not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    // pathname: /sellqo-proxy/products  search: ?collection=featured
    const endpoint = url.pathname.replace(/^.*\/sellqo-proxy/, '') || '/';
    const targetUrl = `${SELLQO_API_BASE}${endpoint}${url.search}`;
    console.log(`Proxying ${req.method} -> ${targetUrl}`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-API-Key": SELLQO_API_KEY,
    };

    // Forward tenant and language headers
    const tenantId = req.headers.get("x-tenant-id");
    if (tenantId) headers["X-Tenant-ID"] = tenantId;

    const acceptLang = req.headers.get("accept-language");
    if (acceptLang) headers["Accept-Language"] = acceptLang;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const body = await req.text();
      if (body) fetchOptions.body = body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Proxy request failed", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
