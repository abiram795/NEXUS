/**
 * NEXUS COMMERCE - Authentication & Account Controller
 * Manages customer login, registration, password validation, profile management, and admin authentication.
 */

const AuthApp = (() => {
  // CUSTOMER LOGIN
  const initCustomerLogin = () => {
    const form = document.getElementById('customerLoginForm');
    if (!form) return;

    // Prefill credentials for client authentication
    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passInput.value;

      if (!email || !password) {
        App.showToast('Please enter both email and password.', 'warning');
        return;
      }

      const res = Storage.loginUser(email, password);
      if (res.success) {
        App.showToast(`Welcome back, ${res.user.fullName}!`, 'success');
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect') || 'account.html';
        setTimeout(() => {
          window.location.href = redirect;
        }, 600);
      } else {
        App.showToast(res.message, 'error');
      }
    });
  };

  // CUSTOMER REGISTRATION
  const initCustomerRegister = () => {
    const form = document.getElementById('customerRegisterForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const phone = document.getElementById('regPhone').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const termsAccepted = document.getElementById('regTerms') ? document.getElementById('regTerms').checked : true;

      if (!fullName || !email || !password) {
        App.showToast('Please complete all required fields.', 'warning');
        return;
      }

      if (!termsAccepted) {
        App.showToast('Please accept the Terms of Service to continue.', 'warning');
        return;
      }

      if (password.length < 6) {
        App.showToast('Password must be at least 6 characters long.', 'warning');
        return;
      }

      if (password !== confirmPassword) {
        App.showToast('Passwords do not match. Please re-enter.', 'error');
        return;
      }

      const res = Storage.registerUser({
        fullName,
        email,
        phone,
        password
      });

      if (res.success) {
        App.showToast('Registration successful! Welcome to Nexus Luxe.', 'success');
        setTimeout(() => {
          window.location.href = 'account.html';
        }, 700);
      } else {
        App.showToast(res.message, 'error');
      }
    });
  };

  // ADMIN LOGIN
  const initAdminLogin = () => {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmail').value.trim();
      const password = document.getElementById('adminPassword').value;

      if (!email || !password) {
        App.showToast('Please enter administrator credentials.', 'warning');
        return;
      }

      const res = Storage.loginAdmin(email, password);
      if (res.success) {
        App.showToast('Administrator credentials verified. Access granted.', 'success');
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 600);
      } else {
        App.showToast(res.message, 'error');
      }
    });
  };

  // MY ACCOUNT PAGE CONTROLLER
  const initAccountPage = () => {
    const profileForm = document.getElementById('accountProfileForm');
    if (!profileForm) return;

    const user = Storage.getCurrentUser();
    if (!user) {
      App.showToast('Please sign in to view your account.', 'warning');
      window.location.href = 'login.html?redirect=account.html';
      return;
    }

    // Populate user profile elements
    const nameDisplay = document.getElementById('accountDisplayName');
    const emailDisplay = document.getElementById('accountDisplayEmail');
    const avatarBadge = document.getElementById('accountAvatarBadge');
    const memberSince = document.getElementById('accountMemberSince');

    if (nameDisplay) nameDisplay.textContent = user.fullName;
    if (emailDisplay) emailDisplay.textContent = user.email;
    if (avatarBadge) avatarBadge.textContent = user.fullName.charAt(0).toUpperCase();
    if (memberSince) memberSince.textContent = `Member since ${user.createdAt || '2026'}`;

    // Fill form inputs
    const fullNameInput = document.getElementById('accFullName');
    const emailInput = document.getElementById('accEmail');
    const phoneInput = document.getElementById('accPhone');
    const streetInput = document.getElementById('accStreet');
    const cityInput = document.getElementById('accCity');
    const stateInput = document.getElementById('accState');
    const zipInput = document.getElementById('accZip');
    const countryInput = document.getElementById('accCountry');

    if (fullNameInput) fullNameInput.value = user.fullName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';

    if (user.address) {
      if (streetInput) streetInput.value = user.address.street || '';
      if (cityInput) cityInput.value = user.address.city || '';
      if (stateInput) stateInput.value = user.address.state || '';
      if (zipInput) zipInput.value = user.address.zip || '';
      if (countryInput) countryInput.value = user.address.country || 'United States';
    }

    // Display order metrics
    const userOrders = Storage.getUserOrders(user.id);
    const totalSpent = userOrders.reduce((sum, ord) => sum + (ord.total || 0), 0);

    const ordersCountEl = document.getElementById('accTotalOrders');
    const spentAmountEl = document.getElementById('accTotalSpent');
    const activeOrdersEl = document.getElementById('accActiveOrders');

    if (ordersCountEl) ordersCountEl.textContent = userOrders.length;
    if (spentAmountEl) spentAmountEl.textContent = '$' + totalSpent.toFixed(2);
    if (activeOrdersEl) {
      const activeCount = userOrders.filter(o => o.status === 'Processing' || o.status === 'Shipped').length;
      activeOrdersEl.textContent = activeCount;
    }

    // Render recent orders preview in account page
    const recentOrdersContainer = document.getElementById('accRecentOrdersContainer');
    if (recentOrdersContainer) {
      if (userOrders.length === 0) {
        recentOrdersContainer.innerHTML = '<p class="text-muted">You have no order history yet.</p>';
      } else {
        recentOrdersContainer.innerHTML = `
          <div class="orders-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${userOrders.slice(0, 3).map(ord => `
                  <tr>
                    <td><strong>${ord.id}</strong></td>
                    <td>${new Date(ord.date).toLocaleDateString()}</td>
                    <td><span class="status-pill status-${ord.status.toLowerCase()}">${ord.status}</span></td>
                    <td><strong>$${ord.total.toFixed(2)}</strong></td>
                    <td>
                      <a href="order-tracking.html?orderId=${ord.id}" class="btn btn-outline btn-sm">Track</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    // Handle profile update
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const updated = {
        fullName: fullNameInput.value.trim(),
        phone: phoneInput.value.trim(),
        address: {
          street: streetInput ? streetInput.value.trim() : '',
          city: cityInput ? cityInput.value.trim() : '',
          state: stateInput ? stateInput.value.trim() : '',
          zip: zipInput ? zipInput.value.trim() : '',
          country: countryInput ? countryInput.value.trim() : 'United States'
        }
      };

      const res = Storage.updateUserProfile(updated);
      if (res.success) {
        App.showToast('Profile information updated successfully.', 'success');
        if (nameDisplay) nameDisplay.textContent = res.user.fullName;
        if (avatarBadge) avatarBadge.textContent = res.user.fullName.charAt(0).toUpperCase();
      } else {
        App.showToast(res.message, 'error');
      }
    });

    // Account Sign Out button
    const accSignOutBtn = document.getElementById('accSignOutBtn');
    if (accSignOutBtn) {
      accSignOutBtn.addEventListener('click', () => {
        Storage.logoutUser();
        App.showToast('Signed out successfully.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      });
    }
  };

  return {
    initCustomerLogin,
    initCustomerRegister,
    initAdminLogin,
    initAccountPage
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  AuthApp.initCustomerLogin();
  AuthApp.initCustomerRegister();
  AuthApp.initAdminLogin();
  AuthApp.initAccountPage();
});
