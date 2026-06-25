/* ============================================
   SATCHEL & CO — admin.js
   Admin dashboard specific logic
   ============================================ */

let productsList = [];
let ordersList = [];
let usersList = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    window.location.href = "/login.html?redirect=admin.html";
    return;
  }
  if (!isAdmin()) {
    alert("Access Denied: Administrators only.");
    window.location.href = "/";
    return;
  }

  document.getElementById("add-product-trigger").addEventListener("click", () => {
    openProductModalForAdd();
  });

  document.getElementById("product-form").addEventListener("submit", handleProductFormSubmit);

  await loadProductsData();
});

async function switchTab(event, tabName) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });

  document.querySelectorAll(".tab-content").forEach(content => {
    content.style.display = "none";
  });

  event.currentTarget.classList.add("active");
  document.getElementById(`tab-${tabName}`).style.display = "block";

  const addBtn = document.getElementById("add-product-trigger");

  if (tabName === "products") {
    addBtn.style.display = "inline-flex";
    await loadProductsData();
  } else {
    addBtn.style.display = "none";

    if (tabName === "orders") {
      await loadOrdersData();
    } else if (tabName === "users") {
      await loadUsersData();
    }
  }
}

async function loadProductsData() {
  try {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error();
    productsList = await res.json();
    renderProductsTab();
  } catch {
    showToast("Error loading products catalog");
  }
}

