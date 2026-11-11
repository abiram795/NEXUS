/**
 * NEXUS COMMERCE - Products Controller
 * Handles product catalog rendering, search, category & price filtering, sorting,
 * and the complete product details page experience (gallery, specs, review submission).
 */

const ProductsApp = (() => {
  // Helpers
  const formatCurrency = (val) => '$' + Number(val).toFixed(2);

  const renderStars = (rating) => {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHtml += `<svg class="star-icon star-filled" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      } else if (i === fullStars + 1 && hasHalf) {
        starsHtml += `<svg class="star-icon star-half" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      } else {
        starsHtml += `<svg class="star-icon star-empty" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
      }
    }
    return `<span class="rating-stars">${starsHtml}</span>`;
  };

  const createProductCard = (product) => {
    const isWishlisted = Storage.isInWishlist(product.id);
    const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-media">
          ${product.badge ? `<span class="product-badge badge-primary">${product.badge}</span>` : ''}
          ${discountPercent > 0 ? `<span class="product-badge badge-discount">-${discountPercent}%</span>` : ''}
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" data-toggle-wishlist="${product.id}" title="Save to wishlist" aria-label="Save to wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
          <a href="product-details.html?id=${product.id}" class="product-img-link">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
          </a>
          <div class="product-quick-actions">
            <button class="btn btn-primary btn-sm btn-block" data-add-to-cart="${product.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Add to Cart
            </button>
          </div>
        </div>
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-title">
            <a href="product-details.html?id=${product.id}">${product.name}</a>
          </h3>
          <div class="product-rating-row">
            ${renderStars(product.rating)}
            <span class="rating-val">${product.rating.toFixed(1)}</span>
            <span class="review-count">(${product.reviewCount})</span>
          </div>
          <div class="product-price-row">
            <span class="current-price">${formatCurrency(product.price)}</span>
            ${product.originalPrice ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
          </div>
          <div class="product-stock-status ${product.stock <= 5 ? 'stock-low' : 'stock-in'}">
            ${product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In Stock') : 'Out of Stock'}
          </div>
        </div>
      </div>
    `;
  };

  // PRODUCTS CATALOG PAGE CONTROLLER
  const initCatalogPage = () => {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category') || 'all';
    const initialSearch = urlParams.get('search') || '';

    // Filter controls
    const searchInput = document.getElementById('catalogSearchInput');
    const categorySelect = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    const priceRangeInput = document.getElementById('priceRange');
    const priceRangeLabel = document.getElementById('priceRangeLabel');
    const stockOnlyCheckbox = document.getElementById('inStockOnly');
    const ratingFilterSelect = document.getElementById('ratingFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const countElement = document.getElementById('productsCount');

    if (searchInput && initialSearch) {
      searchInput.value = initialSearch;
    }
    if (categorySelect && initialCategory !== 'all') {
      categorySelect.value = initialCategory;
    }

    const applyFiltersAndRender = () => {
      let products = Storage.getProducts();

      // Search Filter
      const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
      if (searchVal) {
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchVal) ||
          p.category.toLowerCase().includes(searchVal) ||
          p.description.toLowerCase().includes(searchVal)
        );
      }

      // Category Filter
      const catVal = categorySelect ? categorySelect.value : 'all';
      if (catVal && catVal !== 'all') {
        products = products.filter(p => p.category.toLowerCase() === catVal.toLowerCase());
      }

      // Price Filter
      if (priceRangeInput) {
        const maxPrice = parseFloat(priceRangeInput.value);
        if (priceRangeLabel) priceRangeLabel.textContent = `$${maxPrice}`;
        products = products.filter(p => p.price <= maxPrice);
      }

      // In Stock Only
      if (stockOnlyCheckbox && stockOnlyCheckbox.checked) {
        products = products.filter(p => p.stock > 0);
      }

      // Rating Filter
      if (ratingFilterSelect && ratingFilterSelect.value !== 'all') {
        const minRating = parseFloat(ratingFilterSelect.value);
        products = products.filter(p => p.rating >= minRating);
      }

      // Sorting
      const sortVal = sortSelect ? sortSelect.value : 'featured';
      if (sortVal === 'price-low') {
        products.sort((a, b) => a.price - b.price);
      } else if (sortVal === 'price-high') {
        products.sort((a, b) => b.price - a.price);
      } else if (sortVal === 'rating') {
        products.sort((a, b) => b.rating - a.rating);
      } else if (sortVal === 'name-asc') {
        products.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        // default / featured
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      }

      // Render
      if (countElement) {
        countElement.textContent = `Showing ${products.length} product${products.length === 1 ? '' : 's'}`;
      }

      if (products.length === 0) {
        grid.innerHTML = `
          <div class="empty-catalog-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <h3>No products found</h3>
            <p>Try refining your search terms or clearing current filter selections.</p>
            <button class="btn btn-outline" id="clearSearchBtn">Reset All Filters</button>
          </div>
        `;
        const clearBtn = document.getElementById('clearSearchBtn');
        if (clearBtn) {
          clearBtn.addEventListener('click', resetFilters);
        }
      } else {
        grid.innerHTML = products.map(p => createProductCard(p)).join('');
      }
    };

    const resetFilters = () => {
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'all';
      if (sortSelect) sortSelect.value = 'featured';
      if (priceRangeInput) {
        priceRangeInput.value = 600;
        if (priceRangeLabel) priceRangeLabel.textContent = '$600';
      }
      if (stockOnlyCheckbox) stockOnlyCheckbox.checked = false;
      if (ratingFilterSelect) ratingFilterSelect.value = 'all';
      
      // Clear URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      applyFiltersAndRender();
    };

    if (searchInput) searchInput.addEventListener('input', applyFiltersAndRender);
    if (categorySelect) categorySelect.addEventListener('change', applyFiltersAndRender);
    if (sortSelect) sortSelect.addEventListener('change', applyFiltersAndRender);
    if (priceRangeInput) priceRangeInput.addEventListener('input', applyFiltersAndRender);
    if (stockOnlyCheckbox) stockOnlyCheckbox.addEventListener('change', applyFiltersAndRender);
    if (ratingFilterSelect) ratingFilterSelect.addEventListener('change', applyFiltersAndRender);
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);

    // Initial render
    applyFiltersAndRender();
  };

  // PRODUCT DETAILS PAGE CONTROLLER
  const initDetailsPage = () => {
    const container = document.getElementById('productDetailsContainer');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('id');

    if (!prodId) {
      container.innerHTML = `
        <div class="error-notice-card">
          <h2>Product Not Specified</h2>
          <p>Please browse our catalog to select an authentic item.</p>
          <a href="products.html" class="btn btn-primary">Return to Catalog</a>
        </div>
      `;
      return;
    }

    const product = Storage.getProductById(prodId);
    if (!product) {
      container.innerHTML = `
        <div class="error-notice-card">
          <h2>Product Not Found</h2>
          <p>The product identifier "${prodId}" does not exist in our catalog or may have been unlisted.</p>
          <a href="products.html" class="btn btn-primary">Browse All Products</a>
        </div>
      `;
      return;
    }

    // Set page title
    document.title = `${product.name} | Nexus Commerce`;

    const isWishlisted = Storage.isInWishlist(product.id);
    const discountPercent = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    const galleryImages = (product.gallery && product.gallery.length) ? product.gallery : [product.image];

    // Build specs HTML
    let specsHtml = '<table class="specs-table"><tbody>';
    if (product.specs) {
      for (const [key, val] of Object.entries(product.specs)) {
        specsHtml += `<tr><th>${key}</th><td>${val}</td></tr>`;
      }
    }
    specsHtml += '</tbody></table>';

    // Build reviews HTML
    const renderReviewList = () => {
      if (!product.reviews || product.reviews.length === 0) {
        return '<p class="text-muted">No reviews yet. Be the first to share your experience!</p>';
      }
      return product.reviews.map(r => `
        <div class="review-item">
          <div class="review-header">
            <div class="review-author-info">
              <span class="review-avatar">${r.author.charAt(0).toUpperCase()}</span>
              <div>
                <strong>${r.author}</strong>
                <span class="review-date">${r.date}</span>
              </div>
            </div>
            ${renderStars(r.rating)}
          </div>
          ${r.title ? `<h4 class="review-title">${r.title}</h4>` : ''}
          <p class="review-body">${r.comment}</p>
        </div>
      `).join('');
    };

    container.innerHTML = `
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav">
        <a href="index.html">Home</a>
        <span class="breadcrumb-separator">/</span>
        <a href="products.html">Products</a>
        <span class="breadcrumb-separator">/</span>
        <a href="products.html?category=${encodeURIComponent(product.category)}">${product.category}</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">${product.name}</span>
      </nav>

      <div class="product-details-grid">
        <!-- Gallery -->
        <div class="gallery-column">
          <div class="main-image-wrapper">
            <img id="mainProductImage" src="${galleryImages[0]}" alt="${product.name}" class="main-product-img">
            ${product.badge ? `<span class="product-badge badge-primary details-badge">${product.badge}</span>` : ''}
          </div>
          <div class="thumbnail-row">
            ${galleryImages.map((img, idx) => `
              <button class="thumbnail-btn ${idx === 0 ? 'active' : ''}" data-thumb-src="${img}" aria-label="Product thumbnail ${idx + 1}">
                <img src="${img}" alt="Thumbnail ${idx + 1}">
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Details Info -->
        <div class="info-column">
          <span class="product-category-tag">${product.category}</span>
          <h1 class="details-product-title">${product.name}</h1>

          <div class="details-rating-row">
            ${renderStars(product.rating)}
            <span class="rating-number">${product.rating.toFixed(1)}</span>
            <span class="review-badge-link" id="jumpToReviewsLink">(${product.reviewCount} customer reviews)</span>
            <span class="sku-tag">SKU: ${product.id}</span>
          </div>

          <div class="details-price-row">
            <span class="details-current-price">${formatCurrency(product.price)}</span>
            ${product.originalPrice ? `<span class="details-original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
            ${discountPercent > 0 ? `<span class="discount-pill">Save ${discountPercent}%</span>` : ''}
          </div>

          <div class="details-stock-row">
            <span class="stock-indicator-dot ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}"></span>
            <strong>${product.stock > 0 ? (product.stock <= 5 ? `Low Stock: Only ${product.stock} items available` : 'In Stock & Ready to Ship') : 'Currently Out of Stock'}</strong>
          </div>

          <p class="details-short-desc">${product.description}</p>

          <hr class="divider">

          <!-- Purchase Controls -->
          <div class="purchase-controls">
            <div class="quantity-picker-wrapper">
              <label for="detailQuantityInput">Quantity:</label>
              <div class="quantity-stepper">
                <button type="button" class="stepper-btn" id="qtyDecrementBtn" aria-label="Decrease quantity">-</button>
                <input type="number" id="detailQuantityInput" value="1" min="1" max="${product.stock}" readonly>
                <button type="button" class="stepper-btn" id="qtyIncrementBtn" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div class="action-buttons-group">
              <button class="btn btn-primary btn-lg" id="detailsAddToCartBtn" ${product.stock <= 0 ? 'disabled' : ''}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                Add to Cart
              </button>
              <button class="btn btn-accent btn-lg" id="detailsBuyNowBtn" ${product.stock <= 0 ? 'disabled' : ''}>
                Buy Now
              </button>
              <button class="btn btn-outline btn-icon-only ${isWishlisted ? 'active' : ''}" id="detailsWishlistBtn" title="Add to Wishlist" aria-label="Add to Wishlist">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
            </div>
          </div>

          <!-- Trust Badges -->
          <div class="product-guarantee-bar">
            <div class="guarantee-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <span>Complimentary insured shipping over $100</span>
            </div>
            <div class="guarantee-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>2-Year Full Manufacturer Warranty</span>
            </div>
            <div class="guarantee-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              <span>30-Day Hassle-Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Information Tabs -->
      <div class="product-tabs-section" id="tabsSection">
        <div class="tabs-header">
          <button class="tab-button active" data-tab-target="#tabDescription">Description</button>
          <button class="tab-button" data-tab-target="#tabSpecs">Specifications</button>
          <button class="tab-button" data-tab-target="#tabReviews">Reviews (${product.reviews ? product.reviews.length : 0})</button>
        </div>

        <div class="tab-content active" id="tabDescription">
          <h3>Product Overview</h3>
          <p class="tab-prose">${product.description}</p>
        </div>

        <div class="tab-content" id="tabSpecs">
          <h3>Technical Specifications</h3>
          ${specsHtml}
        </div>

        <div class="tab-content" id="tabReviews">
          <div class="reviews-wrapper">
            <div class="reviews-header-row">
              <div>
                <h3>Customer Verified Reviews</h3>
                <p>Overall rating: <strong>${product.rating.toFixed(1)} / 5.0</strong> based on ${product.reviewCount} customer ratings.</p>
              </div>
              <button class="btn btn-outline" id="toggleReviewFormBtn">Write a Review</button>
            </div>

            <!-- Add Review Form (collapsible) -->
            <form class="review-submission-form" id="newReviewForm" style="display: none;">
              <h4>Submit Your Review</h4>
              <div class="form-row">
                <div class="form-group">
                  <label for="reviewAuthor">Your Name *</label>
                  <input type="text" id="reviewAuthor" class="form-control" required placeholder="e.g. Jordan Smith">
                </div>
                <div class="form-group">
                  <label for="reviewRating">Rating *</label>
                  <select id="reviewRating" class="form-control" required>
                    <option value="5">5 Stars - Outstanding</option>
                    <option value="4">4 Stars - Very Good</option>
                    <option value="3">3 Stars - Average</option>
                    <option value="2">2 Stars - Disappointing</option>
                    <option value="1">1 Star - Unsatisfactory</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label for="reviewTitle">Review Title</label>
                <input type="text" id="reviewTitle" class="form-control" placeholder="Summary of your experience">
              </div>
              <div class="form-group">
                <label for="reviewComment">Review Content *</label>
                <textarea id="reviewComment" class="form-control" rows="4" required placeholder="What did you like or dislike about this product?"></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Publish Review</button>
            </form>

            <div class="reviews-list" id="reviewsListContainer">
              ${renderReviewList()}
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Grid -->
      <section class="related-products-section">
        <h2 class="section-title">You May Also Like</h2>
        <div class="product-grid" id="relatedProductsGrid"></div>
      </section>
    `;

    // Interactive Thumbnail Switcher
    const mainImg = document.getElementById('mainProductImage');
    const thumbBtns = container.querySelectorAll('.thumbnail-btn');
    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        thumbBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const newSrc = btn.getAttribute('data-thumb-src');
        if (mainImg) mainImg.src = newSrc;
      });
    });

    // Quantity Stepper
    const qtyInput = document.getElementById('detailQuantityInput');
    const decBtn = document.getElementById('qtyDecrementBtn');
    const incBtn = document.getElementById('qtyIncrementBtn');

    if (decBtn && incBtn && qtyInput) {
      decBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10);
        if (val > 1) {
          qtyInput.value = val - 1;
        }
      });
      incBtn.addEventListener('click', () => {
        let val = parseInt(qtyInput.value, 10);
        if (val < product.stock) {
          qtyInput.value = val + 1;
        } else {
          App.showToast(`Maximum stock limit (${product.stock}) reached.`, 'warning');
        }
      });
    }

    // Add to Cart
    const addBtn = document.getElementById('detailsAddToCartBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        const res = Storage.addToCart(product.id, qty);
        if (res.success) {
          App.showToast(`Added ${qty} × "${product.name}" to your cart!`, 'success');
        } else {
          App.showToast(res.message, 'warning');
        }
      });
    }

    // Buy Now
    const buyNowBtn = document.getElementById('detailsBuyNowBtn');
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        const res = Storage.addToCart(product.id, qty);
        if (res.success) {
          window.location.href = 'checkout.html';
        } else {
          App.showToast(res.message, 'warning');
        }
      });
    }

    // Wishlist Toggle
    const wishBtn = document.getElementById('detailsWishlistBtn');
    if (wishBtn) {
      wishBtn.addEventListener('click', () => {
        const added = Storage.toggleWishlist(product.id);
        wishBtn.classList.toggle('active', added);
        const svg = wishBtn.querySelector('svg');
        if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
        App.showToast(added ? 'Saved to your wishlist' : 'Removed from your wishlist', 'info');
      });
    }

    // Jump to Reviews
    const jumpLink = document.getElementById('jumpToReviewsLink');
    if (jumpLink) {
      jumpLink.addEventListener('click', () => {
        const tabBtn = container.querySelector('[data-tab-target="#tabReviews"]');
        if (tabBtn) tabBtn.click();
        const tabsSec = document.getElementById('tabsSection');
        if (tabsSec) tabsSec.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Tab Navigation
    const tabButtons = container.querySelectorAll('.tab-button');
    const tabContents = container.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab-target');
        const targetContent = container.querySelector(targetId);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    // Toggle Review Form
    const toggleFormBtn = document.getElementById('toggleReviewFormBtn');
    const reviewForm = document.getElementById('newReviewForm');
    if (toggleFormBtn && reviewForm) {
      toggleFormBtn.addEventListener('click', () => {
        const isHidden = reviewForm.style.display === 'none';
        reviewForm.style.display = isHidden ? 'block' : 'none';
        toggleFormBtn.textContent = isHidden ? 'Cancel Review' : 'Write a Review';
      });

      // Submit Review
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const author = document.getElementById('reviewAuthor').value.trim();
        const rating = parseInt(document.getElementById('reviewRating').value, 10);
        const title = document.getElementById('reviewTitle').value.trim();
        const comment = document.getElementById('reviewComment').value.trim();

        if (!author || !comment) {
          App.showToast('Please complete all required review fields.', 'warning');
          return;
        }

        const newReview = {
          author,
          rating,
          date: new Date().toISOString().split('T')[0],
          title,
          comment
        };

        product.reviews = product.reviews || [];
        product.reviews.unshift(newReview);
        product.reviewCount = (product.reviewCount || 0) + 1;
        // Recalculate average rating
        const sum = product.reviews.reduce((acc, r) => acc + r.rating, 0);
        product.rating = parseFloat((sum / product.reviews.length).toFixed(1));

        Storage.updateProduct(product);
        App.showToast('Thank you! Your review has been recorded.', 'success');

        // Reset & hide form
        reviewForm.reset();
        reviewForm.style.display = 'none';
        toggleFormBtn.textContent = 'Write a Review';

        // Re-render review list
        const listContainer = document.getElementById('reviewsListContainer');
        if (listContainer) listContainer.innerHTML = renderReviewList();
      });
    }

    // Render Related Products
    const relatedGrid = document.getElementById('relatedProductsGrid');
    if (relatedGrid) {
      const allProds = Storage.getProducts();
      const related = allProds
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 4);

      if (related.length === 0) {
        // Fallback to any 4 products
        const fallback = allProds.filter(p => p.id !== product.id).slice(0, 4);
        relatedGrid.innerHTML = fallback.map(p => createProductCard(p)).join('');
      } else {
        relatedGrid.innerHTML = related.map(p => createProductCard(p)).join('');
      }
    }
  };

  // HOMEPAGE FEATURED SECTION CONTROLLER
  const initHomePage = () => {
    const featuredGrid = document.getElementById('featuredProductsGrid');
    if (featuredGrid) {
      const products = Storage.getProducts();
      const featured = products.filter(p => p.featured).slice(0, 8);
      featuredGrid.innerHTML = (featured.length ? featured : products.slice(0, 8))
        .map(p => createProductCard(p))
        .join('');
    }

    const newArrivalsGrid = document.getElementById('newArrivalsGrid');
    if (newArrivalsGrid) {
      const products = Storage.getProducts();
      const newArrivals = products.slice().reverse().slice(0, 4);
      newArrivalsGrid.innerHTML = newArrivals.map(p => createProductCard(p)).join('');
    }
  };

  return {
    initCatalogPage,
    initDetailsPage,
    initHomePage,
    createProductCard,
    renderStars
  };
})();

