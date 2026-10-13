// Creates a Stripe Checkout Session for the basket.
// Prices and postage come from products.js, never from the browser,
// so a customer can't change what they pay by editing the page.

const { CONFIG, PRODUCTS } = require("../../products.js");

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST." });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return json(500, {
      error: "Checkout isn't set up yet. Add STRIPE_SECRET_KEY in Netlify.",
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
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
    if (!product || !Number.isInteger(qty) || qty < 1 || qty >