function renderProductsTab() {
  const totalCount = productsList.length;
  const lowStock = productsList.filter(p => p.stock < 10).length;
  const totalStock = productsList.reduce((sum, p) => sum + p.stock, 0);

  document.getElementById("stat-products-count").textContent = totalCount;
  document.getElementById("stat-low-stock").textContent = lowStock;
  document.getElementById("stat-total-stock").textContent = totalStock;

  const tbody = document.getElementById("products-table-body");
  if (productsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:40px;">No products in database.</td></tr>`;
    return;
  }

  tbody.innerHTML = productsList.map(p => {
    const colorsList = Array.isArray(p.colors) ? p.colors : (p.colors ? p.colors.split(',') : []);
    return `
      <tr>
        <td><code style="font-weight:600; color:var(--cognac);">${p.id}</code></td>
        <td>
          <div style="font-weight:600; color:var(--espresso);">${p.name}</div>
          <div style="font-size:12px; color:#7c6f62; max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${p.description}">${p.description}</div>
        </td>
        <td><span class="card-cat">${p.category}</span></td>
        <td>
          <div class="admin-colors-row">
            ${colorsList.map(c => `<span class="admin-color-dot" style="background:${c.trim()}" title="${c.trim()}"></span>`).join("")}
          </div>
        </td>
        <td style="font-weight:600;">${formatPrice(p.price)}</td>
        <td>
          <div class="stock-editor">
            <input type="number" class="stock-input" value="${p.stock}" id="stock-input-${p.id}">
            <button class="btn btn-outline btn-sm" onclick="saveStockInline('${p.id}')">Update</button>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openProductModalForEdit('${p.id}')">Edit</button>
            <button class="btn btn-outline btn-sm" onclick="deleteProduct('${p.id}')" style="color:#9a3b1e; border-color:#9a3b1e;">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function saveStockInline(productId) {
  const p = productsList.find(item => item.id === productId);
  if (!p) return;
  const input = document.getElementById(`stock-input-${productId}`);
  const newStock = parseInt(input.value, 10);
  if (isNaN(newStock) || newStock < 0) {
    showToast("Invalid stock level");
    return;
  }

  try {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        name: p.name,
        category: p.category,
        price: p.price,
        description: p.description,
        colors: Array.isArray(p.colors) ? p.colors.join(',') : p.colors,
        details: Array.isArray(p.details) ? p.details.join('|') : p.details,
        stock: newStock
      })
    });
    if (res.ok) {
      showToast("Stock level updated");
      p.stock = newStock;
      renderProductsTab();
    } else {
      const d = await res.json();
      showToast(d.error || "Update failed");
    }
  } catch {
    showToast("Connection failed");
  }
}

async function deleteProduct(productId) {
  if (!confirm(`Are you absolutely sure you want to delete product "${productId}"?\nThis cannot be undone.`)) return;

  try {
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (res.ok) {
      showToast("Product deleted from database");
      productsList = productsList.filter(p => p.id !== productId);
      renderProductsTab();
    } else {
      const d = await res.json();
      showToast(d.error || "Deletion failed");
    }
  } catch {
    showToast("Connection failed");
  }
}

async function loadOrdersData() {
  try {
    const res = await fetch("/api/admin/orders", {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error();
    ordersList = await res.json();
    renderOrdersTab();
  } catch {
    showToast("Error loading orders database");
  }
}

function renderOrdersTab() {
  const totalCount = ordersList.length;
  const revenue = ordersList.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
  const activeOrders = ordersList.filter(o => o.status === 'pending' || o.status === 'paid' || o.status === 'shipped').length;

  document.getElementById("stat-orders-count").textContent = totalCount;
  document.getElementById("stat-revenue").textContent = formatPrice(revenue);
  document.getElementById("stat-active-orders").textContent = activeOrders;

  const tbody = document.getElementById("orders-table-body");
  if (ordersList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:40px;">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = ordersList.map(o => {
    const date = new Date(o.created_at).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
    const itemsCount = o.items.reduce((sum, item) => sum + item.quantity, 0);
    return `
      <tr>
        <td><code style="font-weight:600; color:var(--cognac);">#SATCHEL-${String(o.id).padStart(5, '0')}</code></td>
        <td>
          <div style="font-weight:600; color:var(--espresso);">${o.user_name}</div>
          <div style="font-size:12px; color:#6b5f53;">${o.user_email}</div>
        </td>
        <td>${date}</td>
        <td class="trigger-cell" onclick="toggleOrderExpansion(${o.id})">${itemsCount} items (View details)</td>
        <td style="font-weight:600; color:var(--espresso);">${formatPrice(o.total_amount)}</td>
        <td>
          <select class="status-select ${o.status}" onchange="updateOrderStatus(${o.id}, this)">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
      <tr class="order-expand-row" id="order-expand-${o.id}">
        <td colspan="6">
          <div class="order-detail-box">
            <h4 style="margin-bottom:12px; font-family:var(--font-body); font-size:12px; text-transform:uppercase; letter-spacing:0.06em; color:var(--brass);">Packing Slip Details</h4>
            <div class="order-items-list">
              ${o.items.map(item => `
                <div class="order-item-line">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <div style="font-weight:600; color:var(--espresso);">${item.product_name || item.product_id}</div>
                    <div style="font-size:12px; color:#7c6f62;">Category: ${item.product_category || "Bag"}</div>
                    <div style="font-size:11px; color:var(--brass); display:flex; align-items:center; gap:6px;">
                      Color: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item.color || "#B08D57"}; border:1px solid rgba(0,0,0,0.1)"></span>
                    </div>
                  </div>
                  <div style="font-weight:600;">
                    ${item.quantity} unit(s) @ ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function toggleOrderExpansion(orderId) {
  const row = document.getElementById(`order-expand-${orderId}`);
  row.classList.toggle("show");
}

async function updateOrderStatus(orderId, selectEl) {
  const newStatus = selectEl.value;
  selectEl.className = `status-select ${newStatus}`;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast(`Order status set to ${newStatus}`);
      const o = ordersList.find(item => item.id === orderId);
      if (o) o.status = newStatus;
    } else {
      const d = await res.json();
      showToast(d.error || "Update failed");
    }
  } catch {
    showToast("Connection failed");
  }
}

async function loadUsersData() {
  try {
    const res = await fetch("/api/admin/users", {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) throw new Error();
    usersList = await res.json();
    renderUsersTab();
  } catch {
    showToast("Error loading users database");
  }
}

function renderUsersTab() {
  const customersCount = usersList.filter(u => u.role === 'customer').length;
  const adminsCount = usersList.filter(u => u.role === 'admin').length;

  document.getElementById("stat-customers-count").textContent = customersCount;
  document.getElementById("stat-admins-count").textContent = adminsCount;

  const tbody = document.getElementById("users-table-body");
  tbody.innerHTML = usersList.map(u => {
    const date = new Date(u.created_at).toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric"
    });
    return `
      <tr>
        <td><code style="color:var(--brass);">${u.id}</code></td>
        <td style="font-weight:600; color:var(--espresso);">${u.name}</td>
        <td>${u.email}</td>
        <td>${date}</td>
        <td>
          <span class="status-badge ${u.role === 'admin' ? 'status-delivered' : 'status-paid'}">${u.role}</span>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="toggleUserRole(${u.id}, '${u.role}')">
            Change Role to ${u.role === 'admin' ? 'Customer' : 'Admin'}
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

async function toggleUserRole(userId, currentRole) {
  const targetRole = currentRole === 'admin' ? 'customer' : 'admin';
  if (!confirm(`Are you sure you want to change the role of user #${userId} to "${targetRole}"?`)) return;

  try {
    const res = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({ role: targetRole })
    });
    if (res.ok) {
      showToast("User role updated successfully");
      const self = getUser();
      if (self && self.id === userId) {
        showToast("You updated your own role. Please re-login to sync permissions.", 3500);
      }
      await loadUsersData();
    } else {
      const d = await res.json();
      showToast(d.error || "Role update failed");
    }
  } catch {
    showToast("Connection failed");
  }
}

function openProductModalForAdd() {
  document.getElementById("modal-title-text").textContent = "Add New Product";
  document.getElementById("form-mode").value = "add";
  document.getElementById("id-field-container").style.display = "block";
  document.getElementById("prod-id").disabled = false;
  document.getElementById("prod-id").value = "";
  document.getElementById("prod-name").value = "";
  document.getElementById("prod-category").value = "Tote";
  document.getElementById("prod-price").value = "";
  document.getElementById("prod-desc").value = "";
  document.getElementById("prod-colors").value = "";
  document.getElementById("prod-stock").value = "50";
  document.getElementById("prod-details").value = "";
  document.getElementById("product-modal").classList.add("show");
}

function openProductModalForEdit(productId) {
  const p = productsList.find(item => item.id === productId);
  if (!p) return;

  document.getElementById("modal-title-text").textContent = "Edit Product Details";
  document.getElementById("form-mode").value = "edit";
  document.getElementById("id-field-container").style.display = "none";
  document.getElementById("prod-id").disabled = true;
  document.getElementById("prod-id").value = p.id;
  document.getElementById("prod-name").value = p.name;
  document.getElementById("prod-category").value = p.category;
  document.getElementById("prod-price").value = p.price;
  document.getElementById("prod-desc").value = p.description;

  const colorsList = Array.isArray(p.colors) ? p.colors.join(",") : p.colors;
  document.getElementById("prod-colors").value = colorsList;
  document.getElementById("prod-stock").value = p.stock;

  const detailsList = Array.isArray(p.details) ? p.details.join("|") : p.details;
  document.getElementById("prod-details").value = detailsList;

  document.getElementById("product-modal").classList.add("show");
}

function closeModal() {
  document.getElementById("product-modal").classList.remove("show");
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const mode = document.getElementById("form-mode").value;
  const id = document.getElementById("prod-id").value.trim();
  const name = document.getElementById("prod-name").value.trim();
  const category = document.getElementById("prod-category").value;
  const price = parseFloat(document.getElementById("prod-price").value);
  const description = document.getElementById("prod-desc").value.trim();
  const colors = document.getElementById("prod-colors").value.trim();
  const stock = parseInt(document.getElementById("prod-stock").value, 10);
  const details = document.getElementById("prod-details").value.trim();

  if (isNaN(price) || isNaN(stock)) {
    showToast("Invalid price or stock level");
    return;
  }

  const payload = { id, name, category, price, description, colors, stock, details };
  const url = mode === "add" ? "/api/admin/products" : `/api/admin/products/${id}`;
  const method = mode === "add" ? "POST" : "PUT";

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(payload)
    });

    const d = await res.json();
    if (res.ok) {
      showToast(mode === "add" ? "New product cataloged successfully" : "Product details updated successfully");
      closeModal();
      await loadProductsData();
    } else {
      showToast(d.error || "Save operation failed");
    }
  } catch {
    showToast("Connection failed");
  }
}
