/* ============================================
   SATCHEL & CO — script.js
   Product data, stitched-bag SVG generator,
   cart logic (localStorage), and page renderers.
   ============================================ */

/* ---------- PRODUCT DATA ---------- */
const PRODUCTS = [
  {
    id: "tote-01",
    name: "The Harlow Tote",
    category: "Tote",
    price: 128,
    colors: ["#A8703D", "#241910", "#7C8A72"],
    description: "A roomy, structured tote in full-grain leather, built for the daily commute. Interior zip pocket, magnetic close, and a base that won't slouch.",
    details: ["Full-grain leather", "14\" laptop fits inside", "Magnetic snap closure", "Made in small batches"]
  },
  {
    id: "cross-01",
    name: "The Wren Crossbody",
    category: "Crossbody",
    price: 86,
    colors: ["#7C5A3C", "#241910", "#B08D57"],
    description: "Compact and light, with an adjustable strap long enough to wear three ways. Just enough room for the essentials.",
    details: ["Vegetable-tanned leather", "Adjustable 22\"-48\" strap", "Card slot inside", "Brass hardware"]
  },
  {
    id: "back-01",
    name: "The Foster Backpack",
    category: "Backpack",
    price: 154,
    colors: ["#241910", "#3E3128", "#A8703D"],
    description: "A minimal leather backpack that goes from studio to weekend trip. Padded straps, a laptop sleeve, and room to spare.",
    details: ["Water-resistant lining", "Fits 15\" laptop", "Padded adjustable straps", "Top handle + backpack straps"]
  },
  {
    id: "clutch-01",
    name: "The Linden Clutch",
    category: "Clutch",
    price: 64,
    colors: ["#241910", "#9A3B1E", "#B08D57"],
    description: "An evening clutch with a hidden wrist strap. Holds a phone, cards, and not much else — on purpose.",
    details: ["Smooth nappa leather", "Detachable wrist strap", "Satin interior lining"]
  },
  {
    id: "tote-02",
    name: "The Briar Market Tote",
    category: "Tote",
    price: 112,
    colors: ["#7C8A72", "#A8703D", "#241910"],
    description: "An open-top tote with reinforced stitched handles, sized for a grocery run or a stack of folders.",
    details: ["Reinforced stitched handles", "Open top, wide base", "Machine-washable canvas blend"]
  },
  {
    id: "cross-02",
    name: "The Marlowe Saddle Bag",
    category: "Crossbody",
    price: 94,
    colors: ["#A8703D", "#7C5A3C", "#241910"],
    description: "A classic saddle silhouette with a flap closure and a strap that sits perfectly at the hip.",
    details: ["Flap closure with brass buckle", "Adjustable crossbody strap", "Interior zip pocket"]
  },
  {
    id: "back-02",
    name: "The Asher Daypack",
    category: "Backpack",
    price: 138,
    colors: ["#3E3128", "#241910", "#B08D57"],
    description: "A slim daypack that doesn't bulk up your silhouette. Drawstring top, one front pocket, no clutter.",
    details: ["Drawstring top closure", "Single front pocket", "Leather base panel"]
  },
  {
    id: "weekend-01",
    name: "The Holt Weekender",
    category: "Travel",
    price: 198,
    colors: ["#241910", "#7C5A3C", "#A8703D"],
    description: "A duffel built to be checked, gate-checked, or thrown over a shoulder. Wide mouth, sturdy base feet.",
    details: ["Detachable shoulder strap", "Wide-mouth zip opening", "Reinforced base feet"]
  }
];

/* ---------- STITCHED BAG SVG (signature icon, recolors per product) ---------- */
function bagSVG(color, animate) {
  const cls = animate ? "stitch-draw" : "";
  return `
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M55 70 L55 50 Q55 25 100 25 Q145 25 145 50 L145 70"
          stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" class="${cls}"/>
    <rect x="35" y="70" width="130" height="100" rx="6"
          fill="${color}" opacity="0.12" stroke="${color}" stroke-width="2.5"/>
    <line x1="35" y1="95" x2="165" y2="95" stroke="${color}" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.7"/>
    <circle cx="100" cy="120" r="4" fill="${color}"/>
  </svg>`;
}

/* ---------- AUTH SESSION ---------- */
function getToken() {
  return localStorage.getItem("satchel_token");
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("satchel_user"));
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

