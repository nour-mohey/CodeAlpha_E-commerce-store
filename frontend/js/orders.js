/* ============================================
   SATCHEL & CO — orders.js
   Orders page specific logic
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  if (!isLoggedIn()) {
    showToast("Please log in to view your orders.");
    setTimeout(() => {
      window.location.href = "/login.html?redirect=orders.html";
    }, 1000);
    return;
  }

  const container = document.getElementById("orders-container");

  try {
    const res = await fetch("/api/orders", {
      headers: { "Authorization": `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      throw new Error("Failed to load orders");
    }

    const orders = await res.json();

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path d="M55 70 L55 50 Q55 25 100 25 Q145 25 145 50 L145 70" stroke="#B08D57" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="6 5"/>
            <rect x="35" y="70" width="130" height="100" rx="6" fill="#B08D57" opacity="0.08" stroke="#B08D57" stroke-width="2"/>
          </svg>
          <h3>No orders found</h3>
          <p>You haven't placed any orders yet.</p>
          <a href="/#collection" class="btn btn-primary">Shop the Collection</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="orders-list">
        ${orders.map(order => {
          const date = new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric"
          });
          return `
            <div class="order-card">
              <div class="order-header">
                <div class="order-meta">
                  <div>
                    <span>Date Placed</span>
                    <strong>${date}</strong>
                  </div>
                  <div>
                    <span>Total Amount</span>
                    <strong>${formatPrice(order.total_amount)}</strong>
                  </div>
                  <div>
                    <span>Order ID</span>
                    <strong>#SATCHEL-${String(order.id).padStart(5, '0')}</strong>
                  </div>
                </div>
                <div>
                  <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
              </div>
              <table class="order-table">
                <tbody>
                  ${order.items.map(item => `
                    <tr>
                      <td>
                        <div class="order-item-info">
                          <div class="order-item-thumb">${bagSVG(item.color || "#B08D57", false)}</div>
                          <div>
                            <span class="order-item-cat">${item.product_category || "Leather Bag"}</span>
                            <div class="order-item-name">${item.product_name || "Custom Bag"}</div>
                            <div style="font-size:11px; color:var(--brass); margin-top:3px; display:flex; align-items:center; gap:6px;">
                              Color: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item.color || "#B08D57"}; border:1px solid rgba(0,0,0,0.1)"></span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style="text-align: right; font-size: 14px; color: #5b5046;">
                        ${item.quantity} × ${formatPrice(item.price)}
                      </td>
                      <td style="text-align: right; font-weight: 600; color: var(--espresso); font-size: 15px; width: 120px;">
                        ${formatPrice(item.price * item.quantity)}
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="empty-state">
        <h3>Oops, something went wrong</h3>
        <p>Could not retrieve your orders. Please try again later.</p>
        <a href="/orders.html" class="btn btn-primary">Retry</a>
      </div>
    `;
  }
});
