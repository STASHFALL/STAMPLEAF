# Stampleaf

A small stamp shop: static site plus one Netlify function that creates Stripe Checkout sessions.

## Go live (about 10 minutes)

1. Create a free Netlify account and deploy this folder as a new site. Drag-and-drop uploads don't run functions, so either import it from a Git repository or run `npx netlify deploy --prod` from this folder.
2. In Netlify, open Site configuration > Environment variables and add `STRIPE_SECRET_KEY`. Use your **secret key** from Stripe (Developers > API keys). Start with the test key (`sk_test_...`), place a test order with card 4242 4242 4242 4242, then swap in the live key (`sk_live_...`).
3. Redeploy so the function picks up the key.

The secret key lives only in Netlify. It is never in the website files.

## Things to edit (all in `site/products.js`)

- **Prices** are in pence: `790` is £7.90.
- **Postage**: one flat rate per order per region. UK £1.99, Europe £3.99, USA & Canada £4.99, rest of the world £5.99. Check these against what the post actually costs you.
- **Countries**: each region lists the countries Stripe will accept an address for. Add or remove two-letter codes as you like.
- **Support email**: set `contactEmail` and it shows in the footer.

## Before you take real orders

- Check each product description against what actually arrives from your suppliers (quantities, weights, "no folded stamps").
- The FAQ states a 14-day return window. UK law gives online buyers a right to cancel within 14 days, but read it over and adjust it to how you want to run returns.
- Check the name "Stampleaf" on the Companies House register and the UK Intellectual Property Office trade mark search, and see if the domain is free, before you commit to it.
- Orders appear in your Stripe dashboard with the postage address. Stripe emails the customer a receipt.