function saveSession(token, user) {
  localStorage.setItem("satchel_token", token);
  localStorage.setItem("satchel_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("satchel_token");
  localStorage.removeItem("satchel_user");
}

/* ---------- DYNAMIC HEADER AUTH SYNC ---------- */
function syncHeaderAuth() {
  const navRight = document.querySelector(".nav-right");
  if (!navRight) return;
  
  if (isLoggedIn()) {
    const user = getUser();
    const userName = user ? user.name.split(" ")[0] : "User";
    
    // Add Orders/Admin links to navigation if not present
    const navLinks = document.querySelector(".nav-links");
    if (navLinks) {
      if (!document.querySelector("#nav-orders-link")) {
        const liOrders = document.createElement("li");
        liOrders.id = "nav-orders-link";
        liOrders.innerHTML = `<a href="/orders.html">Orders</a>`;
        navLinks.appendChild(liOrders);
      }
      
      if (isAdmin() && !document.querySelector("#nav-admin-link")) {
        const liAdmin = document.createElement("li");
        liAdmin.id = "nav-admin-link";
        liAdmin.innerHTML = `<a href="/admin.html">Admin</a>`;
        navLinks.appendChild(liAdmin);
      }
    }
    
    navRight.innerHTML = `
      <span class="user-greeting" style="font-size:13px; color:var(--brass); letter-spacing:0.04em; text-transform:uppercase; margin-right:4px;">Hi, ${userName}</span>
      <a href="#" onclick="handleLogout(); return false;" class="cart-link" style="margin-right:12px;">Logout</a>
      <a href="/cart.html" class="cart-link">Bag <span class="cart-count">${cartCount()}</span></a>
    `;
  } else {
    // Remove Orders/Admin links if not logged in
    document.querySelector("#nav-orders-link")?.remove();
    document.querySelector("#nav-admin-link")?.remove();
    
    navRight.innerHTML = `
      <a href="/login.html" class="cart-link" style="margin-right:12px;">Login</a>
      <a href="/cart.html" class="cart-link">Bag <span class="cart-count">${cartCount()}</span></a>
    `;
  }
  updateCartBadge();
}

/* ---------- DYNAMIC PRODUCTS FETCH (with offline fallback) ---------- */
let DB_PRODUCTS = [];

async function initProducts() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      DB_PRODUCTS = await res.json();
      if (DB_PRODUCTS && DB_PRODUCTS.length > 0) {
        PRODUCTS.length = 0; // Clear mock array
        PRODUCTS.push(...DB_PRODUCTS); // Load database products
      }
    }
  } catch (err) {
    console.warn("Failed to fetch products from backend. Using static fallback.", err);
  }
}

/* ---------- CART (hybrid: local storage / authenticated database) ---------- */
const CART_KEY = "satchel_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

async function syncCartFromBackend() {
  if (!isLoggedIn()) return;
  try {
    const res = await fetch('/api/cart', {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if (res.ok) {
      const dbCart = await res.json();
      const localCompatibleCart = dbCart.map(item => ({
        id: item.product_id,
        qty: item.quantity,
        color: item.color,
        dbId: item.id
      }));
      localStorage.setItem(CART_KEY, JSON.stringify(localCompatibleCart));
      updateCartBadge();
    }
  } catch (err) {
    console.error("Failed to sync cart from backend:", err);
  }
}

async function syncGuestCart() {
  const localCart = getCart();
  if (localCart.length === 0) return;
  
  for (const item of localCart) {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ product_id: item.id, color: item.color, quantity: item.qty })
      });
    } catch (err) {
      console.error("Failed to sync guest cart item:", err);
    }
  }
  // Clear guest cart
  localStorage.setItem(CART_KEY, JSON.stringify([]));
}

async function addToCart(productId, qty = 1, color = null) {
  if (isLoggedIn()) {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ product_id: productId, color, quantity: qty })
      });
      if (res.ok) {
        await syncCartFromBackend();
        showToast("Added to bag");
        return;
      }
    } catch (err) {
      console.error("Failed to add to cart on server:", err);
    }
  }

  // Fallback to local storage (guest/offline)
  const cart = getCart();
  const existing = cart.find(item => item.id === productId && item.color === color);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty, color });
  }
  saveCart(cart);
  showToast("Added to bag");
}

function removeFromCart(productId, color) {
  let cart = getCart();
  cart = cart.filter(item => !(item.id === productId && item.color === color));
  saveCart(cart);
}

function updateQty(productId, color, qty) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId && i.color === color);
  if (item) item.qty = Math.max(1, qty);
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  document.querySelectorAll(".cart-count").forEach(el => {
    el.textContent = cartCount();
  });
}

/* ---------- TOAST ---------- */
function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------- HELPERS ---------- */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatPrice(n) {
  return "$" + Number(n).toFixed(2);
}

