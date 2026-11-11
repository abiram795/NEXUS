/**
 * NEXUS COMMERCE - Checkout Controller
 * Manages checkout form validation, shipping address input, simulated payment method selection,
 * order summary calculation, and order submission.
 */

const CheckoutApp = (() => {
  const formatCurrency = (val) => '$' + Number(val).toFixed(2);

  const initCheckoutPage = () => {
    const form = document.getElementById('checkoutForm');
    const orderItemsContainer = document.getElementById('checkoutOrderItems');
    if (!form || !orderItemsContainer) return;

    const cart = Storage.getCart();
    if (cart.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    const appliedCoupon = localStorage.getItem('nexus_applied_coupon') || null;
    const totals = Storage.getCartTotals(appliedCoupon);

    // Pre-populate if customer is logged in
    const user = Storage.getCurrentUser();
    if (user) {
      const nameInput = document.getElementById('shipFullName');
      const emailInput = document.getElementById('shipEmail');
      const phoneInput = document.getElementById('shipPhone');
      const streetInput = document.getElementById('shipStreet');
      const cityInput = document.getElementById('shipCity');
      const stateInput = document.getElementById('shipState');
      const zipInput = document.getElementById('shipZip');
      const countryInput = document.getElementById('shipCountry');

      if (nameInput && !nameInput.value) nameInput.value = user.fullName || '';
      if (emailInput && !emailInput.value) emailInput.value = user.email || '';
      if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || '';

      if (user.address) {
        if (streetInput && !streetInput.value) streetInput.value = user.address.street || '';
        if (cityInput && !cityInput.value) cityInput.value = user.address.city || '';
        if (stateInput && !stateInput.value) stateInput.value = user.address.state || '';
        if (zipInput && !zipInput.value) zipInput.value = user.address.zip || '';
        if (countryInput && !countryInput.value) countryInput.value = user.address.country || 'United States';
      }
    }

    // Render Order Items Preview in sidebar
    orderItemsContainer.innerHTML = cart.map(item => `
      <div class="checkout-item-row">
        <div class="checkout-item-thumb-wrapper">
          <img src="${item.image}" alt="${item.name}" class="checkout-item-thumb">
          <span class="checkout-item-qty">${item.quantity}</span>
        </div>
        <div class="checkout-item-meta">
          <h4 class="checkout-item-name">${item.name}</h4>
          <span class="checkout-item-category">${item.category || ''}</span>
        </div>
        <div class="checkout-item-price">
          ${formatCurrency(item.price * item.quantity)}
        </div>
      </div>
    `).join('');

    // Render totals
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountRow = document.getElementById('checkoutDiscountRow');
    const discountVal = document.getElementById('checkoutDiscountVal');
    const shippingEl = document.getElementById('checkoutShipping');
    const taxEl = document.getElementById('checkoutTax');
    const totalEl = document.getElementById('checkoutTotal');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(totals.subtotal);
    if (shippingEl) shippingEl.textContent = totals.shippingFee === 0 ? 'Complimentary' : formatCurrency(totals.shippingFee);
    if (taxEl) taxEl.textContent = formatCurrency(totals.tax);
    if (totalEl) totalEl.textContent = formatCurrency(totals.total);

    if (totals.discount > 0 && discountRow && discountVal) {
      discountRow.style.display = 'flex';
      discountVal.textContent = `-${formatCurrency(totals.discount)}`;
    }

    // Payment Method Tabs
    const paymentRadioButtons = document.querySelectorAll('input[name="paymentMethod"]');
    const cardFields = document.getElementById('creditCardFields');
    const paypalNotice = document.getElementById('paypalNotice');
    const codNotice = document.getElementById('codNotice');

    const updatePaymentFields = () => {
      const selected = document.querySelector('input[name="paymentMethod"]:checked');
      if (!selected) return;

      const val = selected.value;
      if (cardFields) cardFields.style.display = val === 'card' ? 'block' : 'none';
      if (paypalNotice) paypalNotice.style.display = val === 'paypal' ? 'block' : 'none';
      if (codNotice) codNotice.style.display = val === 'cod' ? 'block' : 'none';
    };

    paymentRadioButtons.forEach(radio => {
      radio.addEventListener('change', updatePaymentFields);
    });
    updatePaymentFields();

    // Formatting card input helpers
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
        e.target.value = formatted;
      });
    }

    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
      cardExpiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) {
          e.target.value = val.substring(0, 2) + '/' + val.substring(2);
        } else {
          e.target.value = val;
        }
      });
    }

    // Submit Order
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('shipFullName').value.trim();
      const email = document.getElementById('shipEmail').value.trim();
      const phone = document.getElementById('shipPhone').value.trim();
      const street = document.getElementById('shipStreet').value.trim();
      const city = document.getElementById('shipCity').value.trim();
      const state = document.getElementById('shipState').value.trim();
      const zip = document.getElementById('shipZip').value.trim();
      const country = document.getElementById('shipCountry').value.trim();

      if (!fullName || !email || !phone || !street || !city || !state || !zip) {
        App.showToast('Please fill out all mandatory shipping details.', 'warning');
        return;
      }

      const selectedMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
      const paymentMethodType = selectedMethodEl ? selectedMethodEl.value : 'card';

      let paymentMethodLabel = 'Credit Card (Simulated)';
      if (paymentMethodType === 'card') {
        const cardName = document.getElementById('cardName').value.trim();
        const cardNum = document.getElementById('cardNumber').value.trim();
        const cardExp = document.getElementById('cardExpiry').value.trim();
        const cardCvv = document.getElementById('cardCvv').value.trim();

        if (!cardName || !cardNum || !cardExp || !cardCvv) {
          App.showToast('Please enter complete payment card details.', 'warning');
          return;
        }
        paymentMethodLabel = `Credit Card (ending in ${cardNum.slice(-4) || '8888'})`;
      } else if (paymentMethodType === 'paypal') {
        paymentMethodLabel = 'PayPal Express (Simulated)';
      } else {
        paymentMethodLabel = 'Cash on Delivery';
      }

      // Button processing state
      const submitBtn = document.getElementById('placeOrderBtn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-inline"></span>
          Authorizing & Placing Order...
        `;
      }

      // Simulate network / processor authorization delay
      setTimeout(() => {
        const orderPayload = {
          userId: user ? user.id : 'GUEST',
          items: cart,
          shippingAddress: {
            fullName,
            email,
            phone,
            street,
            city,
            state,
            zip,
            country
          },
          paymentMethod: paymentMethodLabel,
          subtotal: totals.subtotal,
          discount: totals.discount,
          couponCode: appliedCoupon,
          shippingFee: totals.shippingFee,
          tax: totals.tax,
          total: totals.total
        };

        const newOrder = Storage.createOrder(orderPayload);
        localStorage.removeItem('nexus_applied_coupon');

        App.showToast('Order confirmed! Redirecting to tracking...', 'success');
        setTimeout(() => {
          window.location.href = `order-tracking.html?orderId=${newOrder.id}&placed=true`;
        }, 800);
      }, 1000);
    });
  };

  return {
    initCheckoutPage
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('checkoutForm')) {
    CheckoutApp.initCheckoutPage();
  }
});

