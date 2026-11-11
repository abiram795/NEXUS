/**
 * NEXUS COMMERCE - Main Application UI Controller
 * Manages themes, header state, responsive drawer, notifications, quick actions, and active navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = (() => {
  // Theme handling
  const initTheme = () => {
    const savedTheme = Storage.getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcons(savedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        Storage.setTheme(next);
        updateThemeToggleIcons(next);
        App.showToast(`Switched to ${next} mode`, 'info');
      });
    });
  };

  const updateThemeToggleIcons = (theme) => {
    const sunIcons = document.querySelectorAll('.theme-icon-sun');
    const moonIcons = document.querySelectorAll('.theme-icon-moon');
    if (theme === 'dark') {
      sunIcons.forEach(el => el.style.display = 'block');
      moonIcons.forEach(el => el.style.display = 'none');
    } else {
      sunIcons.forEach(el => el.style.display = 'none');
      moonIcons.forEach(el => el.style.display = 'block');
    }
  };

  // Cart Badge Counter
  const updateCartBadge = () => {
    const badges = document.querySelectorAll('.cart-badge-count');
    const totals = Storage.getCartTotals();
    badges.forEach(b => {
      b.textContent = totals.itemCount;
      b.style.display = totals.itemCount > 0 ? 'inline-flex' : 'none';
    });
  };

  // Header User Dropdown & Auth UI
  const updateAuthUI = () => {
    const user = Storage.getCurrentUser();
    const admin = Storage.getAdminUser();

    const authContainer = document.querySelectorAll('.header-user-slot');
    authContainer.forEach(container => {
      if (user) {
        container.innerHTML = `
          <div class="user-dropdown-wrapper">
            <button class="user-dropdown-trigger" id="userDropdownTrigger" aria-label="Account Menu">
              <span class="user-avatar">${user.fullName.charAt(0).toUpperCase()}</span>
              <span class="user-name-short">${user.fullName.split(' ')[0]}</span>
              <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="user-dropdown-menu" id="userDropdownMenu">
              <div class="dropdown-header">
                <strong>${user.fullName}</strong>
                <small>${user.email}</small>
              </div>
              <hr class="dropdown-divider">
              <a href="account.html" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My Account
              </a>
              <a href="orders.html" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                My Orders
              </a>
              <a href="order-tracking.html" class="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Track Order
              </a>
              <a href="admin-dashboard.html" class="dropdown-item admin-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                Admin Portal
              </a>
              <hr class="dropdown-divider">
              <button class="dropdown-item logout-btn text-danger" id="logoutButton">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div class="auth-guest-links">
            <a href="login.html" class="btn btn-ghost btn-sm">Sign In</a>
            <a href="register.html" class="btn btn-primary btn-sm">Register</a>
          </div>
        `;
      }
    });

    // Wire up user dropdown toggle and click outside
    const trigger = document.getElementById('userDropdownTrigger');
    const menu = document.getElementById('userDropdownMenu');
    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
      });

      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !trigger.contains(e.target)) {
          menu.classList.remove('active');
        }
      });
    }

    // Wire up logout button
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Storage.logoutUser();
        App.showToast('You have signed out successfully.', 'info');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 600);
      });
    }
  };

  // Mobile Drawer Navigation
  const initMobileNav = () => {
    const hamburger = document.querySelector('.hamburger-btn');
    const drawer = document.querySelector('.mobile-nav-drawer');
    const backdrop = document.querySelector('.mobile-nav-backdrop');
    const closeBtn = document.querySelector('.drawer-close-btn');

    if (!hamburger || !drawer) return;

    const openDrawer = () => {
      drawer.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);
  };

  // Global Header Search
  const initSearch = () => {
    const searchForms = document.querySelectorAll('.header-search-form');
    searchForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="search"], input[name="q"]');
        if (input && input.value.trim()) {
          const query = encodeURIComponent(input.value.trim());
          window.location.href = `products.html?search=${query}`;
        }
      });
    });
  };

  // Active Link Highlighter
  const highlightActiveLink = () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  // Global Toast System
  const showToast = (message, type = 'info', title = '') => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;

    const iconMap = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.innerHTML = `
      <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
      <div class="toast-body">
        ${title ? `<h4 class="toast-title">${title}</h4>` : ''}
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close" aria-label="Close Notification">&times;</button>
      <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 3500);
  };

  // Global Quick Add to Cart & Wishlist delegated clicks
  const initDelegatedEvents = () => {
    document.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        const prodId = addBtn.getAttribute('data-add-to-cart');
        const qty = parseInt(addBtn.getAttribute('data-qty') || '1', 10);
        const res = Storage.addToCart(prodId, qty);
        if (res.success) {
          const prod = Storage.getProductById(prodId);
          App.showToast(`Added "${prod ? prod.name : 'Item'}" to your shopping cart.`, 'success');
        } else {
          App.showToast(res.message, 'warning');
        }
      }

      const wishBtn = e.target.closest('[data-toggle-wishlist]');
      if (wishBtn) {
        e.preventDefault();
        const prodId = wishBtn.getAttribute('data-toggle-wishlist');
        const added = Storage.toggleWishlist(prodId);
        wishBtn.classList.toggle('active', added);
        App.showToast(added ? 'Saved to your wishlist' : 'Removed from your wishlist', 'info');
      }
    });
  };

  return {
    init: () => {
      initTheme();
      updateCartBadge();
      updateAuthUI();
      initMobileNav();
      initSearch();
      highlightActiveLink();
      initDelegatedEvents();

      // Listen to cross-module events
      window.addEventListener('cartUpdated', updateCartBadge);
      window.addEventListener('userAuthChanged', updateAuthUI);
    },
    showToast
  };
})();