/* ---------- RENDER: PRODUCT GRID (index.html) ---------- */
function renderProductGrid(targetId, list = PRODUCTS) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.innerHTML = list.map(p => {
    const colorsList = Array.isArray(p.colors) ? p.colors : (p.colors ? p.colors.split(',') : ['#B08D57']);
    const mainColor = colorsList[0];
    return `
      <article class="card">
        <a href="/product.html?id=${p.id}" class="card-media">
          ${bagSVG(mainColor, false)}
        </a>
        <div class="card-body">
          <span class="card-cat">${p.category}</span>
          <a href="/product.html?id=${p.id}"><h3 class="card-name">${p.name}</h3></a>
          <p class="card-price">${formatPrice(p.price)}</p>
          <div class="card-actions">
            <button class="btn btn-primary" onclick="addToCart('${p.id}', 1, '${mainColor}')">Add to Bag</button>
            <a class="btn btn-outline" href="/product.html?id=${p.id}">View</a>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

/* ---------- RENDER: PRODUCT DETAIL (product.html) ---------- */
let _activeColor = null;

function renderProductDetail() {
  const id = getParam("id");
  const product = PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
  const colorsList = Array.isArray(product.colors) ? product.colors : (product.colors ? product.colors.split(',') : ['#B08D57']);
  _activeColor = colorsList[0];

  document.title = `${product.name} — Satchel & Co.`;

  const mediaEl = document.getElementById("product-media");
  if (mediaEl) mediaEl.innerHTML = bagSVG(_activeColor, true);

  const catEl = document.getElementById("product-cat");
  if (catEl) catEl.textContent = product.category;

  const catEl2 = document.getElementById("product-cat-2");
  if (catEl2) catEl2.textContent = product.category;

  const nameEl = document.getElementById("product-name");
  if (nameEl) nameEl.textContent = product.name;

  const priceEl = document.getElementById("product-price");
  if (priceEl) priceEl.textContent = formatPrice(product.price);

  const descEl = document.getElementById("product-desc");
  if (descEl) descEl.textContent = product.description;

  const swatchEl = document.getElementById("product-swatches");
  if (swatchEl) {
    swatchEl.innerHTML = colorsList.map((c, i) => `
      <button class="swatch ${i === 0 ? "active" : ""}" style="background:${c}"
        onclick="selectColor('${c}', this)" aria-label="Color option"></button>
    `).join("");
  }

  const metaEl = document.getElementById("product-meta");
  if (metaEl) {
    const detailsList = Array.isArray(product.details) ? product.details : (product.details ? product.details.split('|') : []);
    metaEl.innerHTML = detailsList.map(d => `<span>— ${d}</span>`).join("");
  }

  const addBtn = document.getElementById("add-to-cart-btn");
  if (addBtn) {
    addBtn.onclick = () => {
      const qty = parseInt(document.getElementById("qty-input").value, 10) || 1;
      addToCart(product.id, qty, _activeColor);
    };
  }

  renderRelated(product);
}

function selectColor(color, btnEl) {
  _activeColor = color;
  document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
  btnEl.classList.add("active");
  const mediaEl = document.getElementById("product-media");
  if (mediaEl) mediaEl.innerHTML = bagSVG(color, false);
}

function changeQty(delta) {
  const input = document.getElementById("qty-input");
  const val = Math.max(1, (parseInt(input.value, 10) || 1) + delta);
  input.value = val;
}

function renderRelated(current) {
  const el = document.getElementById("related-grid");
  if (!el) return;
  const related = PRODUCTS.filter(p => p.id !== current.id).slice(0, 4);
  renderProductGrid("related-grid", related);
}

/* ---------- RENDER: CART PAGE (cart.html) ---------- */
function renderCartPage() {
  const cart = getCart();
  const bodyEl = document.getElementById("cart-body");
  const emptyEl = document.getElementById("cart-empty");
  const tableWrap = document.getElementById("cart-table-wrap");
  if (!bodyEl) return;

  if (cart.length === 0) {
    if (tableWrap) tableWrap.style.display = "none";
    if (emptyEl) emptyEl.style.display = "block";
    document.getElementById("summary-box")?.style.setProperty("display", "none");
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (tableWrap) tableWrap.style.display = "block";
  document.getElementById("summary-box")?.style.removeProperty("display");

  let subtotal = 0;

  bodyEl.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return "";
    const lineTotal = product.price * item.qty;
    subtotal += lineTotal;
    const colorsList = Array.isArray(product.colors) ? product.colors : (product.colors ? product.colors.split(',') : ['#B08D57']);
    return `
      <tr>
        <td>
          <div class="cart-item-info">
            <div class="thumb">${bagSVG(item.color || colorsList[0], false)}</div>
            <div>
              <div class="cart-item-name">${product.name}</div>
              <div class="cart-item-cat">${product.category}</div>
              <div style="font-size:12px; color:var(--brass); margin-top:3px; display:flex; align-items:center; gap:6px;">
                Color: <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${item.color || colorsList[0]}; border:1px solid rgba(0,0,0,0.15)"></span>
              </div>
            </div>
          </div>
        </td>
        <td>${formatPrice(product.price)}</td>
        <td>
          <div class="qty-control">
            <button onclick="changeCartQty('${item.id}', '${item.color}', -1)">−</button>
            <input type="text" value="${item.qty}" readonly>
            <button onclick="changeCartQty('${item.id}', '${item.color}', 1)">+</button>
          </div>
        </td>
        <td>${formatPrice(lineTotal)}</td>
        <td><button class="remove-link" onclick="removeCartLine('${item.id}', '${item.color}')">Remove</button></td>
      </tr>
    `;
  }).join("");

  const shipping = subtotal > 0 ? 8 : 0;
  document.getElementById("sum-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("sum-shipping").textContent = formatPrice(shipping);
  document.getElementById("sum-total").textContent = formatPrice(subtotal + shipping);
}

async function changeCartQty(id, color, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.color === color);
  if (!item) return;
  const newQty = Math.max(1, item.qty + delta);
  
  if (isLoggedIn() && item.dbId) {
    try {
      const res = await fetch(`/api/cart/${item.dbId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) {
        await syncCartFromBackend();
        renderCartPage();
        return;
      }
    } catch (err) {
      console.error("Failed to update quantity on server:", err);
    }
  }
  
  item.qty = newQty;
  saveCart(cart);
  renderCartPage();
}

