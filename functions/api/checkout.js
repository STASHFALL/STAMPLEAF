import products from "../../products.js";
const { CONFIG, PRODUCTS } = products;

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function onRequestPost({ request, env }) {
  const secret = env.STRIPE_SECRET_KEY;
  if (!secret) {
    return json(500, { error: "Checkout isn't set up yet. Add STRIPE_SECRET_KEY in Cloudflare." });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "That basket couldn't be read. Refresh and try again." });
  }

  const region = CONFIG.regions[payload.region];
  if (!region) {
    return json(400, { error: "Choose where we're posting to before checking out." });
  }

  const lines = [];
  for (const item of Array.isArray(payload.items) ? payload.items : []) {
    const product = PRODUCTS.find((p) => p.id === item.id);
    const qty = Number(item.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 20) continue;
    lines.push({ product, qty });
  }
  if (lines.length === 0) {
    return json(400, { error: "Your basket is empty." });
  }

  const origin = new URL(request.url).origin;

  const form = new URLSearchParams();
  form.append("mode", "payment");
  form.append("locale", "auto");
  form.append("success_url", `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  form.append("cancel_url", `${origin}/#shop`);
  form.append("metadata[region]", payload.region);

  lines.forEach(({ product, qty }, i) => {
    const key = `line_items[${i}]`;
    form.append(`${key}[quantity]`, String(qty));
    form.append(`${key}[price_data][currency]`, CONFIG.currency);
    form.append(`${key}[price_data][unit_amount]`, String(product.price));
    form.append(`${key}[price_data][product_data][name]`, product.name);
    form.append(`${key}[price_data][product_data][description]`, product.tagline);
    form.append(`${key}[price_data][product_data][images][0]`, `${origin}/${product.images[0]}`);
  });

  region.countries.forEach((c, i) =>
    form.append(`shipping_address_collection[allowed_countries][${i}]`, c)
  );
  const ship = "shipping_options[0][shipping_rate_data]";
  form.append(`${ship}[type]`, "fixed_amount");
  form.append(`${ship}[display_name]`, `Postage to ${region.label}`);
  form.append(`${ship}[fixed_amount][amount]`, String(region.price));
  form.append(`${ship}[fixed_amount][currency]`, CONFIG.currency);
  form.append(`${ship}[delivery_estimate][minimum][unit]`, "business_day");
  form.append(`${ship}[delivery_estimate][minimum][value]`, String(region.days[0]));
  form.append(`${ship}[delivery_estimate][maximum][unit]`, "business_day");
  form.append(`${ship}[delivery_estimate][maximum][value]`, String(region.days[1]));

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe error:", JSON.stringify(session.error));
      return json(502, { error: "Stripe couldn't start the checkout. Please try again in a moment." });
    }
    return json(200, { url: session.url });
  } catch (err) {
    console.error(err);
    return json(502, { error: "Couldn't reach Stripe. Please try again in a moment." });
  }
}
