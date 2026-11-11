/**
 * NEXUS COMMERCE - Shopping Cart Controller
 * Handles cart item rendering, quantity increment/decrement, removals,
 * coupon application, and real-time total updates.
 */

const CartApp = (() => {
  let appliedCouponCode = localStorage.getItem('nexus_applied_coupon') || null;

  const formatCurrency = (val) => '$' + Number(val).toFixed(2);

  const renderCart = () => {
    const container = document.getElementById('cartPageContainer');
    if (!container) return;

    const cart = Storage.getCart();
    const totals = Storage.getCartTotals(appliedCouponCode);

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="empty-cart-card">
          <div class="empty-cart-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h2>Your Shopping Cart is Empty</h2>
          <p>Discover our curated collections of premium electronics, fashion, and home lifestyle essentials.</p>
          <a href="products.html" class="btn btn-primary btn-lg">Explore Catalog</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="cart-layout-grid">
        <!-- Items Table Column -->
        <div class="cart-items-column">
          <div class="cart-header-row">
            <h2>Shopping Bag (${totals.itemCount} item${totals.itemCount === 1 ? '' : 's'})</h2>
            <button class="btn btn-ghost btn-sm text-danger" id="clearCartBtn">Clear Entire Bag</button>
          </div>

          <div class="cart-items-list">
            ${cart.map(item => `
              <div class="cart-item-row" data-id="${item.id}">
                <div class="cart-item-thumb">
                  <a href="product-details.html?id=${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                  </a>
                </div>
                <div class="cart-item-details">
                  <span class="cart-item-category">${item.category || 'Product'}</span>
                  <h3 class="cart-item-name">
                    <a href="product-details.html?id=${item.id}">${item.name}</a>
                  </h3>
                  <div class="cart-item-unit-price">${formatCurrency(item.price)} each</div>
                </div>
                <div class="cart-item-stepper">
                  <button class="stepper-btn cart-dec-btn" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                  <input type="number" class="cart-qty-input" data-id="${item.id}" value="${item.quantity}" min="1" max="${item.stock || 99}" readonly>
                  <button class="stepper-btn cart-inc-btn" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <div class="cart-item-total">
                  ${formatCurrency(item.price * item.quantity)}
                </div>
                <button class="cart-remove-btn" data-id="${item.id}" title="Remove item" aria-label="Remove item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            `).join('')}
          </div>

          <div class="cart-footer-actions">
            <a href="products.html" class="btn btn-outline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              Continue Shopping
            </a>
          </div>
        </div>

        <!-- Summary Sticky Column -->
        <div class="cart-summary-column">
          <div class="summary-card">
            <h3 class="summary-title">Order Summary</h3>

            <!-- Coupon Box -->
            <div class="coupon-box">
              <label for="couponInput">Promotional Code</label>
              <div class="coupon-input-group">
                <input type="text" id="couponInput" class="form-control" placeholder="e.g. WELCOME10" value="${appliedCouponCode || ''}">
                <button class="btn btn-primary" id="applyCouponBtn">Apply</button>
              </div>
              <small class="coupon-hint">Available codes: <strong>WELCOME10</strong> (10% off), <strong>SAVE20</strong> (20% off $150+), <strong>LUXE50</strong> ($50 off $250+)</small>
            </div>

            <div class="summary-rows">
              <div class="summary-line">
                <span>Subtotal</span>
                <span>${formatCurrency(totals.subtotal)}</span>
              </div>

              ${totals.discount > 0 ? `
                <div class="summary-line discount-line">
                  <span>
                    Discount (${totals.coupon ? totals.coupon.code : 'Coupon'})
                    <button class="remove-coupon-btn" id="removeCouponBtn" title="Remove coupon">&times;</button>
                  </span>
                  <span>-${formatCurrency(totals.discount)}</span>
                </div>
              ` : ''}

              <div class="summary-line">
                <span>Estimated Shipping</span>
                <span>${totals.shippingFee === 0 ? '<strong class="text-success">Complimentary</strong>' : formatCurrency(totals.shippingFee)}</span>
              </div>

              <div class="summary-line">
                <span>Estimated Tax (8%)</span>
                <span>${formatCurrency(totals.tax)}</span>
              </div>

              <hr class="summary-divider">

              <div class="summary-line total-line">
                <strong>Estimated Total</strong>
                <strong class="total-amount">${formatCurrency(totals.total)}</strong>
              </div>
            </div>

            <a href="checkout.html" class="btn btn-primary btn-block btn-lg checkout-cta-btn">
              Proceed to Secure Checkout
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>

            <div class="trust-icons-row">
              <div class="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>SSL Encrypted Checkout</span>
              </div>
              <div class="trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Guaranteed Safe Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    bindCartEvents();
  };

  const bindCartEvents = () => {
    // Increment
    document.querySelectorAll('.cart-inc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cart = Storage.getCart();
        const item = cart.find(i => i.id === id);
        if (item) {
          const res = Storage.updateCartItemQuantity(id, item.quantity + 1);
          if (!res.success && res.message) {
            App.showToast(res.message, 'warning');
          } else {
            renderCart();
          }
        }
      });
    });

    // Decrement
    document.querySelectorAll('.cart-dec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const cart = Storage.getCart();
        const item = cart.find(i => i.id === id);
        if (item) {
          if (item.quantity > 1) {
            Storage.updateCartItemQuantity(id, item.quantity - 1);
            renderCart();
          } else {
            // Confirm removal
            if (confirm(`Remove "${item.name}" from your shopping bag?`)) {
              Storage.removeFromCart(id);
              App.showToast('Item removed from cart.', 'info');
              renderCart();
            }
          }
        }
      });
    });

    // Remove button
    document.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        Storage.removeFromCart(id);
        App.showToast('Item removed from cart.', 'info');
        renderCart();
      });
    });

    // Clear entire cart
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your entire shopping bag?')) {
          Storage.clearCart();
          appliedCouponCode = null;
          localStorage.removeItem('nexus_applied_coupon');
          App.showToast('Shopping bag cleared.', 'info');
          renderCart();
        }
      });
    }

    // Apply Coupon
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponInput = document.getElementById('couponInput');
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener('click', () => {
        const code = couponInput.value.trim();
        if (!code) {
          App.showToast('Please enter a coupon code.', 'warning');
          return;
        }

        const totals = Storage.getCartTotals();
        const check = Storage.validateCoupon(code, totals.subtotal);
        if (check.valid) {
          appliedCouponCode = code.toUpperCase();
          localStorage.setItem('nexus_applied_coupon', appliedCouponCode);
          App.showToast(`Coupon "${appliedCouponCode}" applied successfully!`, 'success');
          renderCart();
        } else {
          App.showToast(check.message, 'error');
        }
      });
    }

    // Remove Coupon
    const removeCouponBtn = document.getElementById('removeCouponBtn');
    if (removeCouponBtn) {
      removeCouponBtn.addEventListener('click', () => {
        appliedCouponCode = null;
        localStorage.removeItem('nexus_applied_coupon');
        App.showToast('Coupon removed.', 'info');
        renderCart();
      });
    }
  };

  return {
    init: () => {
      renderCart();
      window.addEventListener('cartUpdated', renderCart);
    },
    getAppliedCoupon: () => appliedCouponCode
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cartPageContainer')) {
    CartApp.init();
  }
});

