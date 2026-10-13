(function () {
  const CART_KEY = "stampleaf-cart";
  const $ = (id) => document.getElementById(id);
  const money = (pence) => "£" + (pence / 100).toFixed(2);
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  // ---- Basket state (saved in this browser only) ----
  let cart = { items: {}, region: "uk" };
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || "null");
    if (saved && saved.items) {
      Object.keys(saved.items).forEach((id) => {
        if (byId[id] && saved.items[id] > 0) cart.items[id] = Math.min(20, saved.items[id]);
      });
      if (CONFIG.regions[saved.region]) cart.region = saved.region;
    }
  } catch (e) { /* storage unavailable: basket just won't persist */ }
  const save = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} };

  // ---- Products ----
  const grid = $("product-grid");
  PRODUCTS.forEach((p) => {
    const art = document.createElement("article");
    art.className = "product";
    art.innerHTML = `
      <div class="product-photo">
        <div class="photo-frame">
          <div class="stamp-wrap"><div class="stamp"><img src="images/${p.images[0]}" alt="${p.alt}" loading="lazy"></div></div>
          <span class="value-tag">${money(p.price)}</span>
        </div>
        ${p.images.length > 1 ? `<div class="thumbs" role="group" aria-label="${p.name} photos">${p.images
          .map((img, i) => `<button type="button" class="thumb" data-img="${img}" aria-label="Photo ${i + 1} of ${p.images.length}" aria-current="${i === 0}"><img src="images/${img}" alt=""></button>`)
          .join("")}</div>` : ""}
      </div>
      <div>
        <h3>${p.name}</h3>
        <p class="tagline">${p.tagline}</p>
      </div>
      <p class="desc">${p.description}</p>
      <dl class="facts">${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <div class="buy-row">
        <span class="price">${money(p.price)}</span>
        <button type="button" class="btn btn-primary" data-add="${p.id}">Add to basket</button>
      </div>`;
    const main = art.querySelector(".stamp img");
    art.querySelectorAll(".thumb").forEach((t) =>
      t.addEventListener("click", () => {
        main.src = "images/" + t.dataset.img;
        art.querySelectorAll(".thumb").forEach((o) => o.setAttribute("aria-current", String(o === t)));
      })
    );
    grid.appendChild(art);
  });
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = btn.dataset.add;
    cart.items[id] = Math.min(20, (cart.items[id] || 0) + 1);
    save(); render(); openBasket();
  });

  // ---- Postage table and region picker ----
  const regionSel = $("region");
  Object.entries(CONFIG.regions).forEach(([key, r]) => {
    regionSel.add(new Option(`${r.label} (${money(r.price)})`, key));
    const tr = document.createElement("tr");
    if (key === "uk") tr.className = "home";
    tr.innerHTML = `<th scope="row">${r.label}</th><td>${r.days[0]} to ${r.days[1]} working days</td><td>${money(r.price)}</td>`;
    $("rates-body").appendChild(tr);
  });
  regionSel.value = cart.region;
  regionSel.addEventListener("change", () => { cart.region = regionSel.value; save(); render(); });

  // ---- Basket drawer ----
  const drawer = $("basket"), scrim = $("scrim");
  let lastFocus = null;
  function openBasket() {
    lastFocus = document.activeElement;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    scrim.hidden = false;
    drawer.focus();
  }
  function closeBasket() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    scrim.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $("open-basket").addEventListener("click", openBasket);
  $("close-basket").addEventListener("click", closeBasket);
  scrim.addEventListener("click", closeBasket);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) closeBasket(); });

  $("basket-body").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    if (b.dataset.act === "inc") cart.items[id] = Math.min(20, cart.items[id] + 1);
    if (b.dataset.act === "dec") cart.items[id] = cart.items[id] - 1;
    if (b.dataset.act === "rm" || cart.items[id] <= 0) delete cart.items[id];
    save(); render();
  });

  function render() {
    const ids = Object.keys(cart.items);
    const count = ids.reduce((n, id) => n + cart.items[id], 0);
    $("basket-count").textContent = count;
    const body = $("basket-body");
    if (ids.length === 0) {
      body.innerHTML = `<p class="empty">Your basket is empty. <a href="#shop" id="empty-link">Browse the lots</a></p>`;
      $("basket-foot").hidden = true;
      const link = $("empty-link");
      if (link) link.addEventListener("click", closeBasket);
      return;
    }
    $("basket-foot").hidden = false;
    let sub = 0;
    body.innerHTML = ids.map((id) => {
      const p = byId[id], q = cart.items[id];
      sub += p.price * q;
      return `<div class="line">
        <img src="images/${p.images[0]}" alt="">
        <div>
          <div class="line-name">${p.name}</div>
          <div class="qty">
            <button type="button" data-act="dec" data-id="${id}" aria-label="One fewer ${p.name}">&minus;</button>
            <span aria-live="polite">${q}</span>
            <button type="button" data-act="inc" data-id="${id}" aria-label="One more ${p.name}">+</button>
          </div>
        </div>
        <div><div class="line-price">${money(p.price * q)}</div>
          <button type="button" class="remove" data-act="rm" data-id="${id}">Remove</button></div>
      </div>`;
    }).join("");
    const region = CONFIG.regions[cart.region];
    $("t-sub").textContent = money(sub);
    $("t-ship-label").textContent = "Postage to " + region.label;
    $("t-ship").textContent = money(region.price);
    $("t-total").textContent = money(sub + region.price);
  }

  // ---- Checkout (hands off to Stripe) ----
  const btn = $("checkout-btn"), err = $("checkout-error");
  btn.addEventListener("click", async () => {
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = "Taking you to Stripe…";
    try {
      const res = await fetch("/.netlify/functions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: cart.region,
          items: Object.entries(cart.items).map(([id, qty]) => ({ id, qty })),
        }),
      });
      const res = await fetch("/api/checkout", {
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout couldn't start. Please try again.");
      window.location.href = data.url;
    } catch (e) {
      err.textContent = e.message.startsWith("Failed to fetch")
        ? "Checkout works once the site is live on Netlify. It can't run from a local file."
        : e.message;
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = "Pay securely with Stripe";
    }
  });
  // Coming back with the browser's Back button leaves the button stuck, so reset it.
  window.addEventListener("pageshow", () => { btn.disabled = false; btn.textContent = "Pay securely with Stripe"; });

  // ---- Footer contact ----
  if (CONFIG.contactEmail) {
    const c = $("contact-line");
    c.hidden = false;
    c.innerHTML = `Questions? <a href="mailto:${CONFIG.contactEmail}">${CONFIG.contactEmail}</a>`;
  }

  render();
})();
