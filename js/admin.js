/**
 * NEXUS COMMERCE - Administrator Controller
 * Powers Admin Dashboard metrics, Product Management (CRUD), and Order Fulfillment Status updates.
 */

const AdminApp = (() => {
  const formatCurrency = (val) => '$' + Number(val).toFixed(2);

  // Check Admin Authorization Guard
  const checkAdminAuth = () => {
    const admin = Storage.getAdminUser();
    if (!admin) {
      // Auto-authenticate as default admin if first time or redirect
      const users = Storage.getUsers();
      const defaultAdmin = users.find(u => u.role === 'admin');
      if (defaultAdmin) {
        Storage.setAdminUser(defaultAdmin);
        return defaultAdmin;
      } else {
        window.location.href = 'admin-login.html';
        return null;
      }
    }
    return admin;
  };

  // ADMIN DASHBOARD
  const initDashboard = () => {
    const container = document.getElementById('adminDashboardContainer');
    if (!container) return;

    checkAdminAuth();

    const orders = Storage.getOrders();
    const products = Storage.getProducts();

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrdersCount = orders.length;
    const totalProductsCount = products.length;
    const lowStockProducts = products.filter(p => p.stock <= 15);

    // Update KPI Metric Cards
    const revEl = document.getElementById('kpiTotalRevenue');
    const ordersEl = document.getElementById('kpiTotalOrders');
    const prodsEl = document.getElementById('kpiTotalProducts');
    const lowStockEl = document.getElementById('kpiLowStock');

    if (revEl) revEl.textContent = formatCurrency(totalRevenue);
    if (ordersEl) ordersEl.textContent = totalOrdersCount;
    if (prodsEl) prodsEl.textContent = totalProductsCount;
    if (lowStockEl) lowStockEl.textContent = lowStockProducts.length;

    // Render Recent Orders Table
    const recentOrdersTbody = document.getElementById('dashboardRecentOrdersTbody');
    if (recentOrdersTbody) {
      if (orders.length === 0) {
        recentOrdersTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No orders recorded yet.</td></tr>`;
      } else {
        recentOrdersTbody.innerHTML = orders.slice(0, 5).map(o => `
          <tr>
            <td><strong>${o.id}</strong></td>
            <td>
              <div><strong>${o.customerName}</strong></div>
              <small class="text-muted">${o.customerEmail}</small>
            </td>
            <td>${new Date(o.date).toLocaleDateString()}</td>
            <td><strong>${formatCurrency(o.total)}</strong></td>
            <td><span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span></td>
            <td>
              <a href="admin-orders.html?search=${o.id}" class="btn btn-outline btn-sm">Manage</a>
            </td>
          </tr>
        `).join('');
      }
    }

    // Render Low Stock Warning List
    const lowStockTbody = document.getElementById('dashboardLowStockTbody');
    if (lowStockTbody) {
      if (lowStockProducts.length === 0) {
        lowStockTbody.innerHTML = `<tr><td colspan="4" class="text-center text-success">All inventory levels healthy.</td></tr>`;
      } else {
        lowStockTbody.innerHTML = lowStockProducts.slice(0, 5).map(p => `
          <tr>
            <td>
              <div class="admin-prod-cell">
                <img src="${p.image}" alt="${p.name}" class="admin-prod-thumb">
                <span><strong>${p.name}</strong></span>
              </div>
            </td>
            <td>${p.category}</td>
            <td><span class="stock-warning-badge">${p.stock} units left</span></td>
            <td>
              <a href="admin-products.html?edit=${p.id}" class="btn btn-outline btn-sm">Restock</a>
            </td>
          </tr>
        `).join('');
      }
    }
  };

  // ADMIN PRODUCT MANAGEMENT (CRUD)
  const initProductManagement = () => {
    const tableBody = document.getElementById('adminProductsTableBody');
    if (!tableBody) return;

    checkAdminAuth();

    const searchInput = document.getElementById('adminProductSearch');
    const categoryFilter = document.getElementById('adminCategoryFilter');
    const addProductBtn = document.getElementById('openAddProductModalBtn');
    const modal = document.getElementById('productFormModal');
    const modalCloseBtn = document.getElementById('closeProductModalBtn');
    const productForm = document.getElementById('adminProductForm');
    const modalTitle = document.getElementById('productModalTitle');

    let currentEditingId = null;

    const renderProductsTable = () => {
      let products = Storage.getProducts();

      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      if (query) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }

      const cat = categoryFilter ? categoryFilter.value : 'all';
      if (cat && cat !== 'all') {
        products = products.filter(p => p.category.toLowerCase() === cat.toLowerCase());
      }

      if (products.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted" style="padding: 2.5rem;">
              No matching products found.
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = products.map(p => `
        <tr data-id="${p.id}">
          <td>
            <div class="admin-prod-cell">
              <img src="${p.image}" alt="${p.name}" class="admin-prod-thumb">
              <div>
                <strong>${p.name}</strong>
                <small class="text-muted d-block">${p.id}</small>
              </div>
            </div>
          </td>
          <td><span class="category-badge">${p.category}</span></td>
          <td><strong>${formatCurrency(p.price)}</strong></td>
          <td>
            <span class="${p.stock <= 10 ? 'text-danger font-bold' : ''}">
              ${p.stock} in stock
            </span>
          </td>
          <td>
            ${p.featured ? '<span class="badge-featured">Featured</span>' : '<span class="text-muted">Standard</span>'}
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-outline btn-sm edit-prod-btn" data-id="${p.id}" title="Edit product">Edit</button>
              <button class="btn btn-ghost btn-sm text-danger delete-prod-btn" data-id="${p.id}" title="Delete product">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');

      bindProductTableActions();
    };

    const bindProductTableActions = () => {
      // Edit
      document.querySelectorAll('.edit-prod-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          openEditModal(id);
        });
      });

      // Delete
      document.querySelectorAll('.delete-prod-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const prod = Storage.getProductById(id);
          if (confirm(`Are you sure you want to permanently remove "${prod ? prod.name : id}" from inventory?`)) {
            Storage.deleteProduct(id);
            App.showToast('Product successfully removed from catalog.', 'info');
            renderProductsTable();
          }
        });
      });
    };

    const openEditModal = (id) => {
      currentEditingId = id;
      const prod = Storage.getProductById(id);
      if (!prod) return;

      modalTitle.textContent = 'Edit Product: ' + prod.name;
      document.getElementById('prodName').value = prod.name;
      document.getElementById('prodCategory').value = prod.category;
      document.getElementById('prodPrice').value = prod.price;
      document.getElementById('prodOriginalPrice').value = prod.originalPrice || '';
      document.getElementById('prodStock').value = prod.stock;
      document.getElementById('prodImage').value = prod.image;
      document.getElementById('prodBadge').value = prod.badge || '';
      document.getElementById('prodFeatured').checked = !!prod.featured;
      document.getElementById('prodDescription').value = prod.description;

      modal.classList.add('open');
    };

    const openAddModal = () => {
      currentEditingId = null;
      modalTitle.textContent = 'Add New Inventory Product';
      productForm.reset();
      modal.classList.add('open');
    };

    const closeModal = () => {
      modal.classList.remove('open');
      currentEditingId = null;
    };

    if (addProductBtn) addProductBtn.addEventListener('click', openAddModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    // Save / Submit Form
    if (productForm) {
      productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('prodName').value.trim();
        const category = document.getElementById('prodCategory').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const originalPrice = parseFloat(document.getElementById('prodOriginalPrice').value) || null;
        const stock = parseInt(document.getElementById('prodStock').value, 10);
        const image = document.getElementById('prodImage').value.trim();
        const badge = document.getElementById('prodBadge').value.trim();
        const featured = document.getElementById('prodFeatured').checked;
        const description = document.getElementById('prodDescription').value.trim();

        if (!name || isNaN(price) || isNaN(stock) || !image) {
          App.showToast('Please fulfill all required product fields.', 'warning');
          return;
        }

        if (currentEditingId) {
          // Update
          Storage.updateProduct({
            id: currentEditingId,
            name,
            category,
            price,
            originalPrice,
            stock,
            image,
            badge,
            featured,
            description
          });
          App.showToast(`Product "${name}" updated successfully.`, 'success');
        } else {
          // Create
          Storage.addProduct({
            name,
            category,
            price,
            originalPrice,
            stock,
            image,
            badge,
            featured,
            description
          });
          App.showToast(`Product "${name}" created and published to customer store.`, 'success');
        }

        closeModal();
        renderProductsTable();
      });
    }

    if (searchInput) searchInput.addEventListener('input', renderProductsTable);
    if (categoryFilter) categoryFilter.addEventListener('change', renderProductsTable);

    // Check if URL has ?edit=ID
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
      setTimeout(() => openEditModal(editId), 100);
    }

    renderProductsTable();
  };

  // ADMIN ORDER MANAGEMENT & STATUS UPDATES
  const initOrderManagement = () => {
    const tableBody = document.getElementById('adminOrdersTableBody');
    if (!tableBody) return;

    checkAdminAuth();

    const statusFilter = document.getElementById('adminOrderStatusFilter');
    const searchInput = document.getElementById('adminOrderSearch');
    const modal = document.getElementById('orderStatusModal');
    const modalCloseBtn = document.getElementById('closeOrderModalBtn');
    const statusForm = document.getElementById('updateOrderStatusForm');
    const orderModalRef = document.getElementById('orderModalRef');
    const statusSelect = document.getElementById('orderNewStatusSelect');
    const noteInput = document.getElementById('orderStatusNote');

    let activeOrderId = null;

    const renderOrdersTable = () => {
      let orders = Storage.getOrders();

      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      if (query) {
        orders = orders.filter(o => 
          o.id.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.customerEmail.toLowerCase().includes(query)
        );
      }

      const st = statusFilter ? statusFilter.value : 'all';
      if (st && st !== 'all') {
        orders = orders.filter(o => o.status.toLowerCase() === st.toLowerCase());
      }

      if (orders.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted" style="padding: 2.5rem;">
              No matching orders found.
            </td>
          </tr>
        `;
        return;
      }

      tableBody.innerHTML = orders.map(o => `
        <tr data-id="${o.id}">
          <td><strong>${o.id}</strong></td>
          <td>
            <strong>${o.customerName}</strong>
            <small class="d-block text-muted">${o.customerEmail}</small>
            <small class="text-muted">${o.customerPhone || ''}</small>
          </td>
          <td>${new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
          <td>
            <span>${o.items.reduce((s, i) => s + i.quantity, 0)} items</span>
            <small class="d-block text-muted">${o.paymentMethod}</small>
          </td>
          <td><strong>${formatCurrency(o.total)}</strong></td>
          <td><span class="status-pill status-${o.status.toLowerCase()}">${o.status}</span></td>
          <td>
            <button class="btn btn-primary btn-sm update-status-btn" data-id="${o.id}">Update Status</button>
            <a href="order-tracking.html?orderId=${o.id}" target="_blank" class="btn btn-outline btn-sm">Tracking View</a>
          </td>
        </tr>
      `).join('');

      bindOrderActions();
    };

    const bindOrderActions = () => {
      document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const order = Storage.getOrderById(id);
          if (!order) return;

          activeOrderId = id;
          orderModalRef.textContent = `Order ${order.id} (${order.customerName})`;
          statusSelect.value = order.status;
          noteInput.value = '';

          modal.classList.add('open');
        });
      });
    };

    const closeModal = () => {
      modal.classList.remove('open');
      activeOrderId = null;
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

    if (statusForm) {
      statusForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!activeOrderId) return;

        const newStatus = statusSelect.value;
        const note = noteInput.value.trim();

        Storage.updateOrderStatus(activeOrderId, newStatus, note);
        App.showToast(`Order ${activeOrderId} status changed to "${newStatus}".`, 'success');
        closeModal();
        renderOrdersTable();
      });
    }

    if (statusFilter) statusFilter.addEventListener('change', renderOrdersTable);
    if (searchInput) searchInput.addEventListener('input', renderOrdersTable);

    // Initial query check
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchInput) {
      searchInput.value = searchParam;
    }

    renderOrdersTable();
  };

  return {
    initDashboard,
    initProductManagement,
    initOrderManagement
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.initDashboard();
  AdminApp.initProductManagement();
  AdminApp.initOrderManagement();
});