async function removeCartLine(id, color) {
  const cart = getCart();
  const item = cart.find(i => i.id === id && i.color === color);
  
  if (isLoggedIn() && item && item.dbId) {
    try {
      const res = await fetch(`/api/cart/${item.dbId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (res.ok) {
        await syncCartFromBackend();
        renderCartPage();
        return;
      }
    } catch (err) {
      console.error("Failed to delete cart item on server:", err);
    }
  }
  
  removeFromCart(id, color);
  renderCartPage();
}

async function handleCheckout() {
  if (!isLoggedIn()) {
    showToast("Please login to checkout");
    setTimeout(() => {
      window.location.href = "/login.html?redirect=cart.html";
    }, 1200);
    return;
  }
  
  const cart = getCart();
  if (cart.length === 0) {
    showToast("Your bag is empty");
    return;
  }
  
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Order placed successfully!");
      localStorage.setItem(CART_KEY, JSON.stringify([]));
      updateCartBadge();
      setTimeout(() => {
        window.location.href = "/orders.html";
      }, 1500);
    } else {
      showToast(data.error || "Checkout failed");
    }
  } catch (err) {
    showToast("Checkout connection error");
    console.error(err);
  }
}

/* ---------- AUTH SUBMISSION FLOWS ---------- */
async function handleLogin(email, password, redirectUrl = '/') {
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Login failed");
      return false;
    }
    
    saveSession(data.token, data.user);
    showToast("Welcome back!");
    
    await syncGuestCart();
    
    setTimeout(() => {
      if (data.user.role === 'admin') {
        window.location.href = '/admin.html';
      } else {
        window.location.href = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
      }
    }, 1000);
    return true;
  } catch (err) {
    showToast("Connection error");
    console.error(err);
    return false;
  }
}

async function handleRegister(name, email, password) {
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error || "Registration failed");
      return false;
    }
    
    saveSession(data.token, data.user);
    showToast("Account created!");
    
    await syncGuestCart();
    
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
    return true;
  } catch (err) {
    showToast("Connection error");
    console.error(err);
    return false;
  }
}

function handleLogout() {
  clearSession();
  localStorage.setItem(CART_KEY, JSON.stringify([]));
  showToast("Logged out");
  setTimeout(() => {
    window.location.href = '/';
  }, 1000);
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  await initProducts();
  
  if (isLoggedIn()) {
    await syncCartFromBackend();
  } else {
    updateCartBadge();
  }
  
  // Re-trigger renderers once async products load from the database
  if (document.getElementById("product-grid")) {
    renderProductGrid("product-grid");
  }
  if (document.getElementById("product-name")) {
    renderProductDetail();
  }
  if (document.getElementById("cart-body")) {
    renderCartPage();
  }
  
  syncHeaderAuth();
});
