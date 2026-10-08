import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const REGION_CONFIG = {
  all: { location: "United States", gl: "us", hl: "en" },
  us: { location: "United States", gl: "us", hl: "en" },
  uk: { location: "United Kingdom", gl: "uk", hl: "en" },
  eu: { location: "Germany", gl: "de", hl: "en" },
  in: { location: "India", gl: "in", hl: "en" },
  ca: { location: "Canada", gl: "ca", hl: "en" },
  au: { location: "Australia", gl: "au", hl: "en" },
  jp: { location: "Japan", gl: "jp", hl: "en" },
  asia: { location: "Singapore", gl: "sg", hl: "en" },
};

function normalizeOffer(item, query) {
  const price = Number.isFinite(item.extracted_price) ? item.extracted_price : null;
  if (price === null || !item.source || !item.link) return null;

  const deliveryText = String(item.delivery || "");
  let shipping = null;
  if (/free/i.test(deliveryText)) shipping = 0;
  else {
    const m = deliveryText.match(/(?:\$|₹|£|€|CA\$|AU\$|¥)\s*([0-9]+(?:[.,][0-9]+)?)/);
    if (m) shipping = Number(m[1].replace(/,/g, ""));
  }

  return {
    store: String(item.source),
    product: String(item.title || query),
    price,
    currency: item.price ? String(item.price).replace(/[0-9\s.,]+/g, "").trim() || null : null,
    shipping,
    shipping_text: deliveryText || null,
    total: shipping === null ? price : price + shipping,
    availability: item.extensions?.find((x) => /stock|available|delivery|pickup/i.test(String(x))) || null,
    condition: item.second_hand_condition || "new",
    url: item.link,
    product_link: item.product_link || null,
    thumbnail: item.thumbnail || item.serpapi_thumbnail || null,
    rating: item.rating ?? null,
    reviews: item.reviews ?? null,
    query,
    source: "Google Shopping via SerpApi",
  };
}

async function serpSearch(apiKey, query, cfg) {
  const params = new URLSearchParams({
    engine: "google_shopping",
    q: query,
    location: cfg.location,
    gl: cfg.gl,
    hl: cfg.hl,
    api_key: apiKey,
    num: "100",
  });
  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopping provider error ${response.status}: ${text.slice(0, 300)}`);
  }
  return await response.json();
}

async function serpProduct(apiKey, productId, cfg) {
  const params = new URLSearchParams({
    engine: "google_product",
    product_id: productId,
    offer_view: "true",
    gl: cfg.gl,
    hl: cfg.hl,
    api_key: apiKey,
  });
  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
  if (!response.ok) return null;
  return await response.json();
}

function normalizeStoreOffer(store, query) {
  const price = Number.isFinite(store.extracted_price) ? store.extracted_price : null;
  if (price === null || !store.name || !store.link) return null;

  const shipping = Number.isFinite(store.shipping_extracted)
    ? store.shipping_extracted
    : /free/i.test(String(store.shipping || "")) ? 0 : null;

  const total = Number.isFinite(store.extracted_total)
    ? store.extracted_total
    : shipping === null ? price : price + shipping;

  return {
    store: String(store.name),
    product: String(store.title || query),
    price,
    currency: store.price ? String(store.price).replace(/[0-9\\s.,]+/g, "").trim() || null : null,
    shipping,
    shipping_text: store.shipping || store.details_and_offers?.find((x) => /delivery|shipping/i.test(String(x))) || null,
    total,
    availability: store.details_and_offers?.find((x) => /stock|available|delivery|pickup/i.test(String(x))) || null,
    condition: store.second_hand_condition || "new",
    url: store.link,
    product_link: store.link,
    thumbnail: store.logo || null,
    rating: store.rating ?? null,
    reviews: store.reviews ?? null,
    query,
    source: "Google Product via SerpApi",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("SERPAPI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({
        ok: false,
        code: "MISSING_PROVIDER_KEY",
        message: "SERPAPI_API_KEY is not configured on the PriceSnap price service.",
        results: []
      }), { status: 503, headers: corsHeaders });
    }

    const body = await req.json();
    const query = String(body.query || "").trim();
    const region = String(body.region || "all");
    const extraQueries = Array.isArray(body.queries) ? body.queries : [];
    if (!query) {
      return new Response(JSON.stringify({ ok: false, message: "query is required", results: [] }), {
        status: 400, headers: corsHeaders
      });
    }

    const cfg = REGION_CONFIG[region] || REGION_CONFIG.all;
    const queries = [...new Set([query, ...extraQueries.map(String).filter(Boolean)])].slice(0, 4);

    const responses = await Promise.all(queries.map((q) => serpSearch(apiKey, q, cfg)));
    const offers = [];
    const productIds = new Set();

    for (const data of responses) {
      for (const item of (data.shopping_results || [])) {
        const offer = normalizeOffer(item, query);
        if (offer) offers.push(offer);
        if (item.product_id) productIds.add(String(item.product_id));
      }
      for (const item of (data.inline_shopping_results || [])) {
        const offer = normalizeOffer(item, query);
        if (offer) offers.push(offer);
        if (item.product_id) productIds.add(String(item.product_id));
      }
    }

    // Expand a few likely exact-product matches into their full store offer lists.
    // This is what allows independent merchants to appear alongside major marketplaces.
    const productDetails = await Promise.all(
      [...productIds].slice(0, 3).map((id) => serpProduct(apiKey, id, cfg))
    );

    for (const data of productDetails) {
      for (const store of (data?.product_results?.stores || [])) {
        const offer = normalizeStoreOffer(store, query);
        if (offer) offers.push(offer);
      }
    }

    const seen = new Set();
    const deduped = offers.filter((offer) => {
      const key = [
        offer.store.toLowerCase(),
        offer.product.toLowerCase().replace(/\s+/g, " ").trim(),
        offer.price,
        offer.url
      ].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => a.total - b.total);

    return new Response(JSON.stringify({
      ok: true,
      provider: "Google Shopping via SerpApi",
      region,
      query,
      searched_queries: queries,
      count: deduped.length,
      results: deduped.slice(0, 100)
    }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("PriceSnap search error:", error);
    return new Response(JSON.stringify({
      ok: false,
      code: "SEARCH_FAILED",
      message: error instanceof Error ? error.message : "Shopping search failed",
      results: []
    }), { status: 500, headers: corsHeaders });
  }
});
