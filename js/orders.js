/**
 * NEXUS COMMERCE - Orders & Tracking Controller
 * Manages customer order history, status filters, and the comprehensive tracking timeline visualizer.
 */

const OrdersApp = (() => {
  const formatCurrency = (val) => '$' + Number(val).toFixed(2);

  // MY ORDERS PAGE
  const initOrdersPage = () => {
    const container = document.getElementById('myOrdersContainer');
    if (!container) return;

    const user = Storage.getCurrentUser();
    if (!user) {
      window.location.href = 'login.html?redirect=orders.html';
      return;
    }

    const filterBtns = document.querySelectorAll('.order-filter-btn');
    let currentFilter = 'all';

    const renderOrders = () => {
      let orders = Storage.getUserOrders(user.id);

      if (currentFilter !== 'all') {
        orders = orders.filter(o => o.status.toLowerCase() === currentFilter.toLowerCase());
      }

      if (orders.length === 0) {
        container.innerHTML = `
          <div class="empty-orders-state">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <h3>No Orders Found</h3>
            <p>${currentFilter === 'all' ? "You haven't placed any orders yet. Start exploring our premium collection." : `You have no orders currently in "${currentFilter}" status.`}</p>
            <a href="products.html" class="btn btn-primary">Start Shopping</a>
          </div>
        `;
        return;
      }

      container.innerHTML = orders.map(order => `
        <div class="order-card" data-order-id="${order.id}">
          <div class="order-card-header">
            <div class="order-meta-group">
              <div class="meta-unit">
                <span class="meta-label">Order Number</span>
                <strong class="meta-value">${order.id}</strong>
              </div>
              <div class="meta-unit">
                <span class="meta-label">Date Placed</span>
                <span class="meta-value">${new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div class="meta-unit">
                <span class="meta-label">Total Amount</span>
                <strong class="meta-value">${formatCurrency(order.total)}</strong>
              </div>
            </div>
            <div class="order-status-group">
              <span class="status-pill status-${order.status.toLowerCase()}">${order.status}</span>
              <a href="order-tracking.html?orderId=${order.id}" class="btn btn-primary btn-sm">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Track Shipment
              </a>
            </div>
          </div>

          <div class="order-card-items">
            ${order.items.map(item => `
              <div class="order-item-inline">
                <img src="${item.image}" alt="${item.name}" class="order-item-img">
                <div class="order-item-info">
                  <h4 class="order-item-name">${item.name}</h4>
                  <div class="order-item-details-line">
                    <span>Qty: ${item.quantity}</span>
                    <span>•</span>
                    <span>${formatCurrency(item.price)} each</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="order-card-footer">
            <div class="shipping-to-info">
              <span>Delivering to: <strong>${order.shippingAddress.fullName}</strong> (${order.shippingAddress.city}, ${order.shippingAddress.state})</span>
            </div>
            <div class="order-quick-actions">
              <a href="order-tracking.html?orderId=${order.id}" class="btn btn-outline btn-sm">View Timeline</a>
            </div>
          </div>
        </div>
      `).join('');
    };

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-status-filter') || 'all';
        renderOrders();
      });
    });

    renderOrders();
  };

  // ORDER TRACKING PAGE
  const initTrackingPage = () => {
    const searchForm = document.getElementById('trackOrderForm');
    const resultContainer = document.getElementById('trackingResultContainer');
    const input = document.getElementById('trackOrderInput');

    if (!resultContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const initialOrderId = urlParams.get('orderId');
    const isJustPlaced = urlParams.get('placed') === 'true';

    const renderOrderDetails = (order) => {
      const stepProgression = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];
      let activeIndex = stepProgression.indexOf(order.status);
      if (activeIndex === -1) {
        activeIndex = order.status === 'Cancelled' ? -1 : 1;
      }

      resultContainer.innerHTML = `
        ${isJustPlaced ? `
          <div class="order-success-banner">
            <div class="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h3>Thank you for your order!</h3>
              <p>Your order <strong>${order.id}</strong> has been confirmed. A receipt has been dispatched to ${order.customerEmail || 'your email'}.</p>
            </div>
          </div>
        ` : ''}

        <div class="tracking-card">
          <div class="tracking-header">
            <div>
              <span class="tracking-subtitle">Tracking Details</span>
              <h2>Order ${order.id}</h2>
              <div class="tracking-tags">
                <span class="status-pill status-${order.status.toLowerCase()}">${order.status}</span>
                <span class="carrier-tag">${order.carrier || 'Nexus Express Priority'} — ${order.trackingNumber || 'NX-US'}</span>
              </div>
            </div>
            <div class="delivery-estimate-box">
              <span class="estimate-label">Estimated Delivery</span>
              <strong class="estimate-date">${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '3-5 Business Days'}</strong>
            </div>
          </div>

          <!-- Progress Stepper -->
          <div class="tracking-stepper">
            ${stepProgression.map((step, idx) => {
              const isCompleted = activeIndex >= idx;
              const isCurrent = activeIndex === idx;
              return `
                <div class="step-point ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                  <div class="step-dot">
                    ${isCompleted ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>` : (idx + 1)}
                  </div>
                  <span class="step-title">${step}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Activity Timeline -->
          <div class="timeline-section">
            <h3>Shipment Activity Log</h3>
            <div class="activity-timeline-list">
              ${(order.timeline || []).slice().reverse().map(event => `
                <div class="timeline-entry">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-header-row">
                      <strong class="event-status">${event.status}</strong>
                      <span class="event-time">${event.timestamp}</span>
                    </div>
                    <p class="event-desc">${event.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Details Grid (Shipping + Items + Totals) -->
          <div class="order-breakdown-grid">
            <!-- Shipping Info -->
            <div class="breakdown-card">
              <h3>Delivery Address</h3>
              <p><strong>${order.shippingAddress.fullName}</strong></p>
              <p>${order.shippingAddress.street}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
              <p>${order.shippingAddress.country || 'United States'}</p>
              <p class="mt-2 text-muted">Phone: ${order.shippingAddress.phone || 'N/A'}</p>
              <p class="text-muted">Payment: ${order.paymentMethod}</p>
            </div>

            <!-- Items & Financial Summary -->
            <div class="breakdown-card">
              <h3>Items Purchased (${order.items.reduce((s, i) => s + i.quantity, 0)})</h3>
              <div class="tracking-items-list">
                ${order.items.map(i => `
                  <div class="tracking-item-row">
                    <img src="${i.image}" alt="${i.name}" class="tracking-item-img">
                    <div class="tracking-item-name">
                      <strong>${i.name}</strong>
                      <small>Qty: ${i.quantity} × ${formatCurrency(i.price)}</small>
                    </div>
                    <strong>${formatCurrency(i.price * i.quantity)}</strong>
                  </div>
                `).join('')}
              </div>

              <div class="tracking-financials">
                <div class="fin-row"><span>Subtotal:</span> <span>${formatCurrency(order.subtotal)}</span></div>
                ${order.discount > 0 ? `<div class="fin-row discount-row"><span>Discount:</span> <span>-${formatCurrency(order.discount)}</span></div>` : ''}
                <div class="fin-row"><span>Shipping:</span> <span>${order.shippingFee === 0 ? 'Complimentary' : formatCurrency(order.shippingFee)}</span></div>
                <div class="fin-row"><span>Estimated Tax:</span> <span>${formatCurrency(order.tax)}</span></div>
                <hr class="summary-divider">
                <div class="fin-row fin-total"><span>Total Paid:</span> <strong>${formatCurrency(order.total)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) {
          App.showToast('Please enter an Order ID or Tracking Number.', 'warning');
          return;
        }

        const orders = Storage.getOrders();
        const found = orders.find(o => 
          o.id.toUpperCase() === query.toUpperCase() ||
          (o.trackingNumber && o.trackingNumber.toUpperCase() === query.toUpperCase())
        );

        if (found) {
          renderOrderDetails(found);
          // update url
          window.history.replaceState({}, document.title, `order-tracking.html?orderId=${found.id}`);
        } else {
          resultContainer.innerHTML = `
            <div class="empty-orders-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <h3>Order Not Found</h3>
              <p>We could not locate any order with reference "<strong>${query}</strong>". Please verify your Order Number (e.g. ORD-98214) and try again.</p>
            </div>
          `;
        }
      });
    }

    // Auto-run if query param present
    if (initialOrderId) {
      if (input) input.value = initialOrderId;
      const order = Storage.getOrderById(initialOrderId);
      if (order) {
        renderOrderDetails(order);
      } else {
        resultContainer.innerHTML = `
          <div class="empty-orders-state">
            <h3>Order Not Found</h3>
            <p>No records match order reference "<strong>${initialOrderId}</strong>".</p>
          </div>
        `;
      }
    } else {
      // Default initial view: show the most recent order if user has orders
      const user = Storage.getCurrentUser();
      if (user) {
        const userOrders = Storage.getUserOrders(user.id);
        if (userOrders.length > 0) {
          if (input) input.value = userOrders[0].id;
          renderOrderDetails(userOrders[0]);
        }
      }
    }
  };

  return {
    initOrdersPage,
    initTrackingPage
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  OrdersApp.initOrdersPage();
  OrdersApp.initTrackingPage();
});

