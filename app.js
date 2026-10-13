(function () {
  const CART_KEY = "stampleaf-cart";
  const SIZE_KEY = "stampleaf-text";
  const $ = (id) => document.getElementById(id);
  const money = (pence) => "£" + (pence / 100).toFixed(2);
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const BADGES = { "jumbo-1000": "Our biggest lot", "vintage-100": "No folds or missing corners" };

  // ---- Text size (remembered between visits) ----
  const sizeBtns = document.querySelectorAll(".textsize button");
  function setSize(size) {
    document.documentElement.dataset.text = size;
    sizeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size === size)));
    try { localStorage.setItem(SIZE_KEY, size); } catch (e) {}
  }
  sizeBtns.forEach((b) => b.addEventListener("click", () => setSize(b.dataset.size)));
  try {
    const s = localStorage.getItem(SIZE_KEY);
    if (s === "large" || s === "xlarge") setSize(s);
  } catch (e) {}

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

  // ---- Products: filter, sort, draw ----
  const grid = $("product-grid");
  let filter = "all", sort = "featured";

  function visibleProducts() {
    let list = PRODUCTS.slice();
    if (filter === "under10") list = list.filter((p) => p.price < 1000);
    if (filter === "over10") list = list.filter((p) => p.price >= 1000);
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    return list;
  }

  function drawProducts() {
    const list = visibleProducts();
    grid.innerHTML = "";
    $("result-count").textContent = list.length === PRODUCTS.length
      ? `Showing all ${list.length} lots`
      : `Showing ${list.length} of ${PRODUCTS.length} lots`;
    list.forEach((p) => {
      const art = document.createElement("article");
      art.className = "product";
      art.innerHTML = `
        <div class="product-photo">
          <button type="button" class="photo-frame" data-zoom="${p.id}" aria-label="View bigger photos of ${p.name}">
            <div class="stamp-wrap"><div class="stamp"><img src="${p.images[0]}" alt="${p.alt}" loading="lazy"></div></div>
            <span class="zoom-hint" aria-hidden="true">Tap to enlarge</span>
            <span class="value-tag">${money(p.price)}</span>
          </button>
          ${p.images.length > 1 ? `<div class="thumbs" role="group" aria-label="${p.name} photos">${p.images
            .map((img, i) => `<button type="button" class="thumb" data-img="${img}" aria-label="Show photo ${i + 1} of ${p.images.length}" aria-current="${i === 0}"><img src="${img}" alt=""></button>`)
            .join("")}</div>` : ""}
        </div>
        ${BADGES[p.id] ? `<span class="badge">${BADGES[p.id]}</span>` : ""}
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
          main.src = t.dataset.img;
          art.querySelector(".photo-frame").dataset.start = p.images.indexOf(t.dataset.img);
          art.querySelectorAll(".thumb").forEach((o) => o.setAttribute("aria-current", String(o === t)));
        })
      );
      grid.appendChild(art);
    });
  }

  document.querySelectorAll(".chip").forEach((c) =>
    c.addEventListener("click", () => {
      filter = c.dataset.filter;
      document.querySelectorAll(".chip").forEach((o) => o.setAttribute("aria-pressed", String(o === c)));
      drawProducts();
    })
  );
  $("sort").addEventListener("change", (e) => { sort = e.target.value; drawProducts(); });

  // ---- Add to basket, with a clear confirmation ----
  let toastTimer;
  function showToast(msg) {
    $("toast-msg").textContent = msg;
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $("toast").hidden = true; }, 6000);
  }
  grid.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) {
      const id = add.dataset.add;
      cart.items[id] = Math.min(20, (cart.items[id] || 0) + 1);
      save(); render();
      add.classList.add("added");
      add.textContent = "Added ✓";
      setTimeout(() => { add.classList.remove("added"); add.textContent = "Add to basket"; }, 1800);
      const b = $("open-basket");
      b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
      showToast(`Added: ${byId[id].name}`);
      return;
    }
    const zoom = e.target.closest("[data-zoom]");
    if (zoom) openLightbox(zoom.dataset.zoom, Number(zoom.dataset.start || 0));
  });
  $("toast-view").addEventListener("click", () => { $("toast").hidden = true; openBasket(); });

  // ---- Photo viewer ----
  const lb = $("lightbox");
  let lbList = [], lbIndex = 0, lbProduct = null;
  function lbShow() {
    $("lb-img").src = lbList[lbIndex];
    $("lb-img").alt = lbProduct.alt;
    $("lb-caption").textContent = `${lbProduct.name} (photo ${lbIndex + 1} of ${lbList.length})`;
    $("lb-prev").hidden = $("lb-next").hidden = lbList.length < 2;
  }
  function openLightbox(id, start) {
    lbProduct = byId[id]; lbList = lbProduct.images; lbIndex = start || 0;
    lbShow();
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
  }
  $("lb-prev").addEventListener("click", () => { lbIndex = (lbIndex + lbList.length - 1) % lbList.length; lbShow(); });
  $("lb-next").addEventListener("click", () => { lbIndex = (lbIndex + 1) % lbList.length; lbShow(); });
  $("lb-close").addEventListener("click", () => lb.close());
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") $("lb-prev").click();
    if (e.key === "ArrowRight") $("lb-next").click();
  });

  // ---- Postage: checker, table and the basket's region picker ----
  const regionSel = $("region"), regionChk = $("region-check");
  const rows = {};
  Object.entries(CONFIG.regions).forEach(([key, r]) => {
    const label = `${r.label} (${money(r.price)})`;
    regionSel.add(new Option(label, key));
    regionChk.add(new Option(r.label, key));
    const tr = document.createElement("tr");
    if (key === "uk") tr.className = "home";
    tr.innerHTML = `<th scope="row">${r.label}</th><td>${r.days[0]} to ${r.days[1]} working days</td><td>${money(r.price)}</td>`;
    $("rates-body").appendChild(tr);
    rows[key] = tr;
  });
  function syncRegion() {
    const r = CONFIG.regions[cart.region];
    regionSel.value = cart.region;
    regionChk.value = cart.region;
    $("chk-price").textContent = money(r.price);
    $("chk-days").textContent = `postage to ${r.label}, arriving in ${r.days[0]} to ${r.days[1]} working days`;
    Object.entries(rows).forEach(([k, tr]) => tr.classList.toggle("picked", k === cart.region));
  }
  [regionSel, regionChk].forEach((sel) =>
    sel.addEventListener("change", () => { cart.region = sel.value; save(); render(); })
  );

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
    syncRegion();
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
        <img src="${p.images[0]}" alt="">
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region: cart.region,
          items: Object.entries(cart.items).map(([id, qty]) => ({ id, qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout couldn't start. Please try again.");
      window.location.href = data.url;
    } catch (e) {
      err.textContent = e.message.startsWith("Failed to fetch")
        ? "Checkout couldn't be reached. Please try again."
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

  drawProducts();
  render();
})();
